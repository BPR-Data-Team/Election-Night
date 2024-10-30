library(tidyverse)
library(jsonlite)
library(lubridate)
library(glue)
library(httr)
library(furrr)

#----- PRESIDENTIAL HISTORICAL ------
#Presidential 2020 comes from NYT Data
pres_2020 <- read_csv("cleaned_data/Preparatory Data/President by Precinct/2020 git data.csv") %>%
  mutate(margin_votes_1 = democrat_votes - republican_votes, 
         margin_pct_1 = 100 * (democrat_votes - republican_votes) / total_votes, 
         state = state.abb[match(state, state.name)], 
         fips = str_sub(as.character(fips), -3)) %>%
  select(state, county, fips, margin_votes_1, margin_pct_1, democrat_vote_share, 
         republican_vote_share, democrat_votes, republican_votes) %>%
  rename(democratic_votes_1 = democrat_votes, 
         republican_votes_1 = republican_votes, 
         democratic_percent_1 = democrat_vote_share, 
         republican_percent_1 = republican_vote_share)

pres_2016 <- read_csv("cleaned_data/Preparatory Data/President by Precinct/2016 git data.csv") %>%
  mutate(margin_votes_2 = democrat_votes - republican_votes , 
         margin_pct_2 = 100*(democrat_votes - republican_votes)/total_votes, 
         fips = str_sub(as.character(fips), -3), 
         #Weird stuff with a county in SD, this makes all counties have the same FIPS code
         fips = ifelse(county == "Oglala County", 102, fips)) %>%
    select(state, county, fips, margin_votes_2, margin_pct_2, democrat_vote_share, 
           republican_vote_share, democrat_votes, republican_votes) %>%
    rename(democratic_votes_2 = democrat_votes, 
           republican_votes_2 = republican_votes, 
           democratic_percent_2 = democrat_vote_share, 
           republican_percent_2 = republican_vote_share)

#Treating all of alaska as one county, I guess?
alaska_2020 <- pres_2020 %>% 
  filter(state == "AK") %>%
  mutate(total_votes = 100 * margin_votes_1 / margin_pct_1) %>%
  summarize(state = 'AK', 
            county = "Alaska", 
            democratic_votes_1 = sum(democratic_votes_1), 
            republican_votes_1 = sum(republican_votes_1),
            margin_votes_1 = sum(margin_votes_1),
            margin_pct_1 = 100 * margin_votes_1 / sum(total_votes), 
            total_votes = sum(total_votes),
            fips = "013") %>%
  mutate(democratic_percent_1 = 100 * democratic_votes_1 / total_votes, 
         republican_percent_1 = 100 * republican_votes_1 / total_votes) %>% 
  select(-total_votes)

pres_2020 <- pres_2020 %>% 
  filter(state != "AK") %>% 
  bind_rows(alaska_2020)

#Final presidential values, by county
pres_county <- pres_2020 %>%
  full_join(pres_2016, by = c("state", "fips")) %>%
  mutate(county = county.x, 
         office_type = "President", 
         district = 0, .before = everything()) %>% 
  filter(!is.na(margin_pct_2) & !is.na(margin_pct_1)) %>% 
  select(-c(county.x, county.y)) 


#------ SENATE HISTORICAL -------
senate_2012 <- read_csv("cleaned_data/Preparatory Data/Senate by Precinct/2012 Senate.csv") %>%
  mutate(democratic_votes_2 = dem_votes, 
       republican_votes_2 = rep_votes) %>%
  select(office_type, state, county, district, fips, margin_votes, margin_percent, dem_votes_percent, rep_votes_percent, democratic_votes_2, republican_votes_2) %>% 
  rename(margin_votes_2 = margin_votes, margin_pct_2 = margin_percent, 
         democratic_percent_2 = dem_votes_percent, 
         republican_percent_2 = rep_votes_percent) %>% 
  rowwise() %>%
  mutate(fips = str_sub(fips, -3)) 

senate_2018 <- read_csv("cleaned_data/Preparatory Data/Senate by Precinct/2018 Senate.csv") %>%
  select(office_type, state, county, district, fips, margin_votes, margin_percent, dem_votes_percent, rep_votes_percent, dem_votes, rep_votes) %>% 
  rename(margin_votes_1 = margin_votes, 
         margin_pct_1 = margin_percent, 
         democratic_votes_1 = dem_votes, 
         republican_votes_1 = rep_votes, 
         democratic_percent_1 = dem_votes_percent, 
         republican_percent_1 = rep_votes_percent) %>% 
  rowwise() %>%
  mutate(fips = str_sub(fips, -3)) 

