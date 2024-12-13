library(tidyverse)
library(jsonlite)
library(lubridate)
library(glue)
library(httr)
library(furrr)
library(Hmisc, exclude = c("units", "format.pval", "src", "summarize"))

#----- PART 1: SCRAPING AND CLEANING DATA ------
# Reading in Locally-Hosted Datasets ######
ids <- read_csv("cleaned_data/Locally-Hosted Data/DDHQ_api_calls.csv") %>% pull(ddhq_id) 

past_county_data <- read_csv("cleaned_data/Locally-Hosted Data/historical_county.csv") %>% 
  mutate(fips = ifelse(state == "AK", "", fips), 
         district = as.character(district)) %>% 
  select(-county)

when_to_expect_results <- read_csv("cleaned_data/Locally-Hosted Data/When_to_expect_results.csv") %>%
  select(Abbreviate, District, Office_type, `When to call`, `Race to watch`, `Last Poll Close`) %>%
  rename(state = Abbreviate, 
         district = District, 
         office_type = Office_type, 
         when_to_call = `When to call`, 
         poll_close = `Last Poll Close`,
         race_to_watch = `Race to watch`) %>%
  mutate(race_to_watch = replace_na(race_to_watch, FALSE), 
         district = replace_na(district, 0))

past_race_data <- read_csv("cleaned_data/Locally-Hosted Data/historical_elections.csv")

county_demographics <- read_csv("cleaned_data/Locally-Hosted Data/County_Demographics.csv")

state_fips <- read_csv("cleaned_data/Locally-Hosted Data/StateFips.csv") # necessary for DDHQ

towns_to_counties <- read_csv("cleaned_data/Locally-Hosted Data/TownsToCounties.csv") %>%
  unique() #Logan gave duplicate data for some oopsies


