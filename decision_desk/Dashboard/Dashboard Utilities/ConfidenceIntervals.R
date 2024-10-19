library(tidyverse)

race_data <- read_csv("cleaned_data/Changing Data/DDHQ_current_race_results.csv")

loser_votes_required <- race_data %>%
  select(office_type, state, district, margin_votes, pct_reporting, total_votes, 
         total_votes_estimate, ind_votes_pct, green_votes_pct) %>%
  mutate(total_votes_estimate = ifelse(is.na(total_votes_estimate), 100 / pct_reporting * total_votes, total_votes_estimate), 
         total_votes_remaining = pmax(0, total_votes_estimate - total_votes), 
         third_party_pct = (ind_votes_pct + green_votes_pct) / 100, 
         loser_pct_required = abs(margin_votes) / (2 * total_votes_remaining) + (1 - third_party_pct) / 2, 
         winning_possible = loser_pct_required < 1) %>% 
  select(office_type, state, district, loser_pct_required, winning_possible)
  
  