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
all_races <- read_csv("../../cleaned_data/DDHQ_current_race_results.csv")

election_types <- all_races %>%
  pull("office_type") %>%
  unique()

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
        choices = NULL,
        selected = NULL
      ),
      selectInput(
        inputId = "district_select",
        label = "District:",
        choices = NULL,
        selected = NULL
      )
    ),
    mainPanel(
      tableOutput("elections"),
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
    filtered_states <- all_races %>%
      filter(office_type == input$category_select) %>%
      pull("state") %>%
      unique() %>%
      append(., "All", after = 0)

    updateSelectInput(session, "state_select",
                      choices = filtered_states,
                      selected = "All"
    )
  })
  
  
  observeEvent(c(input$category_select, input$state_select), {
    state_districts <- all_races %>%
      filter(office_type == input$category_select & state == input$state_select) %>%
      pull("district") %>%
      unique()
      # %>% .[. != "0"]
    
    updateSelectInput(session, "district_select",
                      choices = state_districts,
                      selected = state_districts[1]
    )
  })
  
  filtered_elections <- reactive({
    req(input$category_select, input$state_select, input$district_select)  # Ensure inputs are available
    all_races %>%
      filter(office_type == input$category_select,
             state == input$state_select,
             district == input$district_select)  # Filter by district as well
  })
  output$elections <- renderTable({
    filtered_elections()  # Display the filtered elections
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
