import pandas as pd
from datetime import datetime
import numpy as np
import requests
from sklearn.linear_model import LinearRegression

#----- PART 1: SCRAPING AND CLEANING DATA ------
# Reading in Locally-Hosted Datasets ######

ids = pd.read_csv("cleaned_data/Locally-Hosted Data/DDHQ_api_calls.csv")["ddhq_id"].tolist()

past_county_data = pd.read_csv("cleaned_data/Locally-Hosted Data/historical_county.csv")
past_county_data["fips"] = np.where(past_county_data["state"] == "AK", "", past_county_data["fips"])
past_county_data["district"] = past_county_data["district"].astype(str)
past_county_data = past_county_data.drop(columns=["county"])

when_to_expect_results = pd.read_csv("cleaned_data/Locally-Hosted Data/When_to_expect_results.csv")
when_to_expect_results = when_to_expect_results.rename(columns={
    "Abbreviate": "state",
    "District": "district",
    "Office_type": "office_type",
    "When to call": "when_to_call",
    "Last Poll Close": "poll_close",
    "Race to watch": "race_to_watch"
})
when_to_expect_results["race_to_watch"] = when_to_expect_results["race_to_watch"].fillna(False)

past_race_data = pd.read_csv("cleaned_data/Locally-Hosted Data/historical_elections.csv")

county_demographics = pd.read_csv("cleaned_data/Locally-Hosted Data/County_Demographics.csv")

this_time_2020 = pd.read_csv("cleaned_data/Locally-Hosted Data/Same_Time_2020.csv")
this_time_2020["office_type"] = "President"
this_time_2020["district"] = 0
this_time_2020 = this_time_2020.rename(columns={col: f"{col}_same_time" for col in this_time_2020.columns if col in ["biden_pct", "votes"]})
this_time_2020["timestamp"] = pd.to_datetime(this_time_2020["timestamp"])
this_time_2020 = this_time_2020[this_time_2020["timestamp"] < datetime.now()]
this_time_2020 = this_time_2020.sort_values("timestamp").drop_duplicates(subset=["office_type", "state", "district"], keep="last")
this_time_2020 = this_time_2020[["office_type", "district", "state", "margin_same_time", "eevp_same_time", "votes_same_time"]].drop_duplicates()

