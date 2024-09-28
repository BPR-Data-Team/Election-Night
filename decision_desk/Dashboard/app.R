library(shiny)
library(readr)
library(dplyr)
library(leaflet)

# Source the betting odds module and map module
source("BettingOdds.R")
source("NationMap.R")

# Global variables
election_types <- c("President", "Senate", "House", "Governor")
states <- c("US", state.abb)

# Define UI for application
ui <- fluidPage(
  # Application title
  titlePanel(h1("24cast.org Election Day Dashboard", align = "center")),
  
  # Sidebar layout with input and output definitions
  sidebarLayout(
    # Sidebar panel for inputs
    sidebarPanel(
      bettingOddsInputUI("betting_odds", election_types, states),
      br(),  # Add some space
      # Map output below the betting odds input
      mapModuleUI("state_map"),
      width = 5
    ),
    
    # Main panel for displaying outputs
    mainPanel(
      width = 4,
      fluidRow(
        # Betting odds output
        column(width = 12, bettingOddsOutputUI("betting_odds"))
      ),
      
      # New section for displaying state information
      fluidRow(
        column(
          width = 12, 
          h3("State Information"),  # Header for the state info
          textOutput("stateInfo")    # Placeholder for the state information
        )
      )
    )
  )
)

# Define server logic
server <- function(input, output, session) {
  bettingOddsServer("betting_odds")
  
  # Placeholder for clicked state information
  stateInfo <- reactiveVal("Click on a state to see its information here.")
  
  # Call the map module and pass stateInfo to it
  mapModuleServer("state_map", stateInfo)
  
  # Render the state information in the UI
  output$stateInfo <- renderText({
    stateInfo()  # Display the latest clicked state info
  })
}

# Run the application
shinyApp(ui = ui, server = server)
