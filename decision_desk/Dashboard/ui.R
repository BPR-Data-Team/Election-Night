library(shiny)

election_types <- c("President", "Senate", "House", "Governor")
states <- c("US", state.abb)

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
