library(tidyverse)
library(glue)
library(Hmisc)
library(ggplot2)

#Live data
live_data <- read_csv("cleaned_data/DDHQ_current_county_results.csv") %>%
  filter(office_type == "President") %>%
  mutate(total_votes = 100 * margin_votes / margin_pct, 
         total_votes_2020 = 100 * margin_votes_1 / margin_pct_1, 
         margin_pct_2020 = margin_pct_1) %>%
  select(fips, state, pct_reporting, total_votes, margin_pct, total_votes_2020, margin_pct_2020) 

#County Demographics
county_demographics <- read_csv("data/CountyData2022.csv") %>%
  mutate(fips = str_sub(Geography, -3), 
         across(where(is.numeric), ~ as.vector(scale(.)))) %>%
  select(state, fips, where(is.numeric)) %>%
  select(-proportion_other)

all_results <- live_data %>%
  left_join(county_demographics, by = c("fips", "state")) %>%
  filter(!is.na(median_income) & !is.na(total_pop))

#---- NOW WE CREATE TWO SEPARATE MODELS! ONE FOR MARGIN CHANGE AND ONE FOR VOTE CHANGE -----

finished_counties <- all_results %>%
  filter(pct_reporting == 100) %>% 
  mutate(vote_differential = log(total_votes / total_votes_2020), 
         margin_differential = margin_pct - margin_pct_2020) %>%
  select(vote_differential, margin_differential, total_pop:proportion_bachelors_degree_over_25) 

#Creating vote model and percentiles
vote_model <- lm(vote_differential ~ ., finished_counties %>% select(-margin_differential))
vote_residuals <- residuals(vote_model)
vote_leverages <- hatvalues(vote_model)
vote_loo_error <- vote_residuals / (1 - vote_leverages)
vote_quantiles = quantile(vote_loo_error, probs = c(0.025, 0.975))
vote_percentile_5 = vote_quantiles[1]
vote_percentile_95 = vote_quantiles[2]

#Creating margin model and percentiles
margin_model <- lm(margin_differential ~ ., finished_counties %>% select(-vote_differential))
margin_residuals <- residuals(margin_model)
margin_leverages <- hatvalues(margin_model)
margin_loo_error <- margin_residuals / (1 - margin_leverages)
margin_quantiles = quantile(margin_loo_error, probs = c(0.025, 0.975))
margin_percentile_5 = margin_quantiles[1]
margin_percentile_95 = margin_quantiles[2]

#Getting results for all unfinished counties
model_estimates <- all_results %>%
  filter(pct_reporting != 100) %>%
  mutate(vote_estimate = predict.lm(vote_model, newdata = select(., total_pop:proportion_bachelors_degree_over_25)), 
         margin_estimate = predict.lm(margin_model, newdata = select(., total_pop:proportion_bachelors_degree_over_25))) %>%
  mutate(vote_lower = vote_estimate + vote_percentile_5,
         vote_upper = vote_estimate + vote_percentile_95,
         margin_lower = margin_estimate + margin_percentile_5, 
         margin_upper = margin_estimate + margin_percentile_95,
         lower_vote_estimate = exp(vote_lower) * total_votes_2020,
         upper_vote_estimate = exp(vote_upper) * total_votes_2020, 
         lower_margin_estimate = margin_lower + margin_pct_2020, 
         upper_margin_estimate = margin_upper + margin_pct_2020) %>%
  select(fips, state, lower_vote_estimate, upper_vote_estimate, lower_margin_estimate, upper_margin_estimate)


#Returned model results
finalized_results <- live_data %>% 
  left_join(model_estimates, by = c("fips", "state"))


write_csv(finalized_results, "cleaned_data/DDHQ_current_race_results.csv")
