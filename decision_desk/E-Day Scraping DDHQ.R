library(tidyverse)
library(jsonlite)
library(lubridate)
library(glue)
library(httr)
library(furrr)

#THIS FILE EXISTS TO USE DURING ELECTION DAY! WE TAKE ALL THE IDs WE KNOW ARE IMPORTANT
#AND THEN FETCH ALL OF THAT DATA

#----- FETCHING DATA -----
scrape_data <- function(ddhq_id) {

  url <- glue("https://embed-api.ddhq.io/v1/races/{ddhq_id}")
  print(url)
  
  response <- GET(url)
  if (http_error(response)) {
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
  
  #Caucus, general, etc.
  election_type <- json_data$name

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
        flatten() %>% 
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
             last_updated = last_updated, election_type = election_type, 
             office_type = office_type, uncontested = uncontested, test_data = test_data) %>% 
        select(ddhq_id, year, test_data, office_type, election_type, state, county, district, 
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

#We previously found which APIs were important
ids <- read_csv("cleaned_data/DDHQ_api_calls.csv") %>% pull(ddhq_id) 

plan(multisession, workers = parallel::detectCores())

results <- future_map(ids, scrape_data, .progress = TRUE)

results_df <- list_rbind(results)

#----- CLEANING DATA ------
results_df <- results_df %>%
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
  select(test_data,ddhq_id, year, office_type, election_type, state, county, district, fips, 
         Democratic_name, Republican_name, Independent_name, Green_name, total, reporting,
         pct_reporting, Democratic_votes, Republican_votes, Independent_votes, Green_votes, 
         Democratic_votes_percent, Republican_votes_percent, Independent_votes_percent, Green_votes_percent, 
         margin_votes, margin_pct, pct_absentee, absentee_margin) %>%
  #When no votes have been counted, we want this to show zero? I THINK
  mutate(across(contains("votes"), ~ replace_na(., 0)),
         across(contains("name"), ~ ifelse(. == "NULL", "NONE", .)), 
         margin_pct = replace_na(margin_pct, 0), 
         fips = str_sub(fips, -3))


#------ COMBINING DATA ------


#------ COUNTY DATASET -------
past_county <- read_csv("cleaned_data/historical_county.csv") %>% 
  mutate(fips = ifelse(state == "AK", "", fips), 
         district = as.character(district)) %>% 
  select(-county)

#For senate/gov elections, calculating how well they're doing relative to the president
performance_vs_president <- results_df %>%
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
  
final_county_dataset <- results_df %>%
  left_join(past_county, by = c("office_type", "district", "state", "fips")) 
  filter(!(is.na(margin_pct_1) & office_type %in% c("President", "Senate") & state %in% c("HI", "MO", "MD"))) %>% #Some weird stuff here...
  mutate(swing = margin_pct - margin_pct_1) %>% #Calculating swing from previous election
  left_join(performance_vs_president, by = c("state", "district", "county", "office_type"))
  

#------ RACE-LEVEL DATASET ------
past_race_data <- read_csv("cleaned_data/Past_race_data.csv")

#Combining all county datasets to get a final dataset of one value by race!
final_race_dataset <- final_county_dataset %>% 
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
    total_absentee_votes = sum(total_absentee_votes), 
    absentee_margin_votes = sum(absentee_margin_votes)
  ) %>%
  mutate(pct_reporting = 100 * precincts_reporting / total_precincts, 
         margin_votes = dem_votes - rep_votes, 
         margin_pct = 100*(dem_votes - rep_votes) / total_votes, 
         absentee_pct = 100 * total_absentee_votes/ total_votes, 
         absentee_margin_pct = 100 * absentee_margin_votes / total_absentee_votes) %>%
  select(office_type, state, district, Democratic_name, Republican_name, Independent_name, 
         pct_reporting, total_votes, margin_votes, margin_pct,
         absentee_pct, absentee_margin_pct) %>%
  left_join(past_race_data, by = c("office_type", "state"))

write_csv(test_df, "cleaned_data/DDHQ_test_data.csv")
#write_csv(results_df, "cleaned_data/DDHQ_current_results.csv")
