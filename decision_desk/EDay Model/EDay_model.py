import polars as pl 
import datetime 
import requests
import numpy as np
from sklearn.linear_model import LinearRegression
from scipy.stats import norm

#----- PART 1: SCRAPING AND CLEANING DATA ------
# Reading in Locally-Hosted Datasets ######

ids = pl.read_csv("cleaned_data/Locally-Hosted Data/DDHQ_api_calls.csv", null_values=["NA"]).select("ddhq_id").to_numpy().flatten()

past_county_data = (
    pl.read_csv("cleaned_data/Locally-Hosted Data/historical_county.csv", null_values=["NA"])
    .with_columns(pl.when(pl.col('state') == "AK")
        .then("")
        .otherwise(pl.col("fips"))
        .alias("fips")
    )
    .with_columns(pl.col("district").cast(pl.Utf8))
    .drop("county")
)

when_to_expect_results = (
    pl.read_csv("cleaned_data/Locally-Hosted Data/When_to_expect_results.csv", null_values=["NA"])
    .select([
        "Abbreviate", "District", "Office_type", "When to call", "Race to watch", "Last Poll Close"
    ])
    .rename({
        "Abbreviate": "state",
        "District": "district",
        "Office_type": "office_type",
        "When to call": "when_to_call",
        "Last Poll Close": "poll_close",
        "Race to watch": "race_to_watch"
    })
    .with_columns([
        pl.col("race_to_watch").fill_null(False)
    ])
)

past_race_data = pl.read_csv("cleaned_data/Locally-Hosted Data/historical_elections.csv", null_values=["NA"])

county_demographics = pl.read_csv("cleaned_data/Locally-Hosted Data/County_Demographics.csv", null_values=["NA"])

this_time_2020 = (pl.read_csv("cleaned_data/Locally-Hosted Data/Same_Time_2020.csv", null_values=["NA"]) 
    .with_columns([
        pl.lit("President").alias("office_type"),
        pl.lit(0).alias("district")
    ])
)
this_time_2020 = (this_time_2020
    .select(["office_type", "district"] + this_time_2020.columns)
    .rename({col: f"{col}_same_time" for col in this_time_2020.columns if col in ["biden_pct", "votes"]})
    .filter(pl.col("timestamp") < datetime.now())
    #.filter(pl.col("timestamp") < datetime.now(timezone.utc) - timedelta(years=4, days=2)) # Nov 3 2020 to Nov 5 2024
    .group_by(["office_type", "state", "district"])
    .agg(pl.all().sort_by("timestamp").last())   
    .explode(["office_type", "state", "district"])
    .select(["office_type", "district", "state", "biden_pct_same_time", "votes_same_time"])
    .unique()
)

maine_townships_counties = (pl.read_csv("cleaned_data/Locally-Hosted Data/Maine_Townships_to+Counties.csv", null_values=["NA"])
    .with_columns(pl.col("fips").cast(pl.Int32).apply(lambda x: f"{x:03d}").alias("fips"))
)

