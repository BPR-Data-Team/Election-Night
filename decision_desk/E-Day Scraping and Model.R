library(tidyverse)
library(jsonlite)
library(lubridate)
library(glue)
library(httr)
library(furrr)

#----- PART 1: SCRAPING AND CLEANING DATA ------
# Reading in Locally-Hosted Datasets ######
ids <- read_csv("cleaned_data/Locally-Hosted Data/DDHQ_api_calls.csv") %>% pull(ddhq_id) 

past_county_data <- read_csv("cleaned_data/Locally-Hosted Data/historical_county.csv") %>% 
  mutate(fips = ifelse(state == "AK", "", fips), 
         district = as.character(district)) %>% 
  select(-county)

past_race_data <- read_csv("cleaned_data/Locally-Hosted Data/historical_elections.csv")

county_demographics <- read_csv("cleaned_data/Locally-Hosted Data/CountyDems2022.csv") %>%
  mutate(fips = str_sub(Geography, -3), 
         across(where(is.numeric), ~ as.vector(scale(.)))) %>%
  select(state, fips, where(is.numeric)) %>%
  select(-proportion_other)

this_time_2020 <- read_csv("cleaned_data/Locally-Hosted data/Same_Time_2020.csv") %>%
  mutate(office_type = "President", 
         district = 0, 
         .before = everything()) %>%
  rename_with(.cols = biden_pct:votes, ~ paste0(.x, "_same_time")) %>%
  filter(timestamp < now()) %>%
  #filter(timestamp < now(tzone = "UTC") - years(4) - days(2)) %>% #Nov 3 2020 -> Nov 5 2024
  group_by(office_type, state, district) %>%
  filter(timestamp == max(timestamp)) %>%
  ungroup() %>%
  select(office_type, district, state, margin_same_time, eevp_same_time, votes_same_time)


###### FETCHING DATA, AT THIS POINT NOTHING LOCALLY IS NEEDED ###### 
scrape_data <- function(ddhq_id) {
  
  url <- glue("https://embed-api.ddhq.io/v1/races/{ddhq_id}")
  print(url)
  
  response <- GET(url)
  if (http_error(response)) {
    print("Error on http response")
    return(NULL)
  }
  
  json_text <- content(response, as = "text", encoding = "UTF-8")
  
  json_data <- fromJSON(json_text) #Full JSON Data used for fetching
  
  test_data <- json_data$test_data
  
  office_type <- json_data$office #President, etc.
  
  #Getting mapping of candidate to candidate ID
  candidate_dataset <- json_data$candidates 
  
  if (is_empty(candidate_dataset)) {
    return (NULL)
  } else{
    candidate_dataset <- candidate_dataset %>% 
      mutate(cand_id = as.character(cand_id), 
             name = paste(first_name, last_name)) #Allows for linking with final dataset
  }
  
  year <- json_data$year
  
  state <- json_data$state
  
  district <- as.character(ifelse(is.null(json_data$district), "0", json_data$district))  
  
  last_updated <- json_data$last_updated %>% 
    ymd_hms() %>% 
    with_tz("America/New_York")
  
  uncontested <- json_data$uncontested
  
  return_df <- tryCatch(
    {
      
      #Cleaning votes by county
      vcus <- json_data$vcus %>% 
        rename(county = vcu) %>% 
        jsonlite::flatten() %>% 
        rename_with(.cols = contains("."), ~ str_remove(., "^[^.]*\\.")) %>% 
        pivot_longer(
          cols = matches("[0-9]"), # All cols with candidate information is in this format
          names_to = c("candidate_id", "vote_type"),
          names_pattern = "(\\d+)(.*)",
          values_to = "votes"
        ) %>% 
        mutate(vote_type = str_remove(vote_type, "^\\."), 
               vote_type = ifelse(vote_type == "", "total_votes", vote_type)) %>%
        group_by(candidate_id) %>%
        mutate(candidate_votes = sum(ifelse(vote_type == "total_votes", votes, 0), na.rm = TRUE)) %>%
        ungroup()
      
      
      #pivot_wider(names_from = vote_type, values_from = votes)
      
      county_votes_dataset <- vcus %>% 
        left_join(candidate_dataset, by = c("candidate_id" = "cand_id")) %>%
        group_by(party_name) %>%
        filter(candidate_votes == max(candidate_votes)) %>%
        ungroup() %>%
        filter(party_name %in% c("Democratic", "Republican", "Independent", "Green")) %>%
        pivot_wider(names_from = party_name, values_from = c(votes, name), id_cols = c(fips, county, total, reporting, vote_type), 
                    values_fn = c(votes = sum, name = first), names_glue = "{party_name}_{.value}") %>%  #Sums up votes by party
        mutate(ddhq_id = ddhq_id, year = year, state = state, district = district, 
               last_updated = last_updated,
               office_type = office_type, uncontested = uncontested, test_data = test_data) %>% 
        select(ddhq_id, year, test_data, office_type, state, county, district, 
               fips, contains("vote"), contains("name"), total, reporting, vote_type, uncontested) 
      
      return(county_votes_dataset)
    }, 
    error = function(cond) {
      message(glue("Here's the original error message for id {ddhq_id}: {cond}"))
      # Return NA in case of error
      return(NULL)
    }
  )
  return(return_df)
  
}