maine_townships_counties = pd.read_csv("cleaned_data/Locally-Hosted Data/Maine_Townships_to_Counties.csv")
maine_townships_counties["fips"] = maine_townships_counties["fips"].apply(lambda x: f"{x:03d}")

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

    candidate_dataset = pd.DataFrame(candidate_dataset)
    candidate_dataset["cand_id"] = candidate_dataset["cand_id"].astype(str)
    candidate_dataset["name"] = candidate_dataset["first_name"] + " " + candidate_dataset["last_name"]

    year = json_data.get("year")
    state = json_data.get("state")
    district = str(json_data.get("district", "0"))
    last_updated = pd.to_datetime(json_data.get("last_updated")).tz_convert("America/New_York")
    uncontested = json_data.get("uncontested")

    try:
        vcus = pd.json_normalize(json_data.get("vcus")).rename(columns={"vcu": "county"})
        vcus.columns = vcus.columns.str.replace(r'^[^.]*\.', '', regex=True)
        vcus = vcus.melt(id_vars=["county", "fips"], var_name="candidate_vote_type", value_name="votes")
        vcus[["candidate_id", "vote_type"]] = vcus["candidate_vote_type"].str.extract(r'(\d+)(.*)')
        vcus["vote_type"] = vcus["vote_type"].str.replace(r'^\.', '', regex=True)
        vcus["vote_type"] = vcus["vote_type"].replace("", "total_votes")
        vcus["candidate_votes"] = vcus.groupby("candidate_id")["votes"].transform(lambda x: x[vcus["vote_type"] == "total_votes"].sum())

        if state == "ME":
            vcus = vcus.rename(columns={"county": "town"}).drop(columns=["fips"])
            vcus = vcus.merge(maine_townships_counties, on="town", how="left").drop(columns=["town"]).dropna(subset=["county"])
            vcus = vcus.groupby(["county", "fips", "vote_type", "candidate_id", "candidate_votes"]).agg({"votes": "sum"}).reset_index()
            vcus = vcus.merge(candidate_dataset, left_on="candidate_id", right_on="cand_id", how="left")
            vcus = vcus.groupby("party_name").apply(lambda x: x[x["candidate_votes"] == x["candidate_votes"].max()]).reset_index(drop=True)
            vcus = vcus[vcus["party_name"].isin(["Democratic", "Republican", "Independent", "Green"])]
            vcus = vcus.pivot_table(index=["fips", "county", "total", "reporting", "vote_type"], columns="party_name", values=["votes", "name"], aggfunc={"votes": "sum", "name": "first"}).reset_index()
            vcus.columns = [f"{i}_{j}" if j else f"{i}" for i, j in vcus.columns]
            vcus["ddhq_id"] = ddhq_id
            vcus["year"] = year
            vcus["state"] = state
            vcus["district"] = district
            vcus["last_updated"] = last_updated
            vcus["office_type"] = office_type
            vcus["uncontested"] = uncontested
            vcus["test_data"] = test_data
            vcus = vcus[["ddhq_id", "year", "test_data", "office_type", "state", "county", "district", "fips", "votes_Democratic", "votes_Republican", "votes_Independent", "votes_Green", "name_Democratic", "name_Republican", "name_Independent", "name_Green", "total", "reporting", "vote_type", "uncontested"]]
        else:
            vcus = vcus.merge(candidate_dataset, left_on="candidate_id", right_on="cand_id", how="left")
            vcus = vcus.groupby("party_name").apply(lambda x: x[x["candidate_votes"] == x["candidate_votes"].max()]).reset_index(drop=True)
            vcus = vcus[vcus["party_name"].isin(["Democratic", "Republican", "Independent", "Green"])]
            vcus = vcus.pivot_table(index=["fips", "county", "total", "reporting", "vote_type"], columns="party_name", values=["votes", "name"], aggfunc={"votes": "sum", "name": "first"}).reset_index()
            vcus.columns = [f"{i}_{j}" if j else f"{i}" for i, j in vcus.columns]
            vcus["ddhq_id"] = ddhq_id
            vcus["year"] = year
            vcus["state"] = state
            vcus["district"] = district
            vcus["last_updated"] = last_updated
            vcus["office_type"] = office_type
            vcus["uncontested"] = uncontested
            vcus["test_data"] = test_data
            vcus = vcus[["ddhq_id", "year", "test_data", "office_type", "state", "county", "district", "fips", "votes_Democratic", "votes_Republican", "votes_Independent", "votes_Green", "name_Democratic", "name_Republican", "name_Independent", "name_Green", "total", "reporting", "vote_type", "uncontested"]]

        return vcus

    except Exception as e:
        print(f"Here's the original error message for id {ddhq_id}: {e}")
        return None

scraped_list = list(map(scrape_data, ids))

scraped_df = pd.concat([df for df in scraped_list if df is not None], ignore_index=True)

#Total returned is the term we use for votes, but we don't call it votes
scraped_df["total_returned"] = scraped_df.filter(like="votes").sum(axis=1)
scraped_df = scraped_df.assign(
    **{f"{col}_percent": 100 * scraped_df[col] / scraped_df["total_returned"] for col in scraped_df.filter(like="votes").columns},
    margin_pct=scraped_df["Democratic_votes_percent"] - scraped_df["Republican_votes_percent"],
    margin_votes=scraped_df["Democratic_votes"] - scraped_df["Republican_votes"]
)

scraped_df = scraped_df.groupby(["year", "fips", "office_type", "state", "district"]).apply(
    lambda group: group.assign(
        pct_absentee=np.where(group["vote_type"] == "absentee_ballots_early_votes", group["total_returned"] / group["total_returned"].sum(), np.nan),
        absentee_margin=np.where(group["vote_type"] == "absentee_ballots_early_votes", group["margin_pct"], np.nan)
    )
).fillna(method="ffill").fillna(method="bfill")

scraped_df = scraped_df[scraped_df["vote_type"] == "total_votes"].reset_index(drop=True)

scraped_df["district"] = scraped_df["district"].replace({
    "At-Large": "1",
    "": "0"
}).astype(str)
scraped_df["district"] = np.where(scraped_df["state"].isin(["ME1", "ME2", "NE2"]), scraped_df["state"].str[-1], scraped_df["district"])
scraped_df["pct_reporting"] = 100 * scraped_df["reporting"] / scraped_df["total"]
scraped_df["state"] = scraped_df["state"].str.replace(r"[0-9]", "", regex=True)
scraped_df["office_type"] = scraped_df["office_type"].str.replace("US ", "")

