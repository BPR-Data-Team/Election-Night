library(tidyverse)
library(jsonlite)
library(lubridate)
library(glue)
library(httr)
library(furrr)


#We read in files here
load("data/dataverse_shareable_gubernatorial_county_returns_1865_2020.Rdata")

pres_2020 <- read_csv("cleaned_data/President by Precinct/2020 git data.csv") %>%
  mutate(margin_votes_1 = democrat_votes - republican_votes , 
         margin_pct_1 = 100*(democrat_votes - republican_votes)/total_votes, 
         office_type = "President", 
         state = state.abb[match(state, state.name)], 
         fips = str_sub(fips, -3)) %>%
  mutate(county = case_when(
    county == "LaSalle Parish" ~ "La Salle Parish", 
    county == "Doña Ana County" ~ "Dona Ana County", 
    county == "Oglala Lakota County" ~ "Oglala County", 
    TRUE ~ county
  )) %>% #Some weird county naming...
  select(state, county, fips, margin_pct_1, margin_votes_1,) %>%
  add_row(state = "DC", county = "District of Columbia", margin_pct_1 = 86.75, 
          margin_votes_1 = 298737, fips = "001")

pres_2016 <- read_csv("cleaned_data/President by Precinct/2016 git data.csv") %>%
  mutate(margin_votes_2 = democrat_votes - republican_votes , 
         margin_pct_2 = 100*(democrat_votes - republican_votes)/total_votes, 
         fips = str_sub(as.character(fips), -3), 
         #Weird stuff with a county in SD, this makes all counties have the same FIPS code
         fips = ifelse(county == "Oglala County", 102, fips)) %>%
  select(state, county, fips, margin_pct_2, margin_votes_2)

senate_2018 <- read_csv("cleaned_data/Senate by Precinct/2018 Senate.csv") %>%
  mutate(margin_votes_1 = dem_votes - gop_votes,
         margin_pct_1 = 100 *(dem_votes - gop_votes)/total_votes, 
         office_type = "Senate", 
         state = state.abb[match(state, state.name)]) %>%
  select(state, county, office_type, margin_pct_1, margin_votes_1)

#When we're dealing with Pres files, we want to include both the previous election and the election before
#Harder to do so with senate, so we only take the most recent (1) instead of both (2)

past_county_values <- pres_2020 %>%
  full_join(pres_2016, by = c("state", "county", "fips")) 

#Finishing up past county values
past_county_values <- past_county_values %>% 
  filter(state != "AK") %>%
  mutate(office_type = "President", .before = everything()) %>%
  bind_rows(senate_2018) %>%
  mutate(county = str_remove(county, " County")) %>% 
  add_row(office_type = "President", 
          state = "AK", 
          county = "Alaska", 
          fips = "", 
          margin_pct_1 = -10.06, 
          margin_pct_2 = -14.73, 
          margin_votes_1 = -36173, 
          margin_votes_2 = -46933)

#----- GUBERNATORIAL DATA

historical_gov <- gov_elections_release %>%
  group_by(state) %>% 
  mutate(recent_rank = dense_rank(desc(election_year))) %>% 
  ungroup() %>%
  filter(recent_rank %in% c(1, 2)) %>%
  select(recent_rank, county, fips, raw_county_vote_totals, democratic_raw_votes, republican_raw_votes)


past_race_data <- past_county_values %>%
  group_by(office_type, state) %>% 
  summarize(margin_votes_1 = sum(margin_votes_1), 
            margin_pct_1 = 100 * margin_votes_1 / sum(100 * margin_votes_1 / margin_pct_1), 
            margin_votes_2 = sum(margin_votes_2), 
            margin_pct_2 = 100 * margin_votes_2 / sum(100 * margin_votes_2 / margin_pct_2))

write_csv(past_county_values, "cleaned_data/Past_county_values.csv")
write_csv(past_race_data, "cleaned_data/Past_race_data.csv")