plan(multisession, workers = parallel::detectCores())

scraped_list <- future_map(ids, scrape_data, .progress = TRUE)

scraped_df <- list_rbind(scraped_list)

scraped_df <- scraped_df %>%
  #Total returned is the term we use for votes, but we don't call it votes
  mutate(total_returned = rowSums(across(contains("votes")), na.rm = TRUE)) %>%
  mutate(across(contains("votes"), ~ 100 * .x / total_returned, .names = "{.col}_percent"),
         margin_pct = Democratic_votes_percent - Republican_votes_percent, 
         margin_votes = Democratic_votes - Republican_votes) %>%
  group_by(year, fips, office_type, state, district) %>%
  mutate(pct_absentee = ifelse(vote_type == "absentee_ballots_early_votes", total_returned / sum(total_returned), NA), 
         absentee_margin = ifelse(vote_type == "absentee_ballots_early_votes", margin_pct, NA)) %>%
  fill(pct_absentee, absentee_margin, .direction = "updown") %>% #Tested that this works! It does it by county/office_type/district combo!
  filter(vote_type == "total_votes") %>%
  ungroup() %>%
  mutate(district = case_when(
    state == "ME1" ~ "1", 
    state == "ME2" ~ "2", 
    state == "NE2" ~ "2",
    district == "At-Large" ~ "1", 
    district == "" ~ "0",
    TRUE ~ district
  ), pct_reporting = 100 * reporting / total, 
  state = str_remove(state, "[0-9]")) %>%
  mutate(office_type = str_remove(office_type, "US ")) %>%
  select(test_data,ddhq_id, year, office_type, state, county, district, fips, 
         Democratic_name, Republican_name, Independent_name, Green_name, total, reporting,
         pct_reporting, Democratic_votes, Republican_votes, Independent_votes, Green_votes, 
         Democratic_votes_percent, Republican_votes_percent, Independent_votes_percent, Green_votes_percent, 
         margin_votes, margin_pct, pct_absentee, absentee_margin) %>%
  #When no votes have been counted, we want this to show zero? I THINK
  mutate(across(contains("votes"), ~ replace_na(., 0)),
         across(contains("name"), ~ ifelse(. == "NULL", "NONE", .)), 
         margin_pct = replace_na(margin_pct, 0), 
         fips = str_sub(fips, -3))

#For senate/gov elections, calculating how well they're doing relative to the president
performance_vs_president <- scraped_df %>%
  filter(office_type != "House") %>%
  select(office_type, state, district, county, margin_pct)  %>%
  pivot_wider(id_cols = c(state, district, county), 
              names_from = office_type, 
              values_from = margin_pct) %>%
  mutate(Senate = Senate - President, 
         Governor = Governor - President, 
         district = as.character(district)) %>%
  select(-President) %>%
  pivot_longer(cols = c(Senate, Governor), 
               names_to = "office_type",
               values_to = "performance_vs_president") 