scraped_df = scraped_df[[
    "test_data", "ddhq_id", "year", "office_type", "state", "county", "district", "fips",
    "Democratic_name", "Republican_name", "Independent_name", "Green_name", "total", "reporting",
    "pct_reporting", "Democratic_votes", "Republican_votes", "Independent_votes", "Green_votes",
    "Democratic_votes_percent", "Republican_votes_percent", "Independent_votes_percent", "Green_votes_percent",
    "margin_votes", "margin_pct", "pct_absentee", "absentee_margin"
]].fillna({ 
    #When no votes have been counted, we want this to show zero? I THINK
    "Democratic_votes": 0, "Republican_votes": 0, "Independent_votes": 0, "Green_votes": 0,
    "Democratic_name": "NONE", "Republican_name": "NONE", "Independent_name": "NONE", "Green_name": "NONE",
    "margin_pct": 0
})
scraped_df["fips"] = scraped_df["fips"].str[-3:]

performance_vs_president = scraped_df[scraped_df["office_type"] != "House"].pivot_table(
    index=["state", "district", "county"], columns="office_type", values="margin_pct"
).reset_index()
performance_vs_president["Senate"] = performance_vs_president["Senate"] - performance_vs_president["President"]
performance_vs_president["Governor"] = performance_vs_president["Governor"] - performance_vs_president["President"]
performance_vs_president = performance_vs_president.drop(columns=["President"]).melt(
    id_vars=["state", "district", "county"], value_vars=["Senate", "Governor"],
    var_name="office_type", value_name="performance_vs_president"
)

#----FINAL DATASETS BEFORE RUNNING THE EDAY MODEL ------

pre_model_county = scraped_df.copy()
pre_model_county["fips"] = np.where((pre_model_county["state"] == "VT") & (pre_model_county["county"] == "Chittenden"), "007", pre_model_county["fips"])
pre_model_county["fips"] = np.where((pre_model_county["state"] == "NH") & (pre_model_county["county"] == "Sullivan"), "019", pre_model_county["fips"])
pre_model_county = pre_model_county.merge(past_county_data, on=["office_type", "district", "state", "fips"], how="left")
pre_model_county = pre_model_county[~((pre_model_county["margin_pct_1"].isna()) & (pre_model_county["office_type"].isin(["President", "Senate"])) & (pre_model_county["state"].isin(["HI", "MO", "MD", "NE"])))]
pre_model_county["swing"] = pre_model_county["margin_pct"] - pre_model_county["margin_pct_1"]
pre_model_county = pre_model_county.merge(performance_vs_president, on=["state", "district", "county", "office_type"], how="left")

pre_model_race = pre_model_county.copy()
pre_model_race["total_votes"] = pre_model_race[["Democratic_votes", "Republican_votes", "Independent_votes", "Green_votes"]].sum(axis=1)
pre_model_race["total_absentee_votes"] = np.where(pre_model_race["pct_absentee"].isna(), 0, pre_model_race["pct_absentee"] * pre_model_race["total_votes"])
pre_model_race["absentee_margin_votes"] = pre_model_race["absentee_margin"] * pre_model_race["total_absentee_votes"]
pre_model_race = pre_model_race.groupby(["office_type", "state", "district", "Democratic_name", "Republican_name", "Independent_name"]).agg({
    "reporting": "sum", "total": "sum", "total_votes": "sum",
    "Democratic_votes": "sum", "Republican_votes": "sum", "Independent_votes": "sum", "Green_votes": "sum",
    "total_absentee_votes": "sum", "absentee_margin_votes": "sum"
}).reset_index()
pre_model_race["district"] = pre_model_race["district"].astype(int)
pre_model_race["pct_reporting"] = 100 * pre_model_race["reporting"] / pre_model_race["total"]
pre_model_race["margin_votes"] = pre_model_race["Democratic_votes"] - pre_model_race["Republican_votes"]
pre_model_race["margin_pct"] = 100 * (pre_model_race["margin_votes"] / pre_model_race["total_votes"])
pre_model_race["pct_absentee"] = 100 * pre_model_race["total_absentee_votes"] / pre_model_race["total_votes"]
pre_model_race["absentee_margin"] = 100 * pre_model_race["absentee_margin_votes"] / pre_model_race["total_absentee_votes"]
pre_model_race = pre_model_race.merge(past_race_data, on=["office_type", "state", "district"], how="left")

