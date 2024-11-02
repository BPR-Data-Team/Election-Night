library(shiny)
library(shinyWidgets)
library(bslib)
library(ggplot2)
library(leaflet)

source("decision_desk/Dashboard/Dashboard Utilities/Plotting.R")
source("decision_desk/Dashboard/Dashboard Utilities/TimeToNextPoll.R")
source("decision_desk/Dashboard/Dashboard Utilities/BettingOdds.R")
source("decision_desk/Dashboard/Dashboard Utilities/PreviousTimeGraph.R")
# ------------------------------ DATA INPUT ------------------------------------ #

current_data <- read.csv("cleaned_data/Changing Data/DDHQ_current_race_results.csv")
historical_data <- read.csv("cleaned_data/Locally-Hosted Data/historical_elections.csv")

county_names <- read.csv("cleaned_data/Locally-Hosted Data/FIPS References/county_fips.csv")
electoral_votes <- read.csv("cleaned_data/Locally-Hosted Data/ElectoralVotes.csv")
election_types <- current_data %>% pull("office_type") %>% unique() %>% append(., "All", after = 0)

poll_closing <- read.csv("cleaned_data/Locally-Hosted Data/poll_closing.csv")
start_time <- as.POSIXct("2024-11-05 17:00:00")
end_time <- as.POSIXct("2024-11-06 02:00:00")
# ----------------------------- TODO ---------------------------------------- #
#predicted_margin
# change margin_95_ci from votes to percent 
#last_election_turnout
#election_night_shift
#margin_graph_2020
#expected_pct_graph_2020
#24cast_prediction
# If race type all, change dashboard to race agnostic