#----FINAL DATASETS BEFORE RUNNING THE EDAY MODEL ------
pre_model_county <- scraped_df %>%
  left_join(past_county, by = c("office_type", "district", "state", "fips")) %>%
  filter(!(is.na(margin_pct_1) & office_type %in% c("President", "Senate") & state %in% c("HI", "MO", "MD", "NE"))) %>% #Some weird stuff here...
  mutate(swing = margin_pct - margin_pct_1) %>% #Calculating swing from previous election
  left_join(performance_vs_president, by = c("state", "district", "county", "office_type"))

pre_model_race <- pre_model_county %>% 
  rowwise() %>%
  mutate(total_votes = sum(c(Democratic_votes, Republican_votes, Independent_votes, Green_votes), na.rm = TRUE), 
         total_absentee_votes = ifelse(is.na(pct_absentee), 0, pct_absentee * total_votes), 
         absentee_margin_votes = absentee_margin * total_absentee_votes) %>%
  group_by(office_type, state, district, Democratic_name, Republican_name, Independent_name) %>%
  summarize(
    precincts_reporting = sum(reporting), 
    total_precincts = sum(total),
    total_votes = sum(total_votes),
    dem_votes = sum(Democratic_votes), 
    rep_votes = sum(Republican_votes), 
    ind_votes = sum(Independent_votes),
    green_votes = sum(Green_votes),
    total_absentee_votes = sum(total_absentee_votes), 
    absentee_margin_votes = sum(absentee_margin_votes)
  ) %>%
  mutate(district = as.numeric(district), 
         pct_reporting = 100 * precincts_reporting / total_precincts, 
         margin_votes = dem_votes - rep_votes, 
         margin_pct = 100*(dem_votes - rep_votes) / total_votes, 
         pct_absentee = 100 * total_absentee_votes/ total_votes, 
         absentee_margin = 100 * absentee_margin_votes / total_absentee_votes) %>%
  select(office_type, state, district, Democratic_name, Republican_name, Independent_name, dem_votes, 
         rep_votes, ind_votes, green_votes,
         pct_reporting, total_votes, margin_votes, margin_pct,
         pct_absentee, absentee_margin) %>%
  left_join(past_race_data, by = c("office_type", "state", "district"))

#Need to fix final county dataset, remove all places with weird county stuff like Maine
pre_model_county <- pre_model_county %>%
  filter(!(is.na(margin_pct_1) & office_type %in% c("President", "Senate")))


#----- PART 2: RUNNING ELECTION DAY MODEL -----

live_data <- pre_model_county %>%
  filter(office_type == "President") %>%
  mutate(total_votes = 100 * margin_votes / margin_pct, 
         total_votes_2020 = 100 * margin_votes_1 / margin_pct_1,
         dem_votes = Democratic_votes, 
         rep_votes = Republican_votes, 
         dem_votes_2020 = (0.98 * total_votes_2020 + margin_votes_1) / 2, 
         rep_votes_2020 = (0.98 * total_votes_2020 - margin_votes_1) / 2, 
         pct_reporting = replace_na(pct_reporting, 0)) %>%
  select(fips, state, pct_reporting, total_votes, dem_votes, rep_votes, total_votes_2020, dem_votes_2020, rep_votes_2020) 

county_and_dems <- live_data %>%
  left_join(county_demographics, by = c("fips", "state")) %>%
  filter(!is.na(median_income) & !is.na(total_pop))

###### WE RUN THREE DIFFERENT MODELS -- ONE FOR TOTAL TURNOUT, ONE FOR DEMS/REP #####
# Predicting vote shares
finished_counties <- county_and_dems %>%
  filter(pct_reporting == 100) %>%
  mutate(
    total_votes = ifelse(is.na(total_votes), dem_votes + rep_votes, total_votes), #Some states have weird stuff?
    dem_differential = log(dem_votes / dem_votes_2020),
    rep_differential = log(rep_votes / rep_votes_2020),
    vote_differential = log(total_votes / total_votes_2020)
  ) %>%
  select(vote_differential, dem_differential, rep_differential, total_pop:proportion_bachelors_degree_over_25)