###### FETCHING DATA, AT THIS POINT NOTHING LOCALLY IS NEEDED ###### 
scrape_data <- function(ddhq_id) {
  
  url <- glue("https://embed-api.ddhq.io/v2/races/{ddhq_id}")
  print(url)
  
  response <- GET(url)
  if (http_error(response)) {
    print("Error on http response")
    return(NULL)
  }
  
  json_text <- content(response, as = "text", encoding = "UTF-8")
  
  json_data <- fromJSON(json_text) #Full JSON Data used for fetching
  
  office_type <- json_data$office #President, etc.
  
  #Getting mapping of candidate to candidate ID
  candidate_dataset <- json_data$candidates 
  
  if (is_empty(candidate_dataset)) {
    return (NULL)
  } else{
    candidate_dataset <- candidate_dataset %>% 
      mutate(cand_id = as.character(cand_id), 
             name = paste(first_name, last_name)) %>%
      select(-c(percent, votes)) #Allows for linking with final dataset
  }
  
  #gets state abbreviation
  ddhq_fips = str_sub(json_data$fips, end = 2)
  
  #Making sure state works when it is NE/ME district and president 
  state <- case_when(
    json_data$state_fips == "31_02" ~ "NE2",
    json_data$state_fips == "23_01" ~ "ME1", 
    json_data$state_fips == "23_02" ~ "ME2", 
    TRUE ~ state_fips[ddhq_fips == state_fips$`FIPS Code`, ]$`State Abbreviation`
  )
  
  district <- as.character(ifelse(is.null(json_data$district), "0", json_data$district))  
  
  last_updated <- json_data$last_updated %>% 
    ymd_hms() %>% 
    with_tz("America/New_York")
  
  uncontested <- json_data$uncontested
  
  return_df <- tryCatch(
    {
      
      #Cleaning votes by county
      vcus <- json_data$vcus %>%
        jsonlite::flatten() %>%
        unnest(candidates) %>%
        rename(county = name)
    
      #Fixing New England States Here
      #We combine townships into counties
      if (state %in% c("ME", "ME1", "ME2", "NH", "VT", "MA", "RI")) {
        
        #We need to give it another name since state is a name in the dataframe itself
        ddhq_state <- state
        
        #Only take county/towns from the specific state -- taking the first two because of ME1 -> ME
        state_county_township <- towns_to_counties %>% filter(state == str_sub(ddhq_state, end = 2))
        
        vcus <- vcus %>%
          rename(town = county) %>%
          select(-fips) %>%
          left_join(state_county_township, by = "town") %>% # Joining dataset with maine county-township data!
          select(-c(town, state)) %>%
          filter(!is.na(county)) %>%
          group_by(county, fips, cand_id) %>% #Summing votes over all townships by county
          summarize(votes = sum(votes), 
                    precincts.total = sum(precincts.total), 
                    precincts.reporting = sum(precincts.reporting))
      } 
      
      #Regardless of the race, this stays exactly the same
      county_votes_dataset <- vcus %>%
        left_join(candidate_dataset, by = c("cand_id")) %>%
        group_by(cand_id) %>%
        mutate(candidate_votes = sum(votes)) %>%
        group_by(party_name) %>%
        filter(candidate_votes == max(candidate_votes)) %>% #only keeping candidate with most votes
        ungroup() %>%
        filter(party_name %in% c("Democratic", "Republican", "Independent", "Green")) %>%
        #Pivots wider -- the sum here is ONLY useful for races that have no votes in yet and have jungle primaries
        pivot_wider(names_from = party_name, values_from = c(votes, name), id_cols = c(fips, county, precincts.total, precincts.reporting), 
                    values_fn = c(votes = sum, name = first), names_glue = "{party_name}_{.value}") %>% 
        mutate(ddhq_id = ddhq_id, year = 2024, state = state, district = district, 
               last_updated = last_updated,
               office_type = office_type, uncontested = uncontested, test_data = FALSE) %>% 
        rename(total = precincts.total, reporting = precincts.reporting) %>%
        select(ddhq_id, year, test_data, office_type, state, county, district, 
               fips, contains("vote"), contains("name"), total, reporting, uncontested) 
      
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
  mutate(pct_absentee = NA, 
         absentee_margin = NA) %>%
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
  select(office_type, state, district, county, margin_pct) %>%
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
  mutate(fips = ifelse(state == "VT" & county == "Chittenden", "007", fips), 
         fips = ifelse(state == "NH" & county == "Sullivan", "019", fips)) %>%
  left_join(past_county_data, by = c("office_type", "district", "state", "fips")) %>%
  filter(!(is.na(margin_pct_1) & office_type %in% c("President", "Senate") & state %in% c("HI", "MO", "MD", "NE"))) %>% #Some weird stuff here...
  mutate(swing = margin_pct - margin_pct_1) %>% #Calculating swing from previous election
  left_join(performance_vs_president, by = c("state", "district", "county", "office_type")) %>%
  mutate(Democratic_name = ifelse(Independent_name %in% c("Dan Osborn", "Angus King"), Independent_name, Democratic_name),
         Democratic_votes = ifelse(Independent_name %in% c("Dan Osborn", "Angus King"), Independent_votes, Democratic_votes),
         Democratic_votes_percent = ifelse(Independent_name %in% c("Dan Osborn", "Angus King"), Independent_votes_percent, Democratic_votes_percent),
         margin_pct = ifelse(Independent_name %in% c("Dan Osborn", "Angus King"), (Independent_votes_percent - Republican_votes_percent), margin_pct),
         swing = ifelse(Independent_name %in% c("Dan Osborn", "Angus King"), (Independent_votes_percent - Republican_votes_percent) -
                          margin_pct_1, swing), 
         #When number of precincts is 0 for some reason, it says infinite
         pct_reporting = ifelse(pct_reporting == Inf | is.na(pct_reporting), 0, pct_reporting))


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
  mutate(pct_reporting = ifelse(pct_reporting == Inf | is.na(pct_reporting), 0, pct_reporting)) %>%
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
  mutate(dem_votes = Democratic_votes, 
         rep_votes = Republican_votes, 
         total_votes = 100 * margin_votes / margin_pct, 
         total_votes_2020 = 100 * margin_votes_1 / margin_pct_1,
         pct_reporting = replace_na(pct_reporting, 0)) %>%
  select(fips, state, pct_reporting, total_votes, dem_votes, rep_votes, total_votes_2020, democratic_votes_1, republican_votes_1) %>%
  rename(dem_votes_2020 = democratic_votes_1, 
         rep_votes_2020 = republican_votes_1)

county_and_dems <- live_data %>%
  left_join(county_demographics, by = c("fips", "state")) %>%
  filter(!is.na(total_population))

###### WE RUN THREE DIFFERENT MODELS -- ONE FOR TOTAL TURNOUT, ONE FOR DEMS/REP #####
# Predicting vote shares
finished_counties <- county_and_dems %>%
  filter(pct_reporting == 100 & !(state %in% c("NH", "VT", "MA", "ME", "DC"))) %>%
  mutate(
    total_votes = ifelse(is.na(total_votes), dem_votes + rep_votes, total_votes), #Some states have weird stuff?
    vote_differential = log(total_votes / total_votes_2020), 
    margin_differential = 100 * (((dem_votes - rep_votes) / total_votes) - ((dem_votes_2020 - rep_votes_2020) / total_votes_2020))
  ) %>%
  select(vote_differential, margin_differential, total_population:proportion_less_than_hs_asian)

#We only begin to run the model once there are 50 or more finished counties!
if (nrow(finished_counties) > 50) {
  
  #Usual conformal prediction guarantees that 95% of COUNTIES are within the prediction, 
  #We want to make sure that 95% of PEOPLE are within the prediction, so we need to upweight on 
  #Total turnout from 2020
  turnout_2020_finished_counties <- county_and_dems %>%
    filter(pct_reporting == 100 & !(state %in% c("NH", "VT", "MA", "ME", "DC"))) %>%
    pull(total_votes_2020)
  
  # Creating vote models
  vote_model <- lm(vote_differential ~ ., data = finished_counties %>% select(-margin_differential))
  margin_model <- lm(margin_differential ~ ., data = finished_counties %>% select(-vote_differential,))
  
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
    quantiles <- wtd.quantile(loo_errors, probs = c(alpha / 2, 1 - alpha / 2), 
                              weights = turnout_2020_finished_counties)
    
    # Return the quantiles
    return(list(
      lower_quantile = quantiles[1],
      upper_quantile = quantiles[2]
    ))
  }
  
  # For total vote differential
  vote_quantiles <- conformal_prediction(vote_model)
  
  # For Margins
  margin_quantiles <- conformal_prediction(margin_model)
  
  #Getting results for all unfinished counties
  model_estimates <- county_and_dems %>%
    filter(pct_reporting != 100) %>%
    mutate(
      # Predictions
      vote_pred = predict(vote_model, newdata = select(., total_population:proportion_less_than_hs_asian)),
      margin_pred = predict(margin_model, newdata = select(., total_population:proportion_less_than_hs_asian)),
      
      # Conformal prediction intervals for margins
      margin_estimate = margin_pred + 100 * (dem_votes_2020 - rep_votes_2020) / total_votes_2020, 
      margin_lower = margin_estimate + margin_quantiles$lower_quantile, 
      margin_upper = margin_estimate + margin_quantiles$upper_quantile,
      
      # Conformal prediction intervals for total votes
      vote_lower = vote_pred + vote_quantiles$lower_quantile,
      vote_upper = vote_pred + vote_quantiles$upper_quantile,
      
      # Calculate total vote estimates
      total_votes_estimate = exp(vote_pred) * total_votes_2020,
      total_votes_lower = exp(vote_lower) * total_votes_2020,
      total_votes_upper = exp(vote_upper) * total_votes_2020,
    ) %>%
    select(fips, state, total_votes_estimate, total_votes_lower, total_votes_upper, 
           margin_estimate, margin_lower, margin_upper)
  
  
  # Get finalized county results for everything!
  estimated_county <- county_and_dems %>%
    left_join(model_estimates, by = c("fips", "state")) %>%
    mutate(
      # For finished counties, use actual votes
      total_votes_estimate = ifelse(pct_reporting == 100, total_votes, total_votes_estimate),
      total_votes_lower = ifelse(pct_reporting == 100, total_votes, total_votes_lower), 
      total_votes_upper = ifelse(pct_reporting == 100, total_votes, total_votes_upper),
      
      margin_estimate = ifelse(pct_reporting == 100, 100 * (dem_votes - rep_votes) / total_votes_2020, margin_estimate),
      margin_lower = ifelse(pct_reporting == 100, 100 * (dem_votes - rep_votes) / total_votes_2020, margin_lower), 
      margin_upper = ifelse(pct_reporting == 100, 100 * (dem_votes - rep_votes) / total_votes_2020, margin_upper),
    ) %>%
    mutate(across(contains("estimate"), ~replace_na(., 0)),
           across(contains("lower"), ~replace_na(., 0)), 
           across(contains("upper"), ~replace_na(., 0)), 
           office_type = "President") %>%
    select(fips, state, office_type, total_votes_estimate:margin_upper)
  
  
  estimated_race <- estimated_county %>%
    #This will be the absolute BEST result for Democrats and the BEST result for Republicans!
    group_by(state) %>%
    summarize(total_votes_estimate = sum(total_votes_estimate),
              total_votes_lower = sum(total_votes_lower), 
              total_votes_upper = sum(total_votes_upper)) %>%
    mutate(office_type = "President")
  
  #----- FINALIZING DATASETS AND WRITING THEM TO CSV! -----
  #We now need to combine these values with the original datasets, and put them back!
  finalized_race_results <- pre_model_race %>%
    left_join(estimated_race, by = c('state', 'office_type')) %>%
    mutate(expected_pct_in = 100 * pmin(1, total_votes / total_votes_estimate), 
           dem_votes_pct = 100 * dem_votes / total_votes, 
           rep_votes_pct = 100 * rep_votes / total_votes, 
           ind_votes_pct = 100 * ind_votes / total_votes, 
           green_votes_pct = 100 * green_votes / total_votes, 
           swing = margin_pct - margin_pct_1, 
           votes_remaining = total_votes_estimate - total_votes) %>% 
    select(office_type, state, district, contains("name"), 
           pct_reporting, dem_votes, rep_votes, ind_votes, green_votes, total_votes, contains("pct"),
           margin_votes, margin_pct, pct_absentee, absentee_margin, swing, democratic_votes_1, democratic_votes_2, 
           republican_votes_1, republican_votes_2, democratic_percent_1, democratic_percent_2, 
           republican_percent_1, republican_percent_2, margin_pct_1, margin_votes_1, 
           margin_pct_2, margin_votes_2, votes_remaining, contains("estimate"), contains("lower"), 
           contains("upper"), expected_pct_in) %>%
    mutate(across(votes_remaining:expected_pct_in, ~ round(., 0))) %>%
    left_join(when_to_expect_results, by = c("office_type", "state", "district")) %>%
    mutate(total_votes = replace_na(total_votes, 0))
  
  
  #Connecticut has weird townships, so we need to combine all results into one "county", which is the entire state
  ct_results <- finalized_race_results %>%
    filter(state == "CT") %>% 
    rename(Democratic_votes = dem_votes, Republican_votes = rep_votes, Independent_votes = ind_votes, Green_votes = green_votes, 
           Democratic_votes_percent = dem_votes_pct, Republican_votes_percent = rep_votes_pct, 
           Independent_votes_percent = ind_votes_pct, Green_votes_percent = green_votes_pct) %>%
    #Connecticut should be one state, not multiple counties
    mutate(county = "Connecticut", 
           fips = "000",
           district = as.character(district))
  
  
  finalized_county_results <- pre_model_county %>%
    left_join(estimated_county, by = c("state", "fips", "office_type")) %>%
    mutate(fips = ifelse(state == "AK", "000", fips)) %>%
    filter(state != "CT") %>% 
    bind_rows(ct_results) %>%
    mutate(total_votes = Democratic_votes + Republican_votes + Independent_votes + Green_votes, 
           expected_pct_in = pmin(100, 200 * total_votes / (total_votes_lower + total_votes_upper)), 
           votes_remaining = total_votes_estimate - total_votes) %>%
    select(office_type, state, county, district, fips, contains("name"), 
           pct_reporting, Democratic_votes, Republican_votes, Independent_votes, Green_votes, total_votes,
           Democratic_votes_percent, Republican_votes_percent, Independent_votes_percent, Green_votes_percent, 
           margin_votes, margin_pct, pct_absentee, absentee_margin, swing, democratic_votes_1, 
           democratic_percent_1, republican_votes_1, republican_percent_1, margin_pct_1, margin_votes_1, 
           democratic_votes_2, democratic_percent_2, republican_votes_2, republican_percent_2, 
           margin_pct_2, margin_votes_2, performance_vs_president, votes_remaining, contains("estimate"), 
           contains("lower"), contains("upper"), expected_pct_in) %>%
    mutate(across(votes_remaining:expected_pct_in, ~ round(., 0))) %>%
    mutate(total_votes = replace_na(total_votes, 0))
  
} else {
  
  finalized_race_results <- pre_model_race %>% 
    mutate(total_votes_estimate = NA,
           total_votes_lower = NA, 
           total_votes_upper = NA,
           expected_pct_in = 0, 
           dem_votes_pct = 100 * dem_votes / total_votes, 
           rep_votes_pct = 100 * rep_votes / total_votes, 
           ind_votes_pct = 100 * ind_votes / total_votes, 
           green_votes_pct = 100 * green_votes / total_votes, 
           swing = margin_pct - margin_pct_1, 
           votes_remaining = total_votes_estimate - total_votes) %>%
    left_join(when_to_expect_results, by = c("office_type", "state", "district")) %>%
    mutate(total_votes = replace_na(total_votes, 0))
  
  
  #Connecticut has weird townships, so we need to combine all results into one "county", which is the entire state
  ct_results <- finalized_race_results %>%
    filter(state == "CT") %>% 
    rename(Democratic_votes = dem_votes, Republican_votes = rep_votes, Independent_votes = ind_votes, Green_votes = green_votes, 
           Democratic_votes_percent = dem_votes_pct, Republican_votes_percent = rep_votes_pct, 
           Independent_votes_percent = ind_votes_pct, Green_votes_percent = green_votes_pct) %>%
    #Connecticut should be one state, not multiple counties
    mutate(county = "Connecticut", 
           fips = "000",
           district = as.character(district))
  
  finalized_county_results <- pre_model_county %>%
    mutate(total_votes = 100 * margin_votes / margin_pct, 
           votes_remaining = NA, 
           total_votes_estimate = NA, 
           margin_estimate = NA, 
           total_votes_lower = NA, 
           margin_lower = NA, 
           total_votes_upper = NA, 
           margin_upper = NA, 
           expected_pct_in = 0) %>%
    mutate(fips = ifelse(state == "AK", "000", fips)) %>%
    filter(state != "CT") %>%
    bind_rows(ct_results) %>%
    select(office_type, state, county, district, fips, contains("name"), 
          pct_reporting, Democratic_votes, Republican_votes, Independent_votes, Green_votes, total_votes,
          Democratic_votes_percent, Republican_votes_percent, Independent_votes_percent, Green_votes_percent, 
          margin_votes, margin_pct, pct_absentee, absentee_margin, swing, democratic_votes_1, 
          democratic_percent_1, republican_votes_1, republican_percent_1, margin_pct_1, margin_votes_1, 
          democratic_votes_2, democratic_percent_2, republican_votes_2, republican_percent_2, 
          margin_pct_2, margin_votes_2, performance_vs_president, votes_remaining, contains("estimate"), 
          contains("lower"), contains("upper"), expected_pct_in) %>%
    mutate(total_votes = replace_na(total_votes, 0))
  
}

#PUTTING IN FINAL DATA!
write_csv(finalized_county_results, "cleaned_data/Changing Data/DDHQ_current_county_results.csv")
write_csv(finalized_race_results, "cleaned_data/Changing Data/DDHQ_current_race_results.csv")

