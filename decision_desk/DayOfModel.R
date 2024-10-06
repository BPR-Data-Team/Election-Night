library(tidyverse)
library(glue)
library(ggplot2)

#Live data
#We assume that 2% of votes are for third-party candidates or write-in across the board (maybe not great, but whatever)
live_data <- read_csv("cleaned_data/DDHQ_current_county_results.csv") %>%
  filter(office_type == "President") %>%
  mutate(total_votes = 100 * margin_votes / margin_pct, 
         total_votes_2020 = 100 * margin_votes_1 / margin_pct_1,
         dem_votes = Democratic_votes, 
         rep_votes = Republican_votes, 
         dem_votes_2020 = (0.98 * total_votes_2020 + margin_votes_1) / 2, 
         rep_votes_2020 = (0.98 * total_votes_2020 - margin_votes_1) / 2, 
         pct_reporting = replace_na(pct_reporting, 0)) %>%
  select(fips, state, pct_reporting, total_votes, dem_votes, rep_votes, total_votes_2020, dem_votes_2020, rep_votes_2020) 

#County Demographics
county_demographics <- read_csv("data/CountyData2022.csv") %>%
  mutate(fips = str_sub(Geography, -3), 
         across(where(is.numeric), ~ as.vector(scale(.)))) %>%
  select(state, fips, where(is.numeric)) %>%
  select(-proportion_other)

all_results <- live_data %>%
  left_join(county_demographics, by = c("fips", "state")) %>%
  filter(!is.na(median_income) & !is.na(total_pop))

#---- NOW WE CREATE THREE SEPARATE MODELS! ONE FOR TOTAL AND ONE FOR EACH DEM/REP -----

# Predicting vote shares
finished_counties <- all_results %>%
  filter(pct_reporting == 100) %>% 
  mutate(
    dem_differential = log(dem_votes / dem_votes_2020),
    rep_differential = log(rep_votes / rep_votes_2020),
    vote_differential = log(total_votes / total_votes_2020)
  ) %>%
  select(vote_differential, dem_differential, rep_differential, total_pop:proportion_bachelors_degree_over_25)

# Creating vote models
vote_model <- lm(vote_differential ~ ., data = finished_counties %>% select(-dem_differential, -rep_differential))
dem_model <- lm(dem_differential ~ ., data = finished_counties %>% select(-vote_differential, -rep_differential))
rep_model <- lm(rep_differential ~ ., data = finished_counties %>% select(-vote_differential, -dem_differential))

# Use conformal prediction to get bounds for each model
conformal_prediction <- function(model, alpha = 0.05) {
  # Calculate residuals
  residuals <- residuals(model)
  
  # Calculate leverages (diagonal of the hat matrix)
  leverages <- hatvalues(model)
  
  # Calculate leave-one-out errors
  loo_errors <- residuals / (1 - leverages)
  
  # Calculate quantiles for the prediction intervals
  quantiles <- quantile(loo_errors, probs = c(alpha / 2, 1 - alpha / 2))
  
  # Return the quantiles
  return(list(
    lower_quantile = quantiles[1],
    upper_quantile = quantiles[2]
  ))
}

# For total vote differential
vote_quantiles <- conformal_prediction(vote_model)

# For Democratic vote share
dem_quantiles <- conformal_prediction(dem_model)

# For Republican vote share
rep_quantiles <- conformal_prediction(rep_model)


