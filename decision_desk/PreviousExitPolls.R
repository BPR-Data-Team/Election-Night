library(tidyverse)
library(jsonlite)
library(lubridate)
library(glue)
library(httr)
library(furrr)


get_exit_polls <- function(abbrev, election_type) {
  url <- glue("https://politics.data.api.cnn.io/results/exit-poll/2020-{election_type}G-XPOLLS-{state_to_fetch}.json")
  
  response <- GET(url)
  if (http_error(response)) {
    return(NULL)
  }
  
  json_text <- content(response, as = "text", encoding = "UTF-8")
  
  if (json_text == "null" | is.null(json_text)) {
    return(NULL)
  }
  
  json_data <- fromJSON(json_text)
  state <- json_data$state$abbreviation
  office_type <- json_data$titles$raceTitle$title #Senate/House

  questions <- flatten(json_data$questions) %>%
    select(question, answers) %>%
    mutate(state = state, office_type = office_type) %>%
    unnest(answers) %>%
    unnest(candidateAnswers) %>%
    group_by(mxId) %>%
    #Slight problem: for some questions, like age, there are multiple different groupings:
    #How many options do you give? We choose the one with the most options
    mutate(num_options = n() / 2) %>%
    group_by(question) %>%
    filter(num_options == max(num_options)) %>%
    ungroup() %>%
    select(state, office_type, question, answer, totalPercentage, percentage, lastName) %>%
    #We want two values: what percent of the demographic is this in the poll, 
    #And how does that demographic vote?
    rename(demographic_pct = totalPercentage, answer_pct = percentage) %>%
    filter(question %in% c("Age", "Race", "Region", "Gender", "Area type", "Education", "Income")) 
  
}

factors_to_fetch <- list(
  state = c(state.abb, "US"), 
  election_type = c("P", "S", "H", "G")
)

exit_poll_list <- expand_grid(!!!factors_to_fetch) %>%
  rowwise() %>%
  pmap(~get_exit_polls(..1, ..2), .progress = TRUE)

exit_polls_df <- bind_rows(exit_poll_list)
