library(shiny)
library(bslib)
library(ggplot2)
library(leaflet)

BASEPATH <- ifelse(Sys.getenv("ElectionNightPath") == "", 
                   "~/GitHub/Election-Night", 
                   Sys.getenv("ElectionNightPath"))
BASEPATH <- "/Users/chaiharsha/Documents/Atom/Election-Night"
setwd(BASEPATH)

source("./decision_desk/Dashboard/Dashboard Utilities/Plotting.R", local = TRUE)
source("./decision_desk/Dashboard/Dashboard Utilities/TimeToNextPoll.R")
source("./decision_desk/Dashboard/Dashboard Utilities/DemographicTable.R")
source("./decision_desk/Dashboard/Dashboard Utilities/BettingOdds.R")
source("./decision_desk/Dashboard/Dashboard Utilities/Margins.R")
source("./decision_desk/Dashboard/Dashboard Utilities/PreviousTimeGraph.R")


# ------------------------------ TODO --------------------------------------- #
# Track margin over time
# 24cast prediction over time
# Update data with reactiveFileReader (DataPipeline.R)
# Demographics compare to national
# County selector in sidebar
# Demographics compare to state
# Turnout maps
# Turnout predictions

# ------------------------------ DATA INPUT ------------------------------------ #
current_data <- read.csv("cleaned_data/DDHQ_test_data_county.csv")
historical_data <- read.csv("cleaned_data/Locally-Hosted Data/historical_elections.csv")
county_names <- read.csv("cleaned_data/FIPS References/county_fips.csv")
electoral_votes <- read.csv("cleaned_data/ElectoralVotes.csv")
all_races <- read_csv("cleaned_data/DDHQ_current_race_results.csv")
election_types <- all_races %>% pull("office_type") %>% unique() %>% append(., "All", after = 0)


# ----------------------------- APP LOGIC ----------------------------------- #
graphServer <- function(input, output, session) {
    election_type <- reactive({input$category_select})
    state_selection <- reactive({input$state_select})
    county_selection <- reactive({input$county_select})
    
    last_election_year <- reactive({
      if (election_type() == "President") {
        2020
      } else if (election_type() == "House") {
        2022
      } else {
        2018 
      }
    })
    
    output$last_election_header <- renderUI({glue("Performance v. {last_election_year()}")})
    output$last_election_turnout_header <- renderUI({glue("{last_election_year()} Turnout")})
    output$last_election_turnout_map_header <- renderUI({glue("{last_election_year()} Turnout Map")})
    
    output$state_electoral_votes <- renderText({
      min(unlist(electoral_votes %>% 
        filter(state == state.name[match(state_selection(), state.abb)]) %>% 
        select("votes")))
    })
    
    current_race <- reactive({process_current_race(current_data, election_type(), state_selection())})
    
    output$current_margin <- renderText({
      val <- current_race()$current_margin
      if (val < 0) {
        glue("<font color=\"#FF0000\">", round(val, 1), "%</font>")
      } else {
        glue("<font color=\"#0000FF\">+", round(val, 1), "%</font>")
      }
    })
    
    output$performance_v_last_election <- renderText({
      val <- current_race()$performance_v_last_election
      if (val > 0) {
        glue("+", round(val, 1), "%")
      } else {
        glue(round(val, 1), "%")
      }
    })
    
    output$percent_reporting <- renderText({round(current_race()$percent_reporting, 1)})
    
    output$next_poll_close <- renderText({
      invalidateLater(1000, session)
      time_to_next_poll()()
    })
    
    output$last_election_turnout <- renderText({"TODO"})
    output$current_turnout <- renderText({"TODO"})
    output$predicted_turnout_ci <- renderText({"TODO"})
    
    output$betting_odds <- renderUI({get_betting_odds(election_type(), state_selection())})
    
    demographics <- reactive({get_demographics(state_selection(), "ALL")}) #TODO: Change ALL to county()
    
    output$population <- renderTable({demographics()$population})
    output$demo_table <- renderTable({demographics()$demographics})
    output$median_income <- renderTable({demographics()$income})
    output$education <- renderTable({demographics()$education})

    output$margin_graph_2020 <- renderPlot(previous_time_graphs[[state_selection()]])
    output$expected_pct_graph_2020 <- renderPlot(previous_time_expected_pct_graphs[[state_selection()]])

    output$state_margin_map <- renderLeaflet({get_graph(state_selection(), election_type(), "margin")})
    output$state_bubble_map <- renderLeaflet({get_graph(state_selection(), election_type(), "margin_bubble")})
    output$state_swing_map <- renderLeaflet({get_graph(state_selection(), election_type(), "swing")})
    
    # Dropdown logic
    election_type <- reactive({ input$category_select })
    state <- reactive({ input$state_select })
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
}

# Graph Module UI
graphOutputUI <- page_sidebar(
  titlePanel(h1("24cast.org Election Day Dashboard", align = "center")),
  sidebar =  sidebar(
    title = "Graph controls",
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
    )  ),
  fluidPage(
    layout_columns(
      fill = FALSE,
      value_box(
        title = "Current time",
        value = format(Sys.time(), "%H:%M"),
        showcase = bsicons::bs_icon("clock")
      ),
      value_box(
        title = "Time until next poll close",
        value = textOutput("next_poll_close"),
        showcase = bsicons::bs_icon("stopwatch")
      ),
      value_box(
        title = "State Electoral Votes",
        value = textOutput("state_electoral_votes"),
        showcase = bsicons::bs_icon("pin-map")
      ),
    ),
    layout_columns(
      value_box(
        title = "Current Margin",
        value = htmlOutput("current_margin"),
        showcase = bsicons::bs_icon("hdd-network")
      ),
      value_box(
        title = "Percent reporting",
        value = textOutput("percent_reporting"),
        showcase = bsicons::bs_icon("bar-chart")
      ),
      value_box(
        title = "Performance v. President",
        value = "TODO",
        showcase = bsicons::bs_icon("people")
      ),
      value_box(
        title = uiOutput("last_election_header"),
        value = textOutput("performance_v_last_election"),
        showcase = bsicons::bs_icon("arrow-counterclockwise")
      )
    ),
    layout_columns(
      fill = FALSE,
      card(
        full_screen = FALSE,
        card_header("Margin by county"),
        leafletOutput("state_margin_map")
      ),
      card(
        full_screen = FALSE,
        card_header("Margin concentration by county"),
        leafletOutput("state_bubble_map")
      ),
      card(
        full_screen = FALSE,
        card_header("Swing since last election"),
        leafletOutput("state_swing_map")
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
      ),
    ),
    layout_columns(
      card(
        full_screen = FALSE,
        card_header("Current Turnout Map"),
        leafletOutput("current_turnout_map")
      ),
      card(
        full_screen = FALSE,
        card_header(uiOutput("last_election_turnout_map_header")),
        leafletOutput("last_election_turnout_map")
      )
    ),
    card(
      full_screen = TRUE,
      card_header("Demographics"),
      tableOutput("population"),
      tableOutput("demo_table"),
      tableOutput("median_income"),
      tableOutput("education")
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
    ), 
    card(
      fill = TRUE, 
      card_header("Betting Odds"),
      uiOutput("betting_odds")
    )
  )
)

shinyApp(graphOutputUI, graphServer)
