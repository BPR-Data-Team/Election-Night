# get_demographics() returns four dfs for the current state and county
# - population (total population)
# - demographics (race demographic percents)
# - income (median income)
# - education (percent with HS degree, BS degree)

#NOTE: the state level demographics are calculated by naive weighted means over the total pop. someone should check this assumption

library(dplyr)

county_demographic_data <- read.csv("cleaned_data/Preparatory Data/Demographics/CountyDemographics2022.csv")
state_demographic_data <- read.csv("cleaned_data/Preparatory Data/Demographics/StateDemographics2022.csv")

get_demographics <- function(state_select, county_select="ALL") {
  table <- if (county_select == "ALL") {
    state_demographic_data %>% 
      filter(state == state_select) %>% 
      select(-state)
  } else {
    county_demographic_data %>% 
      filter(state == state_select, county == county_select) %>% 
      select(-Geography, -state, -county)
  }
  
  transposed_df <- as.data.frame(t(table))
  transposed_df$demographics <- rownames(transposed_df)
  rownames(transposed_df) <- NULL
  transposed_df <- transposed_df[, c(ncol(transposed_df), 1:(ncol(transposed_df)-1))]
  
  population <- transposed_df %>%
    filter(demographics == "total_population") %>%
    mutate(percent_versus_national = V1 * 0) %>%
    mutate(V1 = sprintf("%s", format(V1, big.mark = ",", nsmall = 0))) %>%
    rename(" " = "demographics")

  demographics_table <- transposed_df %>% 
    filter(demographics != "total_population",
           demographics != "median_income", 
           demographics != "proportion_bachelors_degree_over_25",
           demographics != "proportion_hs_degree_over_25") %>%
    rename(" " = "demographics",
           "percent" = "V1") %>%
    mutate(percent_versus_national = percent * 0) %>%
    arrange(desc(percent))
  
  income <- transposed_df %>% 
    filter(demographics == "median_income") %>%
    rename("dollars" = "V1",
           " " = "demographics") %>%
    mutate(percent_versus_national = dollars * 0) %>%
    mutate(dollars = sprintf("$%s", format(dollars, big.mark = ",", nsmall = 0)))
    
  
  education <- transposed_df %>% 
    filter(demographics == "proportion_bachelors_degree_over_25" |
            demographics == "proportion_hs_degree_over_25") %>%
    rename("percent" = "V1") %>%
    mutate(percent_versus_national = percent * 0)
  
  
  if (county_select != "ALL") {
    selection <- county_select
    
    population <- population %>%
      mutate(percent_versus_state = V1 * 0) %>%
      rename_with(~selection, "V1")
    
    demographics_table <- demographics_table %>% 
      mutate(percent_versus_state = percent * 0)

    income <- income %>% 
      mutate(percent_versus_state = dollars * 0)
    
    education <- education %>% 
      mutate(percent_versus_state = percent * 0)
  } else {
    selection <- state_select
    
    population <- population %>%
      rename_with(~selection, "V1")
  }
  
  return(list(population = population, 
              demographics = demographics_table, 
              income = income, 
              education = education))
}

# Expected use:
get_demographics("GA")

