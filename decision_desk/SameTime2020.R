library(tidyverse)
library(lubridate)

#ALL THIS WAS WRITTEN ONCE, BUT NEVER AGAIN
#This file will be used to get the results at a given time, but ALSO to test
#Our EDAY model!

# county_time_2020 <- read_csv("data/nyt_counties.csv")
# 
# cleaned_2020 <- county_time_2020 %>%
#   #We only care about when the counties have changed results
#   group_by(fips) %>%
#   mutate(previous_trump = lag(trumpd, order_by = time)) %>%
#   filter(previous_trump != trumpd) %>%
#   select(state, name, fips, reporting, precincts, time, trumpd, bidenj, margin2020)

#write_csv(cleaned_2020, "data/live_2020_data.csv")

#For some reason, their times are 5 hours ahead -- super weird! lol...
cleaned_2020 <- read_csv("data/live_2020_data.csv")

final_results <- cleaned_2020 %>%
  group_by(fips) %>% 
  filter(time == max(time))

#---- FUNCTION TO GET RESULTS AT ANY TIME OF DAY!
get_results_at_time <- function(time_to_check) {
  results_at_time <- cleaned_2020 %>% 
    filter(time < time_to_check) %>%
    group_by(fips) %>% 
    filter(time == max(time)) %>% 
    return(.)
}

cleaned_2020 %>% 
  filter(time < as_datetime("2020-11-03 08:00:32")) 
  group_by(fips) %>% 
  filter(time == max(time))

test_results <- get_results_at_time(as_datetime("2020-11-03 08:00:32")) %>%
  mutate(pct_reporting = reporting / precincts)


