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
bettingOddsServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns
    
    # Election states specific to the module
    election_states <- list(
      President = c("US", state.abb),  # All states for President
      Senate = c("US", "AZ", "CA", "CT", "DE", "FL", "HI", 
                 "IN", "MD", "MA", "MI", "MN", "MO", "MT",
                 "NE", "NV", "NJ", "NM", "NY", "ND", "OH",
                 "PA", "RI", "TN", "TX", "UT", "VT", "VA",
                 "WA", "WV", "WI", "WY"),    # States with Senate elections
      House = c("US", state.abb),     # All states for House
      Governor = c("DE", "IN", "MO", "MT", "NH", "NC",
                   "ND", "UT", "VT", "WA", "WV")    # States with Governor elections
    )
    
    # Load URLs from the CSV file
    election_urls <- read_csv("../../cleaned_data/betting_odds_links.csv")
    
    polymarket_url <- reactive({
      category <- input$category_select
      state <- input$state_select
      
      # Retrieve the URL based on the selected state and category
      url_entry <- election_urls %>%
        filter(state == !!state) %>%
        pull(!!category)
      
      # Return the link for the specific state and office
      base_url <- url_entry[[1]]
      return(base_url)
    })
    
    # Update the state select input based on the selected category
    observeEvent(input$category_select, {
      updateSelectInput(session, "state_select",
                        choices = election_states[[input$category_select]],
                        selected = election_states[[input$category_select]][1])
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