#Need to fix final county dataset, remove all places with weird county stuff like Maine
pre_model_county = pre_model_county[~((pre_model_county["margin_pct_1"].isna()) & (pre_model_county["office_type"].isin(["President", "Senate"])))]


#----- PART 2: RUNNING ELECTION DAY MODEL -----
 
live_data = pre_model_county[pre_model_county["office_type"] == "President"].copy()
live_data["total_votes"] = 100 * live_data["margin_votes"] / live_data["margin_pct"]
live_data["total_votes_2020"] = 100 * live_data["margin_votes_1"] / live_data["margin_pct_1"]
live_data["dem_votes"] = live_data["Democratic_votes"]
live_data["rep_votes"] = live_data["Republican_votes"]
live_data["dem_votes_2020"] = (0.98 * live_data["total_votes_2020"] + live_data["margin_votes_1"]) / 2
live_data["rep_votes_2020"] = (0.98 * live_data["total_votes_2020"] - live_data["margin_votes_1"]) / 2
live_data["pct_reporting"] = live_data["pct_reporting"].fillna(0)
live_data = live_data[["fips", "state", "pct_reporting", "total_votes", "dem_votes", "rep_votes", "total_votes_2020", "dem_votes_2020", "rep_votes_2020"]]

county_and_dems = live_data.merge(county_demographics, on=["fips", "state"], how="left")
county_and_dems = county_and_dems[~county_and_dems["total_population"].isna()]

###### WE RUN THREE DIFFERENT MODELS -- ONE FOR TOTAL TURNOUT, ONE FOR DEMS/REP #####
# Predicting vote shares
finished_counties = county_and_dems[(county_and_dems["pct_reporting"] == 100) & (~county_and_dems["state"].isin(["NH", "VT", "MA", "ME", "DC"]))].copy()
finished_counties["total_votes"] = np.where(finished_counties["total_votes"].isna(), finished_counties["dem_votes"] + finished_counties["rep_votes"], finished_counties["total_votes"])
finished_counties["vote_differential"] = np.log(finished_counties["total_votes"] / finished_counties["total_votes_2020"])
finished_counties["margin_differential"] = 100 * ((finished_counties["dem_votes"] - finished_counties["rep_votes"]) / finished_counties["total_votes"] - (finished_counties["dem_votes_2020"] - finished_counties["rep_votes_2020"]) / finished_counties["total_votes_2020"])
finished_counties = finished_counties[["vote_differential", "margin_differential"] + [col for col in county_and_dems.columns if col.startswith("total_population") or col.startswith("proportion_less_than_hs_asian")]]

#Usual conformal prediction guarantees that 95% of COUNTIES are within the prediction, 
#We want to make sure that 95% of PEOPLE are within the prediction, so we need to upweight on 
#Total turnout from 2020
turnout_2020_finished_counties = county_and_dems[(county_and_dems["pct_reporting"] == 100) & (~county_and_dems["state"].isin(["NH", "VT", "MA", "ME", "DC"]))]["total_votes_2020"]

# Creating vote models
vote_model = LinearRegression().fit(finished_counties.drop(columns=["margin_differential"]), finished_counties["vote_differential"])
margin_model = LinearRegression().fit(finished_counties.drop(columns=["vote_differential"]), finished_counties["margin_differential"])

# Use conformal prediction to get bounds for each model
def conformal_prediction(model, alpha=0.05):
    residuals = model.predict(finished_counties.drop(columns=["margin_differential"])) - finished_counties["vote_differential"]
    leverages = np.diag(finished_counties.drop(columns=["margin_differential"]).to_numpy() @ np.linalg.pinv(finished_counties.drop(columns=["margin_differential"]).to_numpy().T @ finished_counties.drop(columns=["margin_differential"]).to_numpy()) @ finished_counties.drop(columns=["margin_differential"]).to_numpy().T)
    
    #leave one out errors 
    loo_errors = residuals / (1 - leverages)
    
    #Get quantiles with upweight for high-population counties
    quantiles = np.quantile(loo_errors, [alpha / 2, 1 - alpha / 2], weights=turnout_2020_finished_counties)
    
    return {"lower_quantile": quantiles[0], "upper_quantile": quantiles[1]}