senate_county <- senate_2018 %>%
  full_join(senate_2012, by = c("office_type", "district", "state", "fips")) %>%
  filter(!is.na(margin_pct_1) & !is.na(margin_pct_2)) %>% 
  select(-county.y) %>% 
  rename(county = county.x)


#----- GOVERNOR HISTORICAL ------
gov_2020 <- read_csv("cleaned_data/Preparatory Data/Gubernatorial by Precinct/2020 Gubernatorial.csv") %>%
  select(office_type, state, county, district, fips, margin_votes, margin_percent, dem_votes_percent, rep_votes_percent, dem_votes, rep_votes) %>% 
  rename(margin_votes_1 = margin_votes, 
         margin_pct_1 = margin_percent, 
         democratic_votes_1 = dem_votes, 
         republican_votes_1 = rep_votes, 
         democratic_percent_1 = dem_votes_percent, 
         republican_percent_1 = rep_votes_percent) %>% 
  mutate(fips = str_sub(fips, -3))

gov_2016 <- read_csv("cleaned_data/Preparatory Data/Gubernatorial by Precinct/2016 Gubernatorial.csv") %>%
  select(office_type, state, district, fips, margin_votes, margin_percent, dem_votes_percent, rep_votes_percent, dem_votes, rep_votes) %>% 
  rename(margin_votes_2 = margin_votes, 
         margin_pct_2 = margin_percent, 
         democratic_votes_2 = dem_votes, 
         republican_votes_2 = rep_votes, 
         democratic_percent_2 = dem_votes_percent, 
         republican_percent_2 = rep_votes_percent) %>% 
  mutate(fips = as.character(str_sub(fips, -3))) 

gov_county <- gov_2020 %>%
  full_join(gov_2016, by = c("office_type", "district", "state", "fips")) %>%
  filter(state != "OR") #Oregon had special election in 2016, none this year

#----- HOUSE HISTORICAL -----
house_2022 <- read_csv("data/HouseHistory.csv") %>%
  filter(year == 2022 & stage == "GEN" & !runoff & !special) %>%
  pivot_wider(id_cols = c(state_po, office, district, totalvotes), 
              names_from = party, 
              values_from = candidatevotes, 
              values_fn = max) %>%
  mutate(democratic_percent_1 = 100 * DEMOCRAT / totalvotes, 
         republican_percent_1 = 100 * REPUBLICAN / totalvotes,
         margin_pct_1 = 100 * (DEMOCRAT - REPUBLICAN) / totalvotes, 
         margin_votes_1 = DEMOCRAT - REPUBLICAN, 
         office_type = "House", 
         state = state_po) %>% 
  select(state, office_type, district, margin_pct_1, margin_votes_1, democratic_percent_1, 
         republican_percent_1, DEMOCRAT, REPUBLICAN) %>%
  rename(democratic_votes_1 = DEMOCRAT, 
           republican_votes_1 = REPUBLICAN)


#Finishing up past county values
historical_counties <- pres_county %>% 
  bind_rows(senate_county) %>%
  bind_rows(gov_county) %>%
  mutate(county = str_remove(county, " County")) %>%
  filter(!str_detect(county, "[c|C]ity"))


#------ COMBINING TO GET FULL RACE VALUES ------
full_races <- historical_counties %>%
  mutate(total_votes_1 = 100 * margin_votes_1 / margin_pct_1, 
         total_votes_2 = 100 * margin_votes_2 / margin_pct_2) %>%
  group_by(office_type, state, district) %>%
  summarize(
    democratic_votes_1 = sum(democratic_votes_1), 
    democratic_votes_2 = sum(democratic_votes_2), 
    republican_votes_1 = sum(republican_votes_1), 
    republican_votes_2 = sum(republican_votes_2),
    margin_pct_1 = 100 * sum(margin_votes_1) / sum(total_votes_1),
    margin_votes_1 = sum(margin_votes_1), 
    margin_pct_2 = 100 * sum(margin_votes_2) / sum(total_votes_2),
    margin_votes_2 = sum(margin_votes_2),
    total_votes_1 = sum(total_votes_1), 
    total_votes_2 = sum(total_votes_2)) %>%
  mutate(democratic_percent_1 = 100 * democratic_votes_1 / total_votes_1, 
         republican_percent_1 = 100 * republican_votes_1 / total_votes_1, 
         democratic_percent_2 = 100 * democratic_votes_2 / total_votes_2, 
         republican_percent_2 = 100 * republican_votes_2 / total_votes_2) %>%
  select(-total_votes_1, -total_votes_2) %>%
  bind_rows(house_2022)


write_csv(historical_counties, "cleaned_data/Locally-Hosted Data/historical_county.csv")
write_csv(full_races, "cleaned_data/Locally-Hosted Data/historical_elections.csv")
