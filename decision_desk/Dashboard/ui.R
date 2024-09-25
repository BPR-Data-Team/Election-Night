library(shiny)

election_types <- c("President", "Senate", "House", "Governor")

election_states <- list(
  President = c("US", state.abb),  # All states for President
  Senate = c("US", "AZ", "CA", "CT", "DE", "FL", "HI", 
             "IN", "MD", "MA", "MI", "MN", "MO", "MT",
             "NE", "NV", "NJ", "NM", "NY", "ND", "OH",
             "PA", "RI", "TN", "TX", "UT", "VT", "VA",
             "WA", "WV", "WI", "WY"),    # States with Senate elections
  House = c("US", state.abb),     # All states for House
  Governor = c("US", "OH", "GA", "AZ")    # States with Governor elections
)

# Define UI for application that draws a histogram
fluidPage(
  # Application title
  titlePanel(h1("24cast.org Election Day Dashboard", align = "center")),
  
  # Sidebar with a slider input for number of bins
  sidebarLayout(
    sidebarPanel(
      selectInput(
        inputId = "category_select",
        label = "Election type:",
        choices = election_types,
        selected = "President"
      ),
      
      selectInput(
        inputId = "state_select",
        label = "State:",
        choices = states,
        selected = "All States"
      )
    ),
    
    # Main panel with the iframe
    mainPanel(
      uiOutput("betting_container")
    )
  )
)