#Usual conformal prediction guarantees that 95% of COUNTIES are within the prediction, 
#We want to make sure that 95% of PEOPLE are within the prediction, so we need to upweight on 
#Total turnout from 2020
turnout_2020_finished_counties <- county_and_dems %>%
  filter(pct_reporting == 100) %>%
  pull(total_votes_2020)

# Creating vote models
vote_model <- lm(vote_differential ~ ., data = finished_counties %>% select(-dem_differential, -rep_differential))
dem_model <- lm(dem_differential ~ ., data = finished_counties %>% select(-vote_differential, -rep_differential))
rep_model <- lm(rep_differential ~ ., data = finished_counties %>% select(-vote_differential, -dem_differential))


# Use conformal prediction to get bounds for each model
conformal_prediction <- function(model, alpha = 0.05) {
  # Calculate residuals
  residuals <- residuals(model)
  
  # Calculate leverages (diagonal of the hat matrix)
  leverages <- hatvalues(model)
  
  # Calculate leave-one-out errors
  loo_errors <- residuals / (1 - leverages)
  
  print(length(turnout_2020_finished_counties))
  print(length(loo_errors))
  
  #Get quantiles with upweight for high-population counties
  quantiles <- Hmisc::wtd.quantile(loo_errors, probs = c(alpha / 2, 1 - alpha / 2), 
                                   weights = turnout_2020_finished_counties)
  
  # Return the quantiles
  return(list(
    lower_quantile = quantiles[1],
    upper_quantile = quantiles[2]
  ))
}

# For total vote differential
vote_quantiles <- conformal_prediction(vote_model)

# For Democratic vote share
dem_quantiles <- conformal_prediction(dem_model)

# For Republican vote share
rep_quantiles <- conformal_prediction(rep_model)

#Getting results for all unfinished counties
model_estimates <- county_and_dems %>%
  filter(pct_reporting != 100) %>%
  mutate(
    # Predictions
    vote_pred = predict(vote_model, newdata = select(., total_pop:proportion_bachelors_degree_over_25)),
    dem_votes_pred = predict(dem_model, newdata = select(., total_pop:proportion_bachelors_degree_over_25)),
    rep_votes_pred = predict(rep_model, newdata = select(., total_pop:proportion_bachelors_degree_over_25)),
    
    # Conformal prediction intervals for total votes
    vote_lower = vote_pred + vote_quantiles$lower_quantile,
    vote_upper = vote_pred + vote_quantiles$upper_quantile,
    
    # Conformal prediction intervals for vote shares
    dem_votes_lower_estimate = dem_votes_pred + dem_quantiles$lower_quantile,
    dem_votes_upper_estimate = dem_votes_pred + dem_quantiles$upper_quantile,
    rep_votes_lower_estimate = rep_votes_pred + rep_quantiles$lower_quantile,
    rep_votes_upper_estimate = rep_votes_pred + rep_quantiles$upper_quantile,
    
    # Calculate total vote estimates
    total_votes_lower = exp(vote_lower) * total_votes_2020,
    total_votes_upper = exp(vote_upper) * total_votes_2020,
    dem_votes_lower = exp(dem_votes_lower_estimate) * dem_votes_2020, 
    dem_votes_upper = exp(dem_votes_upper_estimate) * dem_votes_2020, 
    rep_votes_lower = exp(rep_votes_lower_estimate) * rep_votes_2020, 
    rep_votes_upper = exp(rep_votes_upper_estimate) * rep_votes_2020
  ) %>%
  #Sometimes, the sum of dems and reps exceed total votes -- we adjust the intervals here!
  mutate(
    # Sum of predicted votes
    votes_sum_lower = dem_votes_lower + rep_votes_lower,
    votes_sum_upper = dem_votes_upper + rep_votes_upper,
    
    # Adjustment factors
    adjustment_lower = ifelse(votes_sum_lower > total_votes_lower, total_votes_lower / votes_sum_lower, 1),
    adjustment_upper = ifelse(votes_sum_upper > total_votes_upper, total_votes_upper / votes_sum_upper, 1),
    
    # Adjusted vote votes
    dem_votes_lower = dem_votes_lower * adjustment_lower,
    rep_votes_lower = rep_votes_lower * adjustment_lower,
    dem_votes_upper = dem_votes_upper * adjustment_upper,
    rep_votes_upper = rep_votes_upper * adjustment_upper) %>%
  select(fips, state, total_votes_lower, total_votes_upper, dem_votes_lower, dem_votes_upper, rep_votes_lower, rep_votes_upper)