# for total vote differential
vote_quantiles = conformal_prediction(vote_model)
margin_quantiles = conformal_prediction(margin_model)

##Getting results for all unfinished counties
model_estimates = county_and_dems[county_and_dems["pct_reporting"] != 100].copy()

# Predictions
model_estimates["vote_pred"] = vote_model.predict(model_estimates[[col for col in county_and_dems.columns if col.startswith("total_population") or col.startswith("proportion_less_than_hs_asian")]])
model_estimates["margin_pred"] = margin_model.predict(model_estimates[[col for col in county_and_dems.columns if col.startswith("total_population") or col.startswith("proportion_less_than_hs_asian")]])

# Conformal prediction intervals for margins
model_estimates["margin_estimate"] = model_estimates["margin_pred"] + 100 * (model_estimates["dem_votes_2020"] - model_estimates["rep_votes_2020"]) / model_estimates["total_votes_2020"]
model_estimates["margin_lower"] = model_estimates["margin_estimate"] + margin_quantiles["lower_quantile"]
model_estimates["margin_upper"] = model_estimates["margin_estimate"] + margin_quantiles["upper_quantile"]

# Conformal prediction intervals for votes
model_estimates["vote_lower"] = model_estimates["vote_pred"] + vote_quantiles["lower_quantile"]
model_estimates["vote_upper"] = model_estimates["vote_pred"] + vote_quantiles["upper_quantile"]

# Total votes estimate
model_estimates["total_votes_estimate"] = np.exp(model_estimates["vote_pred"]) * model_estimates["total_votes_2020"]
model_estimates["total_votes_lower"] = np.exp(model_estimates["vote_lower"]) * model_estimates["total_votes_2020"]
model_estimates["total_votes_upper"] = np.exp(model_estimates["vote_upper"]) * model_estimates["total_votes_2020"]
model_estimates = model_estimates[["fips", "state", "total_votes_estimate", "total_votes_lower", "total_votes_upper", "margin_estimate", "margin_lower", "margin_upper"]]

#Get finalized county results for everything 
estimated_county = county_and_dems.merge(model_estimates, on=["fips", "state"], how="left")

# For finished counties use actual votes
estimated_county["total_votes_estimate"] = np.where(estimated_county["pct_reporting"] == 100, estimated_county["total_votes"], estimated_county["total_votes_estimate"])
estimated_county["total_votes_lower"] = np.where(estimated_county["pct_reporting"] == 100, estimated_county["total_votes"], estimated_county["total_votes_lower"])
estimated_county["total_votes_upper"] = np.where(estimated_county["pct_reporting"] == 100, estimated_county["total_votes"], estimated_county["total_votes_upper"])
estimated_county["margin_estimate"] = np.where(estimated_county["pct_reporting"] == 100, 100 * (estimated_county["dem_votes"] - estimated_county["rep_votes"]) / estimated_county["total_votes_2020"], estimated_county["margin_estimate"])
estimated_county["margin_lower"] = np.where(estimated_county["pct_reporting"] == 100, 100 * (estimated_county["dem_votes"] - estimated_county["rep_votes"]) / estimated_county["total_votes_2020"], estimated_county["margin_lower"])
estimated_county["margin_upper"] = np.where(estimated_county["pct_reporting"] == 100, 100 * (estimated_county["dem_votes"] - estimated_county["rep_votes"]) / estimated_county["total_votes_2020"], estimated_county["margin_upper"])
estimated_county = estimated_county.fillna(0)
estimated_county["office_type"] = "President"
estimated_county = estimated_county[["fips", "state", "office_type", "total_votes_estimate", "total_votes_lower", "total_votes_upper", "margin_estimate", "margin_lower", "margin_upper", "pct_reporting"]]

#This will be the absolute BEST result for Democrats and the BEST result for Republicans!
estimated_race = estimated_county.groupby("state").agg({
    "total_votes_estimate": "sum",
    "total_votes_lower": "sum",
    "total_votes_upper": "sum"
}).reset_index()
estimated_race["office_type"] = "President"


