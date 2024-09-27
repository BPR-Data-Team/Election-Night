# app.R
library(shiny)
library(readr)
library(dplyr)

# Source the betting odds module
source("betting_odds_module.R")

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
      bettingOddsInputUI("betting_odds", election_types, states)
    ),
    
    # Main panel for displaying outputs
    mainPanel(
      bettingOddsOutputUI("betting_odds")
    )
  )
)

# Define server logic required to draw a histogram
server <- function(input, output, session) {
  bettingOddsServer("betting_odds")
}

# Run the application
shinyApp(ui = ui, server = server)
