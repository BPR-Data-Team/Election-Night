library(dplyr)
library(ggplot2)
library(shiny)
library(shinyWidgets)
library(bslib)

pct_harris_to_win <- function (races_over_time_df, state_selection, office_selection, district_selection) {
  selected_race <- races_over_time_df %>% 
    filter(state == state_selection, 
           office_type == office_selection,
           district == district_selection)
  
  current_votes <- selected_race$total_votes
  
  votes_remaining <- selected_race$total_votes_estimate - selected_race$total_votes 
  lower_votes_remaining <- selected_race$total_votes_lower - selected_race$total_votes
  upper_votes_remaining <- selected_race$total_votes_upper - selected_race$total_votes
  
  current_margin_votes <- selected_race$margin_votes
  
  if (current_margin_votes < 0) {
    # Harris is losing
    pct_to_win <- current_margin_votes / votes_remaining
    pct_to_win_lower <- current_margin_votes / lower_votes_remaining
    pct_to_win_upper <- current_margin_votes / upper_votes_remaining
  } else {
    # Harris is winning
    pct_to_win <- ifelse(votes_remaining < current_margin_votes, 0, 0.5) 
    pct_to_win_lower <- ifelse(lower_votes_remaining < current_margin_votes, 0, 0.5)
    pct_to_win_upper <- ifelse(upper_votes_remaining < current_margin_votes, 0, 0.5)
  }
  
  new_row <- data.frame(time = Sys.time(), 
                        state = state_selection, 
                        office_type = office_selection,
                        district = district_selection, 
                        pct_to_win = pct_to_win, 
                        pct_to_win_lower = pct_to_win_lower, 
                        pct_to_win_upper = pct_to_win_upper, 
                        margin_over_time = current_margin_votes)
 
  return(new_row)
  
}

pct_harris_to_win_graph <- function (pct_to_win_timeseries, state_selection, office_selection, district_selection) {
  if (nrow(pct_to_win_timeseries) == 0) {
    return(NULL)
  }
  
  graph_data <- pct_to_win_timeseries %>%
    filter(state == state_selection, 
           office_type == office_selection,
           district == district_selection)
  
  graph <- ggplot(graph_data, aes(x = ~time)) +
    geom_ribbon(aes(ymin = ~pct_to_win_lower, ymax = ~pct_to_win_upper), fill = "blue", alpha = 0.2) +
    geom_line(aes(y = ~pct_to_win_upper), color = "blue", linetype = "solid") +
    geom_line(aes(y = ~pct_to_win_lower), color = "blue", linetype = "solid") +
    geom_line(aes(y = ~pct_to_win), color = "blue", linetype = "dashed") +
    geom_line(aes(y = ~margin_over_time), color = "black", linetype = "solid") +
    labs(x = "Time", y = "Percentage / Margin", title = "Percentage to Win and Margin Over Time") +
    theme_minimal() + 
    theme(panel.grid.major = element_line(color = "gray90"),
          panel.grid.minor = element_blank(),
          legend.position = "none") 
  
  return(graph)
}

server <- function(input, output) {
  election_type <- reactive({input$office_select})
  
  harris_to_win_df <- reactive({
    data.frame(
      time = Sys.time(), 
      state = character(), 
      office_type = election_type(),
      district = character(), 
      pct_to_win = character(), 
      pct_to_win_lower = character(), 
      pct_to_win_upper = character(), 
      margin_over_time = character()
    )
  })
  
  observeEvent(input$office_select, {
    View(harris_to_win_df())
    harris_to_win_df <- reactive({pct_harris_to_win("~/Github/Election-Night", harris_to_win_df, "TX", election_type(), "0")})
    output$table <- renderTable(harris_to_win_df())
  })
  
  output$pct_harris_to_win_graph <- renderPlot({
    pct_harris_to_win_graph(harris_to_win_df(), "TX", "President", "0")
  })
  
  
}

ui <- fluidPage(
  titlePanel("Percent to Win"),
  selectInput("office_select", label = "Office Type", 
              choices = c("President", "Senate", "House")),
  tableOutput("table")
)

shinyApp(ui = ui, server = server)