###### FETCHING DATA, AT THIS POINT NOTHING LOCALLY IS NEEDED ###### 
def scrape_data(ddhq_id):
    url = f"https://embed-api.ddhq.io/v1/races/{ddhq_id}"
    print(url)

    response = requests.get(url)
    if response.status_code != 200:
        print("Error on http response")
        return None

    json_data = response.json()

    test_data = json_data.get("test_data")
    office_type = json_data.get("office")
    candidate_dataset = json_data.get("candidates")

    if not candidate_dataset:
        return None

    candidate_dataset = pl.DataFrame(candidate_dataset).with_columns([
        pl.col("cand_id").cast(pl.Utf8),
        pl.concat_str(["first_name", "last_name"], separator=" ").alias("name")
    ])

    year = json_data.get("year")
    state = json_data.get("state")
    district = "0" if json_data.get("district") is None else json_data.get("district")
    last_updated = pl.Series([json_data.get("last_updated")]).str.strptime(pl.Datetime, fmt="%Y-%m-%dT%H:%M:%S%z").dt.convert_time_zone("America/New_York")[0]
    uncontested = json_data.get("uncontested")

    try:
        vcus = pl.DataFrame(json_data.get("vcus")).rename({"vcu": "county"}).melt(
            id_vars=["county", "fips"],
            value_vars=[col for col in json_data.get("vcus")[0].keys() if col.isdigit()],
            variable_name="candidate_id",
            value_name="votes"
        ).with_columns([
            pl.col("candidate_id").str.extract(r"(\d+)").cast(pl.Utf8),
            pl.col("votes").cast(pl.Int64)
        ]).groupby("candidate_id").agg([
            pl.sum("votes").alias("candidate_votes")
        ])

        #If state is Maine, we need to fix it here instead of later!
        #We combine townships into counties
        if state == "ME":
            county_votes_dataset = vcus.rename({"county": "town"}).join(
                maine_townships_counties, on="town"
            ).groupby(["county", "fips", "vote_type", "candidate_id", "candidate_votes"]).agg([
                pl.sum("votes").alias("votes"),
                pl.sum("total").alias("total"),
                pl.sum("reporting").alias("reporting")
            ]).join(candidate_dataset, left_on="candidate_id", right_on="cand_id").groupby("party_name").agg([
                pl.max("candidate_votes").alias("candidate_votes")
            ]).filter(pl.col("party_name").is_in(["Democratic", "Republican", "Independent", "Green"])).pivot(
                index=["fips", "county", "total", "reporting", "vote_type"],
                columns="party_name",
                values="votes",
                aggregate_function="sum"
            ).with_columns([
                pl.lit(ddhq_id).alias("ddhq_id"),
                pl.lit(year).alias("year"),
                pl.lit(state).alias("state"),
                pl.lit(district).alias("district"),
                pl.lit(last_updated).alias("last_updated"),
                pl.lit(office_type).alias("office_type"),
                pl.lit(uncontested).alias("uncontested"),
                pl.lit(test_data).alias("test_data")
            ])
        else:
            county_votes_dataset = vcus.join(candidate_dataset, left_on="candidate_id", right_on="cand_id").groupby("party_name").agg([
                pl.max("candidate_votes").alias("candidate_votes")
            ]).filter(pl.col("party_name").is_in(["Democratic", "Republican", "Independent", "Green"])).pivot(
                index=["fips", "county", "total", "reporting", "vote_type"],
                columns="party_name",
                values="votes",
                aggregate_function="sum"
            ).with_columns([
                pl.lit(ddhq_id).alias("ddhq_id"),
                pl.lit(year).alias("year"),
                pl.lit(state).alias("state"),
                pl.lit(district).alias("district"),
                pl.lit(last_updated).alias("last_updated"),
                pl.lit(office_type).alias("office_type"),
                pl.lit(uncontested).alias("uncontested"),
                pl.lit(test_data).alias("test_data")
            ])

        return county_votes_dataset
    except Exception as e:
        print(f"Here's the original error message for id {ddhq_id}: {e}")
        return None

scraped_list = list(map(scrape_data, ids))

# Combine the results into a single DataFrame
scraped_df = pl.concat([df for df in scraped_list if df is not None])

# Further processing
scraped_df = scraped_df.with_columns([
    pl.col("total_returned").fill_none(0),
    pl.col("total_returned").alias("total_returned"),
    (pl.col("Democratic_votes") / pl.col("total_returned") * 100).alias("Democratic_votes_percent"),
    (pl.col("Republican_votes") / pl.col("total_returned") * 100).alias("Republican_votes_percent"),
    (pl.col("Independent_votes") / pl.col("total_returned") * 100).alias("Independent_votes_percent"),
    (pl.col("Green_votes") / pl.col("total_returned") * 100).alias("Green_votes_percent"),
    (pl.col("Democratic_votes_percent") - pl.col("Republican_votes_percent")).alias("margin_pct"),
    (pl.col("Democratic_votes") - pl.col("Republican_votes")).alias("margin_votes")
]).groupby(["year", "fips", "office_type", "state", "district"]).agg([
    pl.sum("total_returned").alias("total_returned"),
    pl.sum("Democratic_votes").alias("Democratic_votes"),
    pl.sum("Republican_votes").alias("Republican_votes"),
    pl.sum("Independent_votes").alias("Independent_votes"),
    pl.sum("Green_votes").alias("Green_votes"),
    pl.sum("Democratic_votes_percent").alias("Democratic_votes_percent"),
    pl.sum("Republican_votes_percent").alias("Republican_votes_percent"),
    pl.sum("Independent_votes_percent").alias("Independent_votes_percent"),
    pl.sum("Green_votes_percent").alias("Green_votes_percent"),
    pl.sum("margin_pct").alias("margin_pct"),
    pl.sum("margin_votes").alias("margin_votes")
])

