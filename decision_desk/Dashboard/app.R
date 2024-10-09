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
  unique() %>%
  append(., "All", after = 0)

# Define UI for application
ui <- fluidPage(
  titlePanel(h1("24cast.org Election Day Dashboard", align = "center")),
  sidebarLayout(
    sidebarPanel(
      selectInput(
        inputId = "category_select",  # Updated to match server
        label = "Election type:",
        choices = election_types,
        selected = "All"
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
      ),
      selectInput(
        inputId = "lower_bound",
        label = "Lower Bound (% Reporting):",
        choices = seq(0, 100, by = 10),
        selected = 0
      ),
      selectInput(
        inputId = "upper_bound",
        label = "Upper Bound (% Reporting):",
        choices = seq(10, 100, by = 10),  # Initially set to the full range
        selected = 100
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
  
  # Initialize state dropdown with "All" upon app launch
  observe({
    filtered_states <- all_races %>%
      pull("state") %>%
      unique() %>%
      append("All", after = 0)
    
    updateSelectInput(session, "state_select",
                      choices = filtered_states,
                      selected = "All"
    )
  })
  
  # Update state dropdown based on the election type
  observeEvent(input$category_select, {
    # Filter states based on the selected election type
    filtered_states <- all_races %>%
      filter(office_type == input$category_select | input$category_select == "All") %>%
      pull("state") %>%
      unique() %>%
      append("All", after = 0)
    
    # Check if the current state is in the filtered states
    current_state <- input$state_select
    if (current_state %in% filtered_states) {
      selected_state <- current_state  # Keep the current state if it exists in the dropdown
    } else {
      selected_state <- "All"  # Fallback to "All" if the current state is not in the filtered states
    }
    
    # Update the state dropdown with the filtered states and maintain or reset the selection
    updateSelectInput(session, "state_select",
                      choices = filtered_states,
                      selected = selected_state
    )
  })
  
  
  # Update district dropdown based on the selected state and election type
  observeEvent(c(input$category_select, input$state_select), {
    state_districts <- all_races %>%
      filter((office_type == input$category_select | input$category_select == "All") & 
               (state == input$state_select | input$state_select == "All")) %>%
      pull("district") %>%
      unique() %>%
      append("All", after = 0)
    
    updateSelectInput(session, "district_select",
                      choices = state_districts,
                      selected = "All"
    )
  })
  
  # Update the upper bound based on the lower bound
  observeEvent(input$lower_bound, {
    # Convert lower_bound and upper_bound to numeric
    lower_bound_val <- as.numeric(input$lower_bound)
    upper_bound_val <- as.numeric(input$upper_bound)
    
    # Set the available upper bound choices to be strictly greater than the lower bound
    available_upper_bounds <- seq(lower_bound_val, 100, by = 10)
    
    # If the current upper bound is not valid, select the last valid option
    if (upper_bound_val <= lower_bound_val) {
      updateSelectInput(session, "upper_bound",
                        choices = available_upper_bounds,
                        selected = available_upper_bounds[length(available_upper_bounds)])
    } else {
      updateSelectInput(session, "upper_bound",
                        choices = available_upper_bounds,
                        selected = upper_bound_val)  # Retain current upper bound if it's valid
    }
  })
  
  
  
  # Reactive expression for filtering elections
  filtered_elections <- reactive({
    req(input$category_select, input$state_select, input$district_select)  # Ensure inputs are available
    
    all_races %>%
      filter(
        (input$category_select == "All" | office_type == input$category_select),  # Skip filter if "All"
        (input$state_select == "All" | state == input$state_select),  # Skip filter if "All"
        (input$district_select == "All" | district == input$district_select)  # Skip filter if "All"
      ) %>% mutate(district = suppressWarnings((as.integer(district))))
    
  })
  
  # Render the filtered elections table
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
