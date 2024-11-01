library(shiny)
library(bslib)
library(dplyr)
library(tidyr)


get_exit_poll_table <- function(data_object, year_selection, state_selection, office_selection, question_selection) {
  data <- data_object %>%
    filter(year == year_selection, 
           question == question_selection)
  
  if (state_selection != "All") {
    data <- data %>% filter(state == state_selection)
  }
  if (office_selection != "All") {
    data <- data %>% filter(office_type == office_selection)
  }
  
  data <- data %>%
   group_by(question, answer) %>%
   reframe(demographic_pct = demographic_pct,
             lastName = lastName, 
             answer_pct = na_if(answer_pct, -1)) %>%
   pivot_wider(names_from = lastName, values_from = answer_pct) %>%
   select(-question)
 
 if (nrow(data) == 0) {
   "No data available for this selection."
 } else {
   data
 }
}

get_exit_poll_expectation <- function(data_object, year_selection, state_selection, office_selection, question_selection) {
  data <- data_object %>%
    filter(year == year_selection, 
           question == question_selection)
  
  if (state_selection != "All") {
    data <- data %>% filter(state == state_selection)
  }
  if (office_selection != "All") {
    data <- data %>% filter(office_type == office_selection)
  }
  
  data <- data %>%
    mutate(answer_pct = na_if(answer_pct, -1),
           weighted_prob = demographic_pct * answer_pct / 100) %>%
    group_by(question, lastName) %>%
    reframe(lastName = unique(lastName),
            expectation = sum(weighted_prob, na.rm = TRUE)) %>%
    select(-question)
  
  if (nrow(data) == 0) {
    "No data available for this selection."
  } else {
    data
  }
  
}