performance_vs_president = (
    scraped_df
    .filter(pl.col("office_type") != "House")
    .select(["office_type", "state", "district", "county", "margin_pct"])
    .pivot(
        index=["state", "district", "county"],
        columns="office_type",
        values="margin_pct"
    )
    .with_columns([
        (pl.col("Senate") - pl.col("President")).alias("Senate"),
        (pl.col("Governor") - pl.col("President")).alias("Governor"),
        pl.col("district").cast(pl.Utf8)
    ])
    .select(pl.exclude("President"))
    .melt(
        id_vars=["state", "district", "county"],
        value_vars=["Senate", "Governor"],
        variable_name="office_type",
        value_name="performance_vs_president"
    )
)

pre_model_county = scraped_df.with_columns([
    pl.when((pl.col("state") == "VT") & (pl.col("county") == "Chittenden")).then("007").otherwise(pl.col("fips")).alias("fips"),
    pl.when((pl.col("state") == "NH") & (pl.col("county") == "Sullivan")).then("019").otherwise(pl.col("fips")).alias("fips")
]).join(past_county_data, on=["office_type", "district", "state", "fips"], how="left").filter(
    ~((pl.col("margin_pct_1").is_null()) & (pl.col("office_type").is_in(["President", "Senate"])) & (pl.col("state").is_in(["HI", "MO", "MD", "NE"])))
).with_columns([
    (pl.col("margin_pct") - pl.col("margin_pct_1")).alias("swing")
]).join(performance_vs_president, on=["state", "district", "county", "office_type"], how="left")

pre_model_race = pre_model_county.with_columns([
    (pl.col("Democratic_votes") + pl.col("Republican_votes") + pl.col("Independent_votes") + pl.col("Green_votes")).alias("total_votes"),
    (pl.col("pct_absentee") * pl.col("total_votes")).alias("total_absentee_votes"),
    (pl.col("absentee_margin") * pl.col("total_absentee_votes")).alias("absentee_margin_votes")
]).groupby(["office_type", "state", "district", "Democratic_name", "Republican_name", "Independent_name"]).agg([
    pl.sum("reporting").alias("precincts_reporting"),
    pl.sum("total").alias("total_precincts"),
    pl.sum("total_votes").alias("total_votes"),
    pl.sum("Democratic_votes").alias("dem_votes"),
    pl.sum("Republican_votes").alias("rep_votes"),
    pl.sum("Independent_votes").alias("ind_votes"),
    pl.sum("Green_votes").alias("green_votes"),
    pl.sum("total_absentee_votes").alias("total_absentee_votes"),
    pl.sum("absentee_margin_votes").alias("absentee_margin_votes")
]).with_columns([
    pl.col("district").cast(pl.Int64),
    (pl.col("precincts_reporting") / pl.col("total_precincts") * 100).alias("pct_reporting"),
    (pl.col("dem_votes") - pl.col("rep_votes")).alias("margin_votes"),
    ((pl.col("dem_votes") - pl.col("rep_votes")) / pl.col("total_votes") * 100).alias("margin_pct"),
    (pl.col("total_absentee_votes") / pl.col("total_votes") * 100).alias("pct_absentee"),
    (pl.col("absentee_margin_votes") / pl.col("total_absentee_votes") * 100).alias("absentee_margin")
]).join(past_race_data, on=["office_type", "state", "district"], how="left")

