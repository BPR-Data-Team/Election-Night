library(dplyr)

# THIS FILE CONTAINS HELPER FUNCTIONs FOR DASHBOARD SERVER
# process_current_race() returns current_margin, performance_v_last_election, percent_reporting

# Not yet implemented:
# performance_v_president()

current_data <- read.csv("cleaned_data/DDHQ_test_data_county.csv")

process_current_race <- function(current_data_object, election_type_selection, state_selection, county_selection="") {
  if (county_selection != "") {
    # County level results
    data <- current_data_object %>% 
      filter(state == state_selection,
             office_type == election_type_selection, 
             county == county_selection)

    current_margin <- data %>% select(margin_pct)
    prev_election_margin <- data %>% select(margin_pct_1)
    percent_reporting <- data %>% select(pct_reporting)
    
    performance_v_last_election <- current_margin - prev_election_margin
    
  } else {
    # State level results
    data <- current_data_object %>% 
      filter(office_type == election_type_selection,
             state == state_selection) %>%
      mutate(num_votes = Democratic_votes + Republican_votes + Independent_votes + Green_votes,
             prev_election_votes = 100 * margin_votes_1/margin_pct_1) %>%
      group_by(state) %>% 
      summarize(
        total_votes = sum(num_votes),
        margin_votes = sum(Democratic_votes - Republican_votes),
        margin_pct = margin_votes/total_votes, 
        prev_margin_pct = weighted.mean(margin_pct_1, prev_election_votes), # not correct but closer than raw mean
        percent_reporting = weighted.mean(pct_reporting, num_votes))
     
    current_margin <- data %>% select(margin_pct)
    prev_election_margin <- data %>% select(prev_margin_pct)
    performance_v_last_election <- current_margin - prev_election_margin
    percent_reporting <- data %>% select(percent_reporting)
  }
  
  return(list(
    current_margin = current_margin[[1]],
    performance_v_last_election = performance_v_last_election[[1]],
    percent_reporting = percent_reporting[[1]]
  ))
  
}

process_current_race(current_data, "President", "GA")$current_margin