# ------------------------------ UI ------------------------------------------ #
ui <- page_sidebar(
  window_title = "24cast.org Election Day Dashboard",
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
      choices = c("All"),
      selected = "All"
    ),
    conditionalPanel(
      condition = "input.category_select == 'House'",
      selectInput(
        inputId = "district_select",
        label = "District:",
        choices = c("All"),
        selected = "All"
      )
    ),
    sliderInput( 
      inputId = "percent_reporting_bounds", 
      label = "% Reporting:", 
      min = 0, max = 100, 
      value = c(0, 100),
      step = 10
    ),
    sliderInput(
      inputId = "poll_closing_bounds",
      label = "Poll Closing Times:",
      min = start_time,
      max = end_time,
      value = c(start_time, end_time),
      timeFormat = "%I:%M %p",
      step = 3600,  # One-hour increments
    ),
    checkboxInput(
      inputId = "key_races",
      label = "Key Races Only",
      value = FALSE
    ),
    tableOutput("elections")
  ),
  conditionalPanel(
    condition = "input.category_select != 'All' && input.state_select != 'All'",
    fluidPage(
      layout_columns(
        fill = FALSE,
        card(
          card_header("Current Electoral Vote Tally"),
          "TODO"
        ),
        card(
          full_screen = FALSE, 
          card_header(textOutput("performance_or_ev_header")),
          textOutput("performance_or_ev")
        ),
        card(
          full_screen = FALSE, 
          card_header("Percent reporting"),
          textOutput("percent_reporting")
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
          card_header(uiOutput("last_election_margin_header")),
          htmlOutput("last_election_margin")
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
          card_header("Expected election night shift"),
          uiOutput("election_night_shift")
        ), 
        card(uiOutput("betting_odds"), full_screen = FALSE)
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
          card_header("Races to Watch"),
          tableOutput("races_to_watch")
        )
      ),
      layout_columns(
        card(
          full_screen = FALSE, 
          card_header("Margin Map Select"),
          selectInput("TL_map_select", label = NULL,
                      choices = list("2024 Margin" = "2024_margin", 
                                     "2024 Margin Bubble" = "2024_margin_bubble", 
                                     "Swing 2020-2024" = "2024_swing"), 
                      selected = "2024_margin"),
          conditionalPanel(
            condition = "input.TL_map_select == '2024_margin'",
            leafletOutput("margin_map_2024")
          ),
          conditionalPanel(
            condition = "input.TL_map_select == '2024_margin_bubble'",
            leafletOutput("margin_bubble_map_2024")
          ),
          conditionalPanel(
            condition = "input.TL_map_select == '2024_swing'",
            leafletOutput("swing_map_20to24")
          )
        ),
        card(
          full_screen = FALSE, 
          card_header("Previous Elections Map Select"),
          selectInput("TR_map_select", label = NULL,
                      choices = list("2020 Margin" = "2020_margin", 
                                     "2020 Margin Bubble" = "2020_margin_bubble", 
                                     "Swing 2016-2020" = "swing_20",
                                     "2024 President-Senate Swing" = "pres_sen_swing_24",
                                     "2016-2018 President-Senate Swing" = "pres_sen_swing_16_18",
                                     "2024 President-Governor Swing" = "pres_gov_swing_24",
                                     "2020 President-Governor Swing" = "pres_gov_swing_20"),
                      selected = "2020_margin"),
          conditionalPanel(
            condition = "input.TR_map_select == '2020_margin'",
            leafletOutput("margin_map_2020")
          ),
          conditionalPanel(
            condition = "input.TR_map_select == '2020_margin_bubble'",
            leafletOutput("margin_bubble_map_2020")
          ),
          conditionalPanel(
            condition = "input.TR_map_select == 'swing_20'",
            leafletOutput("swing_map_16to20")
          ),
          conditionalPanel(
            condition = "input.TR_map_select == 'pres_sen_swing_24'",
            leafletOutput("president_senate_swing_map_24to24")
          ),
          conditionalPanel(
            condition = "input.TR_map_select == 'pres_sen_swing_16_18'",
            leafletOutput("president_senate_swing_map_16to18")
          ),
          conditionalPanel(
            condition = "input.TR_map_select == 'pres_gov_swing_24'",
            leafletOutput("president_governor_swing_map_24to24")
          ),
          conditionalPanel(
            condition = "input.TR_map_select == 'pres_gov_swing_20'",
            leafletOutput("president_governor_swing_map_20to20")
          )
        )
      ),
      layout_columns(
        card(
          full_screen = FALSE, 
          card_header("Voting Distribution Map Select"),
          selectInput("BL_map_select", label = NULL,
                      choices = list("Where votes remain" = "remaining_votes", 
                                     "Early voting partisanship" = "early_voting"),
                      selected = "remaining_votes"),
          conditionalPanel(
            condition = "input.BL_map_select == 'remaining_votes'",
            leafletOutput("remaining_votes_map")
          ),
          conditionalPanel(
            condition = "input.BL_map_select == 'early_voting'",
            leafletOutput("early_voting_partisanship_map")
          )
        ),
        card(
          full_screen = FALSE, 
          card_header("Demographics Map Select"),
          selectInput("BR_map_select", label = NULL,
                      choices = list("White %" = "white", 
                                     "Black %" = "black", 
                                     "Hispanic %" = "hispanic",
                                     "Median income" = "income",
                                     "White college %" = "white_college"),
                      selected = "white"),
          conditionalPanel(
            condition = "input.BR_map_select == 'white'",
            leafletOutput("white_demographics_map")
          ),
          conditionalPanel(
            condition = "input.BR_map_select == 'black'",
            leafletOutput("black_demographics_map")
          ),
          conditionalPanel(
            condition = "input.BR_map_select == 'hispanic'",
            leafletOutput("hispanic_demographics_map")
          ),
          conditionalPanel(
            condition = "input.BR_map_select == 'income'",
            leafletOutput("median_income_demographics_map")
          ),
          conditionalPanel(
            condition = "input.BR_map_select == 'white_college'",
            leafletOutput("white_college_educated_demographics_map")
          )
        )
      ),
      card(
        fill = TRUE,
        card_header("Exit Poll Explorer"),
        selectInput("exit_poll_selector", label = "Poll question",
                    choices = list("Age" = "Age",
                                   "Area Type" = "Area type",
                                   "Education" = "Education",
                                   "Gender" = "Gender",
                                   "Income" = "Income",
                                   "Race" = "Race",
                                   "Region" = "Region"),
                    selected = "Age"),
        
        selectInput("exit_poll_year", label = "Year",
                    choices = c("2020", "2024"),
                    selected = "2020"),
  
        
        tableOutput("exit_poll_table"),
        tableOutput("exit_poll_expectation")
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
      )
    )
  ),
  conditionalPanel(
    condition = "input.category_select == 'All' || input.state_select == 'All' || (input.district_select == 'All' && input.category_select == 'House')",
    "Please select an election type and state to view detailed information."
  )
)