pre_model_county = pre_model_county.filter(
    ~((pl.col("margin_pct_1").is_null()) & (pl.col("office_type").is_in(["President", "Senate"])))
)

live_data = pre_model_county.filter(pl.col("office_type") == "President").with_columns([
    (pl.col("margin_votes") / pl.col("margin_pct") * 100).alias("total_votes"),
    (pl.col("margin_votes_1") / pl.col("margin_pct_1") * 100).alias("total_votes_2020"),
    pl.col("Democratic_votes").alias("dem_votes"),
    pl.col("Republican_votes").alias("rep_votes"),
    ((0.98 * pl.col("total_votes_2020") + pl.col("margin_votes_1")) / 2).alias("dem_votes_2020"),
    ((0.98 * pl.col("total_votes_2020") - pl.col("margin_votes_1")) / 2).alias("rep_votes_2020"),
    pl.col("pct_reporting").fill_none(0).alias("pct_reporting")
]).select([
    "fips", "state", "pct_reporting", "total_votes", "dem_votes", "rep_votes", "total_votes_2020", "dem_votes_2020", "rep_votes_2020"
])

county_and_dems = live_data.join(county_demographics, on=["fips", "state"], how="left").filter(
    ~pl.col("total_population").is_null()
)

# Filter and mutate finished counties
finished_counties = (
    county_and_dems
    .filter((pl.col("pct_reporting") == 100) & (~pl.col("state").is_in(["NH", "VT", "MA", "ME", "DC"])))
    .with_columns([
        pl.when(pl.col("total_votes").is_null()).then(pl.col("dem_votes") + pl.col("rep_votes")).otherwise(pl.col("total_votes")).alias("total_votes"),
        (pl.col("total_votes") / pl.col("total_votes_2020")).log().alias("vote_differential"),
        (100 * ((pl.col("dem_votes") - pl.col("rep_votes")) / pl.col("total_votes") - (pl.col("dem_votes_2020") - pl.col("rep_votes_2020")) / pl.col("total_votes_2020"))).alias("margin_differential")
    ])
    .select(["vote_differential", "margin_differential"] + [col for col in county_and_dems.columns if col.startswith("total_population") or col.startswith("proportion_less_than_hs_asian")])
)

# Get turnout for 2020 finished counties
turnout_2020_finished_counties = (
    county_and_dems
    .filter((pl.col("pct_reporting") == 100) & (~pl.col("state").is_in(["NH", "VT", "MA", "ME", "DC"])))
    .select("total_votes_2020")
    .to_series()
)

# Create vote and margin models
vote_model = LinearRegression().fit(finished_counties.select(pl.exclude("margin_differential")).to_numpy(), finished_counties["vote_differential"].to_numpy())
margin_model = LinearRegression().fit(finished_counties.select(pl.exclude("vote_differential")).to_numpy(), finished_counties["margin_differential"].to_numpy())

# Conformal prediction function
def conformal_prediction(model, alpha=0.05):
    residuals = model.predict(finished_counties.select(pl.exclude("margin_differential")).to_numpy()) - finished_counties["vote_differential"].to_numpy()
    leverages = np.diag(finished_counties.select(pl.exclude("margin_differential")).to_numpy() @ np.linalg.pinv(finished_counties.select(pl.exclude("margin_differential")).to_numpy().T @ finished_counties.select(pl.exclude("margin_differential")).to_numpy()) @ finished_counties.select(pl.exclude("margin_differential")).to_numpy().T)
    loo_errors = residuals / (1 - leverages)
    quantiles = np.quantile(loo_errors, [alpha / 2, 1 - alpha / 2], weights=turnout_2020_finished_counties)
    return {"lower_quantile": quantiles[0], "upper_quantile": quantiles[1]}

# Get quantiles for vote and margin models
vote_quantiles = conformal_prediction(vote_model)
margin_quantiles = conformal_prediction(margin_model)

