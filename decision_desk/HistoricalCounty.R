library(tidyverse)
library(jsonlite)
library(lubridate)
library(glue)
library(httr)
library(furrr)


#We read in files here

pres_2020 <- read_csv("cleaned_data/President by Precinct/2020 git data.csv") %>%
  mutate(margin_votes_1 = democrat_votes - republican_votes , 
         margin_pct_1 = 100*(democrat_votes - republican_votes)/total_votes, 
         office_type = "President", 
         state = state.abb[match(state, state.name)]) %>%
  mutate(county = case_when(
    county == "LaSalle Parish" ~ "La Salle Parish", 
    county == "DoÃ±a Ana County" ~ "Dona Ana County", 
    county == "Oglala Lakota County" ~ "Oglala County", 
    TRUE ~ county
  )) %>% #Some weird county naming...
  select(state, county, margin_pct_1, margin_votes_1) %>%
  add_row(state = "DC", county = "District of Columbia", margin_pct_1 = 86.75, 
          margin_votes_1 = 298737)

pres_2016 <- read_csv("cleaned_data/President by Precinct/2016 git data.csv") %>%
  mutate(margin_votes_2 = democrat_votes - republican_votes , 
         margin_pct_2 = 100*(democrat_votes - republican_votes)/total_votes) %>%
  select(state, county, margin_pct_2, margin_votes_2)

senate_2018 <- read_csv("cleaned_data/Senate by Precinct/2018 Senate.csv") %>%
  mutate(margin_votes_1 = dem_votes - gop_votes,
         margin_pct_1 = 100 *(dem_votes - gop_votes)/total_votes, 
         office_type = "Senate") %>%
  select(state, county, office_type, margin_pct_1, margin_votes_1)

#When we're dealing with Pres files, we want to include both the previous election and the election before
#Harder to do so with senate, so we only take the most recent (1) instead of both (2)

past_county_values <- pres_2020 %>%
  full_join(pres_2016, by = c("state", "county")) 

#Alaska is weird -- we're just saying it's one county and calling it a day lol
alaska <- past_county_values %>% 
  filter(state == "AK") %>% 
  group_by(state) %>% 
  summarize(across(contains("margin"), ~ sum(., na.rm = TRUE))) %>% 
  mutate(county = "Alaska")

#Finishing up past county values
past_county_values <- past_county_values %>% 
  filter(state != "AK") %>% 
  bind_rows(alaska) %>%
  mutate(office_type = "President", .before = everything()) %>%
  bind_rows(senate_2018) %>%
  mutate(county = str_remove(county, " County"))

write_csv(past_county_values, "cleaned_data/Past_county_values.csv")
