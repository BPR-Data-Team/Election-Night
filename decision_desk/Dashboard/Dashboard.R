library(shiny)
library(shinyWidgets)
library(bslib)
library(ggplot2)
library(leaflet)

BASEPATH <- ifelse(Sys.getenv("ElectionNightPath") == "", 
                   "~/GitHub/Election-Night", 
                   Sys.getenv("ElectionNightPath"))
setwd(BASEPATH)

source("decision_desk/Dashboard/Dashboard Utilities/Plotting.R")
source("decision_desk/Dashboard/Dashboard Utilities/TimeToNextPoll.R")
source("decision_desk/Dashboard/Dashboard Utilities/DemographicTable.R")
source("decision_desk/Dashboard/Dashboard Utilities/BettingOdds.R")
source("decision_desk/Dashboard/Dashboard Utilities/PreviousTimeGraph.R")
# ------------------------------ DATA INPUT ------------------------------------ #
current_data <- read.csv("cleaned_data/Changing Data/DDHQ_current_race_results.csv")
historical_data <- read.csv("cleaned_data/Locally-Hosted Data/historical_elections.csv")

county_names <- read.csv("cleaned_data/FIPS References/county_fips.csv")
electoral_votes <- read.csv("cleaned_data/ElectoralVotes.csv")
election_types <- current_data %>% pull("office_type") %>% unique()

poll_closing <- read.csv("cleaned_data/Locally-Hosted Data/poll_closing.csv")
closing_times <- poll_closing %>% pull("Poll.Closing") %>% unique() %>% head(-1)

# ----------------------------- TODO ---------------------------------------- #
#predicted_margin
# change margin_95_ci from votes to percent 
#last_election_turnout
#election_night_shift
#races_to_call
#return_times
#races_to_watch
#margin_graph_2020
#expected_pct_graph_2020
#24cast_prediction
#map selector

# ----------------------------- SERVER 000----------------------------------- #
graphServer <- function(input, output, session) {
    election_type <- reactive({input$category_select})
    state_selection <- reactive({input$state_select})
    district_selection <- reactive({input$district_select})
    
    last_election_year <- reactive({
      if (election_type() == "President" | election_type() == "Governor") {
        2020
      } else if (election_type() == "House") {
        2022
      } else {
        2018 
      }
    })
    
    selected_race_data <- reactive({
      current_data %>% filter(state == state_selection(),
                              office_type == election_type()) 
                              #district == district_select()) 
    })
                              
    state_electoral_votes <- reactive({
      min(unlist(electoral_votes %>% 
                   filter(state == state.name[match(state_selection(), state.abb)]) %>% 
                   select("votes")))
    })
    
    output$performance_or_ev_header <- renderText({
      ifelse(election_type() == "President", 
            "State Electoral Votes", 
            "Performance v. President")
    })
    
    output$performance_or_ev <- renderText({
      ifelse(election_type() == "President", 
             state_electoral_votes(),
             performance_v_president())
    })
    
    output$last_election_header <- renderUI({glue("Performance v. {last_election_year()}")})
    output$last_election_turnout_header <- renderUI({glue("{last_election_year()} Turnout")})
    output$last_election_turnout_map_header <- renderUI({glue("{last_election_year()} Turnout Map")})
    output$last_election_margin_header <- renderUI({glue("{last_election_year()} Margin")})

    output$state_electoral_votes <- renderText({
      
    })
    
    output$current_margin <- renderText({
      val <- selected_race_data()$margin_pct[1]
      if (val < 0) {
        glue("<font color=\"#FF0000\">", round(val, 1), "%</font>")
      } else {
        glue("<font color=\"#0000FF\">+", round(val, 1), "%</font>")
      }
    })
    
    output$last_election_margin <- renderText({
      val <- selected_race_data()$margin_pct_1[1]
      if (val < 0) {
        glue("<font color=\"#FF0000\">", round(val, 1), "%</font>")
      } else {
        glue("<font color=\"#0000FF\">+", round(val, 1), "%</font>")
      }
    })
    
    output$predicted_margin <- renderText({"TODO"})
    
    output$percent_reporting <- renderText({
      glue(round(selected_race_data()$pct_reporting[1], 1), "%")
    })
    
    output$performance_v_president <- renderText({
      presidential_margin <- current_data %>% 
        filter(state == state_selection(),
               office_type == "President") %>% 
        pull(margin_pct)[1]
      
      current_margin <- selected_race_data()$margin_pct[1]
      
      glue(round(presidential_margin - current_margin, 1), "%")
    })
    
    output$expected_pct_in = renderText({
      glue(round(selected_race_data()$expected_pct_in[1], 1), "%")
    })
    
    output$next_poll_close <- renderText({
      invalidateLater(1000, session)
      time_to_next_poll()()
    })
    
    output$last_election_turnout <- renderText({"TODO"})
    
    output$current_turnout <- renderText({format(as.numeric(selected_race_data()$total_votes[1]), nsmall=0, big.mark=",")})
    
    output$predicted_turnout_CI <- renderText({
      lower <- format(as.numeric(selected_race_data()$total_votes_lower[1]), nsmall=0, big.mark=",")
      upper <- format(as.numeric(selected_race_data()$total_votes_upper[1]), nsmall=0, big.mark=",")
      glue("{lower} - {upper}")
    })
    
    output$margin_95_ci <- renderText({
      dem_lower <- selected_race_data()$dem_votes_lower[1]
      dem_upper <- selected_race_data()$dem_votes_upper[1]
      rep_lower <- selected_race_data()$rep_votes_lower[1]
      rep_upper <- selected_race_data()$rep_votes_upper[1]
      
      dem_interval <- ifelse(round(dem_upper - dem_lower, 1) < 0,
                             glue("<font color=\"#0000FF\">+{round(dem_upper - dem_lower, 1)}</font>"),
                             glue("<font color=\"#0000FF\">{round(dem_upper - dem_lower, 1)}</font>"))
      rep_interval <- ifelse(round(rep_upper - rep_lower, 1) < 0,
                              glue("<font color=\"#FF0000\">+{round(rep_upper - rep_lower, 1)}</font>"),
                              glue("<font color=\"#FF0000\">{round(rep_upper - rep_lower, 1)}</font>"))
      
      glue("{dem_interval} - {rep_interval}")
    })
    
    output$betting_odds <- renderUI({get_betting_odds(election_type(), state_selection())})
    
    # Maps 
    output$margin_map <- renderPlot({get_graph(state_selection(), election_type(), "margin", BASEPATH)})
    output$margin_bubble_map <- renderPlot({get_graph(state_selection(), election_type(), "margin_bubble", BASEPATH)})
    output$swing_map <- renderPlot({get_graph(state_selection(), election_type(), "swing", BASEPATH)})
    
    # Graphs 
    output$margin_graph_2020 <- renderPlot(previous_time_graphs[[state_selection()]])
    output$expected_pct_graph_2020 <- renderPlot(previous_time_expected_pct_graphs[[state_selection()]])
    
    # Dropdown logic
    observe({
      filtered_states <- current_data %>%
        pull("state") %>%
        unique()

      updateSelectInput(session, "state_select",
                        choices = filtered_states)
    })
    
    # Update state dropdown based on the election type
    observeEvent(input$category_select, {
      # Filter states based on the selected election type
      filtered_states <- current_data %>%
        filter(office_type == input$category_select) %>%
        pull("state") %>%
        unique()
      
      # Check if the current state is in the filtered states
      current_state <- input$state_select
      if (current_state %in% filtered_states) {
        selected_state <- current_state  # Keep the current state if it exists in the dropdown
      } else {
        selected_state <- filtered_states[1]  # Fallback to first available state
      }
      # Update the state dropdown with the filtered states and maintain or reset the selection
      updateSelectInput(session, "state_select",
                        choices = filtered_states,
                        selected = selected_state
      )
    })

}