# Get results for unfinished counties
model_estimates = (
    county_and_dems
    .filter(pl.col("pct_reporting") != 100)
    .with_columns([
        pl.Series(vote_model.predict(county_and_dems.select(pl.exclude("margin_differential")).to_numpy())).alias("vote_pred"),
        pl.Series(margin_model.predict(county_and_dems.select(pl.exclude("vote_differential")).to_numpy())).alias("margin_pred"),
        (pl.col("margin_pred") + 100 * (pl.col("dem_votes_2020") - pl.col("rep_votes_2020")) / pl.col("total_votes_2020")).alias("margin_estimate"),
        (pl.col("margin_estimate") + margin_quantiles["lower_quantile"]).alias("margin_lower"),
        (pl.col("margin_estimate") + margin_quantiles["upper_quantile"]).alias("margin_upper"),
        (pl.col("vote_pred") + vote_quantiles["lower_quantile"]).alias("vote_lower"),
        (pl.col("vote_pred") + vote_quantiles["upper_quantile"]).alias("vote_upper"),
        (pl.col("vote_pred").exp() * pl.col("total_votes_2020")).alias("total_votes_estimate"),
        (pl.col("vote_lower").exp() * pl.col("total_votes_2020")).alias("total_votes_lower"),
        (pl.col("vote_upper").exp() * pl.col("total_votes_2020")).alias("total_votes_upper")
    ])
    .select(["fips", "state", "total_votes_estimate", "total_votes_lower", "total_votes_upper", "margin_estimate", "margin_lower", "margin_upper"])
)

# Get finalized county results
estimated_county = (
    county_and_dems
    .join(model_estimates, on=["fips", "state"], how="left")
    .with_columns([
        pl.when(pl.col("pct_reporting") == 100).then(pl.col("total_votes")).otherwise(pl.col("total_votes_estimate")).alias("total_votes_estimate"),
        pl.when(pl.col("pct_reporting") == 100).then(pl.col("total_votes")).otherwise(pl.col("total_votes_lower")).alias("total_votes_lower"),
        pl.when(pl.col("pct_reporting") == 100).then(pl.col("total_votes")).otherwise(pl.col("total_votes_upper")).alias("total_votes_upper"),
        pl.when(pl.col("pct_reporting") == 100).then(100 * (pl.col("dem_votes") - pl.col("rep_votes")) / pl.col("total_votes_2020")).otherwise(pl.col("margin_estimate")).alias("margin_estimate"),
        pl.when(pl.col("pct_reporting") == 100).then(100 * (pl.col("dem_votes") - pl.col("rep_votes")) / pl.col("total_votes_2020")).otherwise(pl.col("margin_lower")).alias("margin_lower"),
        pl.when(pl.col("pct_reporting") == 100).then(100 * (pl.col("dem_votes") - pl.col("rep_votes")) / pl.col("total_votes_2020")).otherwise(pl.col("margin_upper")).alias("margin_upper")
    ])
    .with_columns([
        pl.col("total_votes_estimate").fill_none(0),
        pl.col("total_votes_lower").fill_none(0),
        pl.col("total_votes_upper").fill_none(0),
        pl.col("margin_estimate").fill_none(0),
        pl.col("margin_lower").fill_none(0),
        pl.col("margin_upper").fill_none(0),
        pl.lit("President").alias("office_type")
    ])
    .select(["fips", "state", "office_type", "total_votes_estimate", "total_votes_lower", "total_votes_upper", "margin_estimate", "margin_lower", "margin_upper", "pct_reporting"])
)

# Get estimated race results
estimated_race = (
    estimated_county
    .groupby("state")
    .agg([
        pl.sum("total_votes_estimate").alias("total_votes_estimate"),
        pl.sum("total_votes_lower").alias("total_votes_lower"),
        pl.sum("total_votes_upper").alias("total_votes_upper")
    ])
    .with_column(pl.lit("President").alias("office_type"))
)