# Get finalized county results for everything!
estimated_county <- county_and_dems %>%
  left_join(model_estimates, by = c("fips", "state")) %>%
  mutate(
    # For finished counties, use actual votes
    total_votes_lower = ifelse(pct_reporting == 100, total_votes, total_votes_lower), 
    total_votes_upper = ifelse(pct_reporting == 100, total_votes, total_votes_upper),
    dem_votes_lower = ifelse(pct_reporting == 100, dem_votes, dem_votes_lower),
    dem_votes_upper = ifelse(pct_reporting == 100, dem_votes, dem_votes_upper),
    rep_votes_lower = ifelse(pct_reporting == 100, rep_votes, rep_votes_lower),
    rep_votes_upper = ifelse(pct_reporting == 100, rep_votes, rep_votes_upper)
  ) %>%
  mutate(across(contains("lower"), ~replace_na(., 0)), 
         across(contains("upper"), ~replace_na(., 0)), 
         office_type = "President") %>%
  select(fips, state, office_type, total_votes_lower:rep_votes_upper)


estimated_race <- estimated_county %>%
  #This will be the absolute BEST result for Democrats and the BEST result for Republicans!
  group_by(state) %>%
  summarize(total_votes_lower = sum(total_votes_lower), 
            total_votes_upper = sum(total_votes_upper), 
            dem_votes_lower = sum(dem_votes_lower), 
            rep_votes_lower = sum(rep_votes_lower), 
            dem_votes_upper = sum(dem_votes_upper), 
            rep_votes_upper = sum(rep_votes_upper)) %>%
  mutate(office_type = "President")

#----- FINALIZING DATASETS AND WRITING THEM TO CSV! -----
#We now need to combine these values with the original datasets, and put them back!
finalized_county_results <- pre_model_county %>%
  left_join(estimated_county, by = c("state", "fips", "office_type")) %>%
  mutate(total_votes = Democratic_votes + Republican_votes + Independent_votes + Green_votes, 
         expected_pct_in = pmin(100, 200 * total_votes / (total_votes_lower + total_votes_upper))) %>%
  select(office_type, state, county, district, fips, contains("name"), 
         pct_reporting, Democratic_votes, Republican_votes, Independent_votes, Green_votes, total_votes,
         Democratic_votes_percent, Republican_votes_percent, Independent_votes_percent, Green_votes_percent, 
         margin_votes, margin_pct, pct_absentee, absentee_margin, swing, performance_vs_president, contains("lower"), 
         contains("upper"), expected_pct_in)

finalized_race_results <- pre_model_race %>%
  left_join(estimated_race, by = c('state', 'office_type')) %>%
  mutate(expected_pct_in = pmin(100, 200 * total_votes / (total_votes_lower + total_votes_upper)), 
         dem_votes_pct = 100 * dem_votes / total_votes, 
         rep_votes_pct = 100 * rep_votes / total_votes, 
         ind_votes_pct = 100 * ind_votes / total_votes, 
         green_votes_pct = 100 * green_votes / total_votes, 
         swing = margin_pct - margin_pct_1) %>%
  select(office_type, state, district, contains("name"), 
         pct_reporting, dem_votes, rep_votes, ind_votes, green_votes, total_votes, contains("pct"),
         margin_votes, margin_pct, pct_absentee, absentee_margin, swing, contains("lower"), 
         contains("upper"), expected_pct_in) %>%
  left_join(this_time_2020, by = c("office_type", "state", "district"))

#PUTTING IN FINAL DATA!
write_csv(finalized_county_results, "cleaned_data/Changing Data/DDHQ_current_county_results.csv")
write_csv(finalized_race_results, "cleaned_data/Changing Data/DDHQ_current_race_results.csv")
