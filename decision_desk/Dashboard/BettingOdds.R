# betting_odds_module.R
library(shiny)
library(readr)
library(dplyr)

# Betting Odds Module UI for Inputs
bettingOddsInputUI <- function(id, election_types, states) {
  ns <- NS(id)
  tagList(
    selectInput(
      inputId = ns("category_select"),
      label = "Election type:",
      choices = election_types,
      selected = "President"
    ),
    selectInput(
      inputId = ns("state_select"),
      label = "State:",
      choices = states,
      selected = "US"
    )
  )
}

# Betting Odds Module UI for Output
bettingOddsOutputUI <- function(id) {
  ns <- NS(id)
  uiOutput(ns("betting_container"))
}

# Betting Odds Module Server
# In betting_odds_module.R
bettingOddsServer <- function(id, election_type, state) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns
    
    # Use the reactive expressions
    polymarket_url <- reactive({
      category <- election_type()
      selected_state <- state()
      
      # Load URLs from the CSV file
      election_urls <- read_csv("../../cleaned_data/betting_odds_links.csv")
      
      # Retrieve the URL based on the selected state and category
      url_entry <- election_urls %>%
        filter(state == selected_state) %>%
        pull(!!category)
      
      base_url <- url_entry[[1]]
      return(base_url)
    })
    
    # Render the iframe based on the selected URL
    output$betting_container <- renderUI({
      tags$iframe(
        src = polymarket_url(),
        width = "400",
        height = "180",
        frameBorder = "0"
      )
    })
  })
}