# Finalize race results
finalized_race_results = (
    pre_model_race
    .join(estimated_race, on=["state", "office_type"], how="left")
    .with_columns([
        (100 * pl.col("total_votes") / pl.col("total_votes_estimate")).clip_upper(100).alias("expected_pct_in"),
        (100 * pl.col("dem_votes") / pl.col("total_votes")).alias("dem_votes_pct"),
        (100 * pl.col("rep_votes") / pl.col("total_votes")).alias("rep_votes_pct"),
        (100 * pl.col("ind_votes") / pl.col("total_votes")).alias("ind_votes_pct"),
        (100 * pl.col("green_votes") / pl.col("total_votes")).alias("green_votes_pct"),
        (pl.col("margin_pct") - pl.col("margin_pct_1")).alias("swing"),
        (pl.col("total_votes_estimate") - pl.col("total_votes")).alias("votes_remaining")
    ])
    .select(["office_type", "state", "district", "dem_votes", "rep_votes", "ind_votes", "green_votes", "total_votes", "dem_votes_pct", "rep_votes_pct", "ind_votes_pct", "green_votes_pct", "margin_votes", "margin_pct", "pct_absentee", "absentee_margin", "swing", "margin_pct_1", "margin_votes_1", "margin_pct_2", "votes_remaining", "total_votes_estimate", "total_votes_lower", "total_votes_upper", "expected_pct_in"])
    .join(this_time_2020, on=["office_type", "state", "district"], how="left")
    .with_columns([
        pl.col("votes_remaining").round(0),
        pl.col("expected_pct_in").round(0)
    ])
    .join(when_to_expect_results, on=["office_type", "state", "district"], how="left")
)

# Handle Connecticut results
ct_results = (
    finalized_race_results
    .filter(pl.col("state") == "CT")
    .select(pl.exclude("same_time"))
    .rename({
        "dem_votes": "Democratic_votes",
        "rep_votes": "Republican_votes",
        "ind_votes": "Independent_votes",
        "green_votes": "Green_votes",
        "dem_votes_pct": "Democratic_votes_percent",
        "rep_votes_pct": "Republican_votes_percent",
        "ind_votes_pct": "Independent_votes_percent",
        "green_votes_pct": "Green_votes_percent"
    })
    .select(pl.exclude(["margin_pct_1", "margin_pct_2", "absentee_pct_1", "absentee_margin_pct_1"]))
    .with_columns([
        pl.lit("Connecticut").alias("county"),
        pl.lit("000").alias("fips"),
        pl.col("district").cast(pl.Utf8)
    ])
)

# Finalize county results
finalized_county_results = (
    pre_model_county
    .join(estimated_county, on=["state", "fips", "office_type"], how="left")
    .with_column(pl.when(pl.col("state") == "AK").then("000").otherwise(pl.col("fips")).alias("fips"))
    .filter(pl.col("state") != "CT")
    .vstack(ct_results)
    .with_columns([
        (pl.col("Democratic_votes") + pl.col("Republican_votes") + pl.col("Independent_votes") + pl.col("Green_votes")).alias("total_votes"),
        (200 * pl.col("total_votes") / (pl.col("total_votes_lower") + pl.col("total_votes_upper"))).clip_upper(100).alias("expected_pct_in"),
        (pl.col("total_votes_estimate") - pl.col("total_votes")).alias("votes_remaining")
    ])
    .select(["office_type", "state", "county", "district", "fips", "Democratic_votes", "Republican_votes", "Independent_votes", "Green_votes", "total_votes", "Democratic_votes_percent", "Republican_votes_percent", "Independent_votes_percent", "Green_votes_percent", "margin_votes", "margin_pct", "pct_absentee", "absentee_margin", "swing", "margin_pct_1", "margin_votes_1", "margin_pct_2", "margin_votes_2", "performance_vs_president", "votes_remaining", "total_votes_estimate", "total_votes_lower", "total_votes_upper", "expected_pct_in"])
    .with_columns([
        pl.col("votes_remaining").round(0),
        pl.col("expected_pct_in").round(0)
    ])
)

# Save the final results to CSV
finalized_county_results.write_csv("cleaned_data/Changing Data/DDHQ_current_county_results.csv")
finalized_race_results.write_csv("cleaned_data/Changing Data/DDHQ_current_race_results.csv")