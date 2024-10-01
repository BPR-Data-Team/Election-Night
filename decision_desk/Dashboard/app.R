library(shiny)
library(readr)
library(dplyr)
library(leaflet)
library(glue)
library(sf)

# Source the modules
source("BettingOdds.R")
source("Maps.R")

# Global variables
election_types <- c("President", "Senate", "House", "Governor")
election_states <- list(
  President = c("US", state.abb),
  Senate = c("US", "AZ", "CA", "CT", "DE", "FL", "HI", 
             "IN", "MD", "MA", "MI", "MN", "MO", "MT",
             "NE", "NV", "NJ", "NM", "NY", "ND", "OH",
             "PA", "RI", "TN", "TX", "UT", "VT", "VA",
             "WA", "WV", "WI", "WY"),
  House = c("US", state.abb),
  Governor = c("DE", "IN", "MO", "MT", "NH", "NC",
               "ND", "UT", "VT", "WA", "WV")
)

# Define UI for application
ui <- fluidPage(
  titlePanel(h1("24cast.org Election Day Dashboard", align = "center")),
  sidebarLayout(
    sidebarPanel(
      selectInput(
        inputId = "category_select",  # Updated to match server
        label = "Election type:",
        choices = election_types,
        selected = "President"
      ),
      selectInput(
        inputId = "state_select",
        label = "State:",
        choices = election_states[["President"]],
        selected = "US"
      )
    ),
    mainPanel(
      bettingOddsOutputUI("betting_odds"),
      mapOutputUI("maps")
    )
  )
)

# Define server logic
server <- function(input, output, session) {
  election_type <- reactive({ input$category_select })
  state <- reactive({ input$state_select })
  
  
  observeEvent(input$category_select, {
    updateSelectInput(session, "state_select",
                      choices = election_states[[input$category_select]],
                      selected = election_states[[input$category_select]][1]
    )
  })
  
  bettingOddsServer("betting_odds", election_type, state)
  map_module <- mapServer("maps", election_type, state)
  
  selected_fips <- map_module$selected_fips
  
  # Use the selected FIPS code in your app
  observeEvent(selected_fips(), {
    fips <- selected_fips()
    if (!is.null(fips)) {
      # Perform actions based on the selected FIPS code
      # For example, update other UI elements or fetch data
      showNotification(glue("You selected FIPS code: {fips}"), type = "message")
    }
  })
}

# Run the application
shinyApp(ui = ui, server = server)
