#THIS FILE EXISTS PURELY TO GET THE IDS THAT HAVE ELECTIONS WE CARE ABOUT!
scrape_data_mini <- function(ddhq_id) {
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
  
  year <- json_data$year
  
  state <- json_data$state
  
  #Caucus, house, etc.
  election_type <- json_data$name
  
  test_data <- json_data$test_data
  
  district <- as.character(ifelse(is.null(json_data$district), "0", json_data$district))
  
  last_updated <- json_data$last_updated %>% 
    ymd_hms() %>% 
    with_tz("America/New_York")
  
  uncontested <- json_data$uncontested
  
  return(list(
    ddhq_id = ddhq_id,
    year = year, 
    office_type = office_type, 
    state = state, 
    district = district,
    election_type = election_type,
    test_data = test_data, 
    last_updated = last_updated
  ))
}

ids <- 10000:100000

scrape_data_memo <- memoise(scrape_data_mini)

plan(multisession, workers = parallel::detectCores())

results <- future_map(ids, scrape_data_memo, .progress = TRUE)

results_df <- bind_rows(results)

finalized_df <- results_df %>% 
  filter(office_type %in% c("US Senate", "US House", "President", "Governor") & 
           election_type == "General Election" & 
           year == 2024) %>% 
  select(ddhq_id, test_data, year, office_type, state, district) %>% 
  distinct() %>% 
  mutate(district = case_when(
    district == "At-Large" ~ "1", 
    district == "" ~ "0", 
    .default = district
  ))

#write_csv(finalized_df, "cleaned_data/DDHQ_api_calls.csv")
