library(shiny)

#All the code required to create the backend of RShiny dashboard
server <- function(input, output, session) {
  
  #---- POLYMARKET ---#
  # Reactive expression to build the Polymarket URL based on selections
  polymarket_url <- reactive({
    
    #Eventually, we'll make this actually reactive
    base_url <- "https://embed.polymarket.com/market.html?market=will-kamala-harris-win-the-2024-us-presidential-election&features=volume&theme=light"
  })
  
  # Render the iframe based on the selected URL
  output$betting_container <- renderUI({
    tags$iframe(
      src = polymarket_url(),
      width="400",
      height="180",
      frameBorder="0"
    )
  })
}