# ------------------------------ UI ------------------------------------------ #
graphOutputUI <- page_sidebar(
  titlePanel(h1("24cast.org Election Day Dashboard", align = "center")),
  sidebar =  sidebar(
    title = "Graph controls",
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
    )
  ),
  fluidPage(
    layout_columns(
      fill = FALSE,
      card(
        full_screen = FALSE, 
        card_header(textOutput("performance_or_ev_header")),
        textOutput("performance_or_ev")
      ),
      card(
        full_screen = FALSE, 
        card_header("Percent reporting"),
        textOutput("percent_reporting")
      ),
      card(
        full_screen = FALSE, 
        card_header("Predicted Percent in"),
        textOutput("expected_pct_in")
      )
    ),
    layout_columns(
      card(
        full_screen = FALSE, 
        card_header("Current Margin"),
        uiOutput("current_margin")
      ),
      card(
        full_screen = FALSE, 
        card_header("Predicted margin"),
        htmlOutput("predicted_margin")
      ),
      card(
        full_screen = FALSE, 
        card_header(uiOutput("last_election_margin_header")),
        htmlOutput("last_election_margin")
      )
    ),
    layout_columns(
      card(
        full_screen = FALSE, 
        card_header("Current Turnout"),
        textOutput("current_turnout")
      ),
      card(
        full_screen = FALSE, 
        card_header("95% CI Turnout"),
        textOutput("predicted_turnout_CI")
      ),
      card(
        full_screen = FALSE, 
        card_header(uiOutput("last_election_turnout_header")),
        textOutput("last_election_turnout")
      )
    ),
    layout_columns(
      card(
        full_screen = FALSE,
        card_header("Margin 95% Confidence Interval"),
        htmlOutput("margin_95_ci")
      ),
      card(
        full_screen = FALSE,
        card_header("Expected election night shift"),
        uiOutput("election_night_shift")
      ), 
      uiOutput("betting_odds")
    ),
    layout_columns(
      card(
        full_screen = FALSE, 
        card_header("Races to call"),
        tableOutput("races_to_call")
      ),
      card(
        full_screen = FALSE, 
        card_header("Return times"),
        tableOutput("return_times")
      ),
      card(
        full_screen = FALSE, 
        card_header("Return times"),
        textOutput("races_to_watch")
      )
    ),
    layout_columns(
      tabsetPanel(
        tabPanel("Margin Map", plotOutput("margin_map")),
        tabPanel("Margin Bubble Map", plotOutput("margin_bubble_map")),
        tabPanel("Swing Map", plotOutput("swing_map"))
      )
    ),
    layout_columns(
      card(
        fill = TRUE,
        card_header("Margin over time in 2020"),
        plotOutput("margin_graph_2020")
      ),
      card(
        fill = TRUE, 
        card_header("Pct of vote reporting in 2020"), 
        plotOutput("expected_pct_graph_2020")
      )
    ),
    card(
      fill = TRUE,
      card_header("24Cast Prediction Over time"),
      plotOutput("24cast_prediction")
    )
  )
)

shinyApp(graphOutputUI, graphServer)
