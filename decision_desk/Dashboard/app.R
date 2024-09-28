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
      # Betting odds input UI
      bettingOddsInputUI("betting_odds", election_types, states),
      br(),  # Add some space
      # Map output below the betting odds input
      mapModuleUI("state_map")
    ),
    
    # Main panel for displaying outputs
    mainPanel(
      fluidRow(
        # Betting odds output
        column(width = 12, bettingOddsOutputUI("betting_odds"))
      )
    )
  )
)

# Define server logic
server <- function(input, output, session) {
  bettingOddsServer("betting_odds")
  mapModuleServer("state_map") 
}

# Run the application
shinyApp(ui = ui, server = server)