#Getting results for all unfinished counties
model_estimates <- all_results %>%
  filter(pct_reporting != 100) %>%
  mutate(
    # Predictions
    vote_pred = predict(vote_model, newdata = select(., total_pop:proportion_bachelors_degree_over_25)),
    dem_votes_pred = predict(dem_model, newdata = select(., total_pop:proportion_bachelors_degree_over_25)),
    rep_votes_pred = predict(rep_model, newdata = select(., total_pop:proportion_bachelors_degree_over_25)),
    
    # Conformal prediction intervals for total votes
    vote_lower = vote_pred + vote_quantiles$lower_quantile,
    vote_upper = vote_pred + vote_quantiles$upper_quantile,
    
    # Conformal prediction intervals for vote shares
    dem_votes_lower_estimate = dem_votes_pred + dem_quantiles$lower_quantile,
    dem_votes_upper_estimate = dem_votes_pred + dem_quantiles$upper_quantile,
    rep_votes_lower_estimate = rep_votes_pred + rep_quantiles$lower_quantile,
    rep_votes_upper_estimate = rep_votes_pred + rep_quantiles$upper_quantile,
    
    # Calculate total vote estimates
    total_votes_lower = exp(vote_lower) * total_votes_2020,
    total_votes_upper = exp(vote_upper) * total_votes_2020,
    dem_votes_lower = exp(dem_votes_lower_estimate) * dem_votes_2020, 
    dem_votes_upper = exp(dem_votes_upper_estimate) * dem_votes_2020, 
    rep_votes_lower = exp(rep_votes_lower_estimate) * rep_votes_2020, 
    rep_votes_upper = exp(rep_votes_upper_estimate) * rep_votes_2020
  ) %>%
  #Sometimes, the sum of dems and reps exceed total votes -- we adjust the intervals here!
  mutate(
    # Sum of predicted votes
    votes_sum_lower = dem_votes_lower + rep_votes_lower,
    votes_sum_upper = dem_votes_upper + rep_votes_upper,
    
    # Adjustment factors
    adjustment_lower = ifelse(votes_sum_lower > total_votes_lower, total_votes_lower / votes_sum_lower, 1),
    adjustment_upper = ifelse(votes_sum_upper > total_votes_upper, total_votes_upper / votes_sum_upper, 1),
    
    # Adjusted vote votes
    dem_votes_lower = dem_votes_lower * adjustment_lower,
    rep_votes_lower = rep_votes_lower * adjustment_lower,
    dem_votes_upper = dem_votes_upper * adjustment_upper,
    rep_votes_upper = rep_votes_upper * adjustment_upper) %>%
  select(fips, state, total_votes_lower, total_votes_upper, dem_votes_lower, dem_votes_upper, rep_votes_lower, rep_votes_upper)


# Get finalized county results for everything!
estimated_county <- all_results %>%
  left_join(model_estimates, by = c("fips", "state")) %>%
  mutate(
    # For finished counties, use actual votes
    total_votes_lower = ifelse(pct_reporting == 100, total_votes, total_votes_lower), 
    total_votes_upper = ifelse(pct_reporting == 100, total_votes, total_votes_upper),
    dem_votes_lower = ifelse(pct_reporting == 100, dem_votes, dem_votes_lower),
    dem_votes_upper = ifelse(pct_reporting == 100, dem_votes, dem_votes_upper),
    rep_votes_lower = ifelse(pct_reporting == 100, rep_votes, rep_votes_lower),
    rep_votes_upper = ifelse(pct_reporting == 100, rep_votes, rep_votes_upper)
  ) %>%
  mutate(across(contains("lower"), ~replace_na(., 0)), 
         across(contains("upper"), ~replace_na(., 0)), 
         office_type = "President") %>%
  select(fips, state, office_type, total_votes_lower:rep_votes_upper)

estimated_race <- estimated_county %>%
  #This will be the absolute BEST result for Democrats and the BEST result for Republicans!
  group_by(state) %>%
  summarize(total_votes_lower = sum(total_votes_lower), 
            total_votes_upper = sum(total_votes_upper), 
            dem_votes_lower = sum(dem_votes_lower), 
            rep_votes_lower = sum(rep_votes_lower), 
            dem_votes_upper = sum(dem_votes_upper), 
            rep_votes_upper = sum(rep_votes_upper)) %>%
  mutate(office_type = "President")

#We now need to combine these values with the original datasets, and put them back!
finalized_county_results <- read_csv("cleaned_data/DDHQ_current_county_results.csv") %>%
  left_join(estimated_county, by = c("state", "fips", "office_type"))

finalized_race_results <- read_csv("cleaned_data/DDHQ_current_race_results.csv") %>%
  left_join(estimated_race, by = c('state', 'office_type'))
  

write_csv(finalized_county_results, "cleaned_data/DDHQ_current_county_results.csv")
write_csv(finalized_race_results, "cleaned_data/DDHQ_current_race_results.csv")
