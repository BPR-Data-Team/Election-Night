library(tidyverse)
library(jsonlite)
library(lubridate)
library(glue)
library(httr)
library(furrr)

#----- PRESIDENTIAL HISTORICAL ------
#Presidential 2020 comes from NYT Data
pres_2020 <- read_csv("cleaned_data/President by Precinct/NYT_2020_Pres.csv")

#Treating all of alaska as one county, I guess?
alaska_2020 <- pres_2020 %>% 
  filter(state == "AK") %>%
  mutate(total_votes = 100 * margin_votes_1 / margin_pct_1) %>%
  summarize(state = 'AK', 
            county = "Alaska", 
            margin_votes_1 = sum(margin_votes_1),
            margin_pct_1 = 100 * margin_votes_1 / sum(total_votes), 
            fips = "013")
  
pres_2020 <- pres_2020 %>% 
  filter(state != "AK") %>% 
  bind_rows(alaska_2020)

pres_2016 <- read_csv("cleaned_data/President by Precinct/2016 git data.csv") %>%
  mutate(margin_votes_2 = democrat_votes - republican_votes , 
         margin_pct_2 = 100*(democrat_votes - republican_votes)/total_votes, 
         fips = str_sub(as.character(fips), -3), 
         #Weird stuff with a county in SD, this makes all counties have the same FIPS code
         fips = ifelse(county == "Oglala County", 102, fips)) %>%
  select(state, county, fips, margin_pct_2, margin_votes_2)


#Final presidential values, by county
pres_county <- pres_2020 %>%
  full_join(pres_2016, by = c("state", "fips")) %>%
  mutate(county = county.x, 
         office_type = "President", 
         district = 0, .before = everything()) %>%
  filter(!is.na(margin_pct_2)) %>% 
  select(-c(county.x, county.y))

#------ SENATE HISTORICAL -------
senate_2012 <- read_csv("cleaned_data/Senate by Precinct/2018 Senate.csv") %>%
  select(office_type, state, county, district, fips, margin_votes, margin_percent) %>% 
  rename(margin_votes_2 = margin_votes, margin_pct_2 = margin_percent) %>% 
  rowwise() %>%
  mutate(fips = str_sub(fips, -3)) %>%
  bind_rows(data.frame(
    office_type = rep("Senate", 4),
    state = c("IN", "NY", "NY", "NY"),
    county = c("Washington", "Jefferson", "Niagara", "Ulster"),
    district = rep(0, 4),
    fips = c("175", "045", "063", "111"),
    margin_votes_2 = c(-942, 9336, 19797, 30455),
    margin_pct_2 = c(-8.9, 30.4, 25.5, 43.5)
  ))

senate_2018 <- read_csv("cleaned_data/Senate by Precinct/2012 Senate.csv") %>%
  select(office_type, state, county, district, fips, margin_votes, margin_percent) %>% 
  rename(margin_votes_1 = margin_votes, margin_pct_1 = margin_percent) %>%
  rowwise() %>%
  mutate(fips = str_sub(as.character(fips), -3), 
         county = str_remove(county, " County"))

senate_county <- senate_2018 %>%
  full_join(senate_2012, by = c("office_type", "district", "state", "fips")) %>%
  filter(!is.na(margin_pct_1) & !is.na(margin_pct_1)) %>% 
  select(-county.y) %>% 
  rename(county = county.x)


#----- GOVERNOR HISTORICAL ------


#----- HOUSE HISTORICAL -----
house_2022 <- read_csv("data/HouseHistory.csv") %>%
  filter(year == 2022 & stage == "GEN" & !runoff & !special) %>%
  pivot_wider(id_cols = c(state_po, office, district, totalvotes), 
              names_from = party, 
              values_from = candidatevotes, 
              values_fn = max) %>%
  mutate(margin_pct_1 = 100 * (DEMOCRAT - REPUBLICAN) / totalvotes, 
         margin_votes_1 = DEMOCRAT - REPUBLICAN, 
         office_type = "House", 
         state = state_po) %>% 
    select(state, office_type, district, margin_pct_1, margin_votes_1) 



#Finishing up past county values
historical_counties <- pres_county %>% 
  bind_rows(senate_county) %>%
  mutate(county = str_remove(county, " County")) %>%
  filter(!str_detect(county, "[c|C]ity"))


#------ COMBINING TO GET FULL RACE VALUES ------
full_races <- historical_counties %>%
  mutate(total_votes_1 = 100 * margin_votes_1 / margin_pct_1, 
         total_votes_2 = 100 * margin_votes_2 / margin_pct_2, 
         total_absentee_votes_1 = absentee_pct_1 * total_votes_1 / 100, 
         total_absentee_margin_votes_1 = absentee_margin_pct_1 * total_absentee_votes_1 / 100) %>%
  group_by(office_type, state, district) %>%
  summarize(
    margin_pct_1 = 100 * sum(margin_votes_1) / sum(total_votes_1),
    margin_votes_1 = sum(margin_votes_1), 
    margin_pct_2 = 100 * sum(margin_votes_2) / sum(total_votes_2),
    absentee_pct_1 = 100 * sum(total_absentee_votes_1, na.rm = TRUE) / sum(total_votes_1, na.rm = TRUE), 
    absentee_margin_pct_1 = 100 * sum(total_absentee_margin_votes_1, na.rm = TRUE) / sum(total_absentee_votes_1, na.rm = TRUE)) %>%
  bind_rows(house_2022)


write_csv(historical_counties, "cleaned_data/historical_county.csv")
write_csv(full_races, "cleaned_data/historical_elections.csv")