#----- FINALIZING DATASETS AND WRITING THEM TO CSV! -----
#We now need to combine these values with the original datasets, and put them back!
finalized_race_results = (
    pre_model_race
    .merge(estimated_race, on=['state', 'office_type'], how='left')
    .assign(
        expected_pct_in=lambda df: 100 * np.minimum(1, df['total_votes'] / df['total_votes_estimate']),
        dem_votes_pct=lambda df: 100 * df['dem_votes'] / df['total_votes'],
        rep_votes_pct=lambda df: 100 * df['rep_votes'] / df['total_votes'],
        ind_votes_pct=lambda df: 100 * df['ind_votes'] / df['total_votes'],
        green_votes_pct=lambda df: 100 * df['green_votes'] / df['total_votes'],
        swing=lambda df: df['margin_pct'] - df['margin_pct_1'],
        votes_remaining=lambda df: df['total_votes_estimate'] - df['total_votes']
    )
    .filter(items=[
        'office_type', 'state', 'district', 'pct_reporting', 'dem_votes', 'rep_votes', 'ind_votes', 'green_votes', 'total_votes',
        'dem_votes_pct', 'rep_votes_pct', 'ind_votes_pct', 'green_votes_pct', 'margin_votes', 'margin_pct', 'pct_absentee',
        'absentee_margin', 'swing', 'margin_pct_1', 'margin_votes_1', 'margin_pct_2', 'votes_remaining', 'total_votes_estimate',
        'total_votes_lower', 'total_votes_upper', 'expected_pct_in'
    ])
    .merge(this_time_2020, on=['office_type', 'state', 'district'], how='left')
    .assign(
        votes_remaining=lambda df: df['votes_remaining'].round(0),
        expected_pct_in=lambda df: df['expected_pct_in'].round(0)
    )
    .merge(when_to_expect_results, on=['office_type', 'state', 'district'], how='left')
)

# Handling Connecticut results
ct_results = (
    finalized_race_results
    .loc[finalized_race_results['state'] == 'CT']
    .drop(columns=[col for col in finalized_race_results.columns if 'same_time' in col])
    .rename(columns={
        'dem_votes': 'Democratic_votes',
        'rep_votes': 'Republican_votes',
        'ind_votes': 'Independent_votes',
        'green_votes': 'Green_votes',
        'dem_votes_pct': 'Democratic_votes_percent',
        'rep_votes_pct': 'Republican_votes_percent',
        'ind_votes_pct': 'Independent_votes_percent',
        'green_votes_pct': 'Green_votes_percent'
    })
    .drop(columns=['margin_pct_1', 'margin_pct_2', 'absentee_pct_1', 'absentee_margin_pct_1'])
    .assign(
        county='Connecticut',
        fips='000',
        district=lambda df: df['district'].astype(str)
    )
)

# Finalizing county results
finalized_county_results = (
    pre_model_county
    .merge(estimated_county, on=['state', 'fips', 'office_type'], how='left')
    .assign(fips=lambda df: df.apply(lambda row: '000' if row['state'] == 'AK' else row['fips'], axis=1))
    .loc[lambda df: df['state'] != 'CT']
    .append(ct_results, ignore_index=True)
    .assign(
        total_votes=lambda df: df['Democratic_votes'] + df['Republican_votes'] + df['Independent_votes'] + df['Green_votes'],
        expected_pct_in=lambda df: np.minimum(100, 200 * df['total_votes'] / (df['total_votes_lower'] + df['total_votes_upper'])),
        votes_remaining=lambda df: df['total_votes_estimate'] - df['total_votes']
    )
    .filter(items=[
        'office_type', 'state', 'county', 'district', 'fips', 'Democratic_votes', 'Republican_votes', 'Independent_votes', 'Green_votes',
        'total_votes', 'Democratic_votes_percent', 'Republican_votes_percent', 'Independent_votes_percent', 'Green_votes_percent',
        'margin_votes', 'margin_pct', 'pct_absentee', 'absentee_margin', 'swing', 'margin_pct_1', 'margin_votes_1', 'margin_pct_2',
        'margin_votes_2', 'performance_vs_president', 'votes_remaining', 'total_votes_estimate', 'total_votes_lower', 'total_votes_upper',
        'expected_pct_in'
    ])
    .assign(
        votes_remaining=lambda df: df['votes_remaining'].round(0),
        expected_pct_in=lambda df: df['expected_pct_in'].round(0)
    )
)

# Writing final datasets to CSV
finalized_county_results.to_csv("cleaned_data/Changing Data/DDHQ_current_county_results.csv", index=False)
finalized_race_results.to_csv("cleaned_data/Changing Data/DDHQ_current_race_results.csv", index=False)