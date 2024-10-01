library(tidyverse)
library(jsonlite)
library(lubridate)
library(glue)
library(httr)
library(furrr)


url <- "https://static01.nyt.com/elections-assets/2020/data/api/2020-11-03/national-map-page/national/president.json"

response <- GET(url)
if (http_error(response)) {
  return(NULL)
}

json_text <- content(response, as = "text", encoding = "UTF-8")

json_data <- fromJSON(json_text)

counties <- json_data$data$races %>% 
  select(race_id, counties) %>% 
  unnest(counties) %>%
  jsonlite::flatten() %>%
  select(race_id, fips, name, votes, absentee_votes, results.bidenj, results.trumpd, results_absentee.trumpd, 
         results_absentee.bidenj) %>%
  mutate(state = str_sub(race_id, end = 2), 
         fips = str_sub(fips, -3),
         margin_votes_1 = results.bidenj - results.trumpd, 
         margin_pct_1 = 100 * margin_votes_1 / votes, 
         absentee_pct_1 = 100 * absentee_votes / votes, 
         absentee_margin_pct_1 = 100 * (results_absentee.bidenj - results_absentee.trumpd) / absentee_votes) %>% 
  select(state, fips, name, margin_votes_1, margin_pct_1, absentee_pct_1, absentee_margin_pct_1) %>%
  rename(county = name)

write_csv(counties, "cleaned_data/President by Precinct/NYT_2020_Pres.csv")

timeline <- json_data$data$races %>%
  select(race_id, timeseries) %>%
  unnest(timeseries) %>%
  jsonlite::flatten() %>%
  mutate(state = str_sub(race_id, end = 2), 
         biden_pct = 100 * vote_shares.bidenj, 
         trump_pct = 100 * vote_shares.trumpd, 
         margin = biden_pct - trump_pct,
         pct_in = eevp, 
         timestamp = as_datetime(timestamp)) %>%
  select(state, biden_pct, trump_pct, margin, eevp, votes, timestamp) %>% 
  filter(votes != 0) %>% 
  mutate(timestamp = timestamp - hours(5))

write_csv(timeline, "cleaned_data/Same_Time_2020.csv")