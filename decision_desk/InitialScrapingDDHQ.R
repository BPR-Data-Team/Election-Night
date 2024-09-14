id <- 25403
scrape_data <- function(ddhq_id) {
  library(tidyverse)
  library(jsonlite)
  library(lubridate)
  library(glue)
  library(httr)
  library(furrr)
  library(memoise)
  
  url <- glue("https://embed-api.ddhq.io/v1/races/{ddhq_id}")
  print(url)
  
  response <- GET(url)
  if (http_error(response)) {
    return(NULL)
  }
  
  json_text <- content(response, as = "text", encoding = "UTF-8")
  
  json_data <- fromJSON(json_text)
  
  office_type <- json_data$office

  #Getting mapping of candidate to candidate ID
  candidate_dataset <- json_data$candidates 
  
  if (is_empty(candidate_dataset)) {
    return (NULL)
  } else{
    candidate_dataset <- candidate_dataset %>% 
      mutate(full_name = paste(first_name, last_name), 
                                cand_id = as.character(cand_id))
  }
  
  year <- json_data$year
  
  state <- json_data$state
  
  #Caucus, house, etc.
  election_type <- json_data$name
  
  
  #State-level races should be 0
  district <- as.character(json_data$district %>% ifelse(is.null(.), 0, .))
  
  
  last_updated <- json_data$last_updated %>% 
    ymd_hms() %>% 
    with_tz("America/New_York")
  
  uncontested <- json_data$uncontested
  
  return_df <- tryCatch(
    {
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
        pivot_wider(names_from = vote_type, values_from = votes)
      
      county_votes_dataset <- vcus %>% 
        left_join(candidate_dataset, by = c("candidate_id" = "cand_id")) %>% 
        mutate(ddhq_id = ddhq_id, year = year, state = state, district = district, 
               last_updated = last_updated, election_type = election_type, 
               office_type = office_type, uncontested = uncontested) %>% 
        select(ddhq_id, year, office_type, election_type, state, county, district, 
               fips, full_name, party_name, total, reporting, total_votes, 
               absentee_ballots_early_votes, election_day_votes, last_updated, uncontested)
      
      return(county_votes_dataset)
    }, 
    error = function(cond) {
      message(glue("Here's the original error message for id {ddhq_id}:"))
      # Return NA in case of error
      return(NULL)
    }
  )
  return(return_df)
  
}

ids <- 10000:80000

scrape_data_memo <- memoise(scrape_data)

plan(multisession, workers = parallel::detectCores())

results <- future_map(ids, scrape_data_memo, .progress = TRUE)

results_df <- list_rbind(results)

finalized_df <- results_df %>% 
  filter(office_type %in% c("US Senate", "US House", "President", "Governor") & 
           election_type == "General Election") %>% 
  select(ddhq_id, year, office_type, state, district) %>% 
  distinct() %>% 
  mutate(district = case_when(
    district == "At-Large" ~ "1", 
    district == "" ~ "0", 
    .default = district
  ))

write_csv(finalized_df, "cleaned_data/DDHQ_api_calls.csv")
