library(shiny)
library(shinyWidgets)
library(bslib)
library(ggplot2)
library(leaflet)

BASEPATH <- getwd()

source("decision_desk/Dashboard/Dashboard Utilities/Plotting.R")
source("decision_desk/Dashboard/Dashboard Utilities/TimeToNextPoll.R")
source("decision_desk/Dashboard/Dashboard Utilities/DemographicMaps.R")
source("decision_desk/Dashboard/Dashboard Utilities/BettingOdds.R")
source("decision_desk/Dashboard/Dashboard Utilities/PreviousTimeGraph.R")
#source("decision_desk/Dashboard/Dashboard Utilities/ExitPollExplorer.R")


# ------------------------------ DATA INPUT ------------------------------------ #

current_data <- read.csv("cleaned_data/Changing Data/DDHQ_current_race_results.csv")
historical_data <- read.csv("cleaned_data/Locally-Hosted Data/historical_elections.csv")

county_names <- read.csv("cleaned_data/Locally-Hosted Data/FIPS References/county_fips.csv")
electoral_votes <- read.csv("cleaned_data/Locally-Hosted Data/ElectoralVotes.csv")
election_types <- current_data %>% pull("office_type") %>% unique() %>% append(., "All", after = 0)

poll_closing <- read.csv("cleaned_data/Locally-Hosted Data/poll_closing.csv")
closing_times <- poll_closing %>% pull("Poll.Closing") %>% unique() %>% head(-1)

exit_poll_data <- read.csv("cleaned_data/Changing Data/CNN_exit_polls_all.csv")

# ------------------------------ SERVER ------------------------------------- #

server <- function(input, output, session) {
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
  
  output$state_electoral_votes <- renderText({state_electoral_votes})
  
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
  
  output$percent_reporting <- renderText({
    glue(round(selected_race_data()$pct_reporting[1], 1), "%")
  })
  
  output$election_night_shift <- renderText({
    poll_closing %>%
      filter(State == state_selection()) %>%
      pull("Shift.in.results")
    
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
  
  output$last_election_turnout <- renderText({
    turnout <- round(100 * selected_race_data()$margin_votes_1 / selected_race_data()$margin_pct_1, 0)
    format(as.numeric(turnout), nsmall=0, big.mark=",")
  })
  
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
    
    best_dem <- ifelse(dem_upper - rep_lower < 0,
                       glue("R+{-round(100 * (dem_upper - rep_lower) / (dem_upper + rep_lower), 1)}"),
                       glue("D+{round(100 * (dem_upper - rep_lower) / (dem_upper + rep_lower), 1)}"))
    best_rep <- ifelse(rep_upper - dem_lower < 0,
                       glue("D+{round(-100 * (rep_upper - dem_lower) / (rep_upper + dem_lower), 1)}"),
                       glue("R+{round(100 * (rep_upper - dem_lower) / (rep_upper + dem_lower), 1)}"))
    
    glue("{best_rep} - {best_dem}")
  })
  
  output$betting_odds <- renderUI({get_betting_odds(election_type(), state_selection())})
  
  output$races_to_call <- renderTable({
    race_list <- poll_closing %>%
      filter(State == state_selection()) %>%
      select("Total.elections.to.call", 
             "Call.at.poll.closing",
             "Call.50.", 
             "Call.80." ,
             "Call.95.",
             "No.Call.Election.Night") %>%
      rename("Total races" = "Total.elections.to.call",
             "To call at poll closing" = "Call.at.poll.closing",
             "To call at 50%" = "Call.50.",
             "To call at 80%" = "Call.80.",
             "To call at 95%" = "Call.95.",
             "Not called election night" = "No.Call.Election.Night") %>%
      t() %>%
      as.data.frame() %>%
      rename("Number" = "V1")
    
    race_list$Category <- rownames(race_list)
    rownames(race_list) <- NULL
    race_list <- race_list[, c(ncol(race_list), 1:(ncol(race_list)-1))]
  })
  
  output$return_times <- renderTable({
    race_list <- poll_closing %>%
      filter(State == state_selection()) %>%
      select("Poll.Closing", "X2nd.Closing", "First.Results","X50.", "X80.", "X95.") %>%
      rename("1st poll closing" = "Poll.Closing",
             "2nd Poll closing" = "X2nd.Closing",
             "First results" = "First.Results",
             "50% results" = "X50.",
             "80% results" = "X80.",
             "95% results" = "X95.") %>%
      t() %>%
      as.data.frame() %>%
      rename("Times" = "V1")
    
    race_list$Category <- rownames(race_list)
    rownames(race_list) <- NULL
    race_list <- race_list[, c(ncol(race_list), 1:(ncol(race_list)-1))]
  })
  
  output$races_to_watch <- renderTable({
    race_list <- poll_closing %>%
      filter(State == state_selection()) %>%
      pull("Races.to.Watch")
    
    transposed_df <- t(do.call(rbind.data.frame, as.list(strsplit(race_list, ",")))) %>%
      as.data.frame() %>%
      rename(" " = "V1")
  })
  
  # Exit Polls
  observeEvent(input$exit_poll_selector, {
    output$exit_poll_table <- renderTable({
      get_exit_poll_table(exit_poll_data, 
                          input$exit_poll_year, 
                          state_selection(), 
                          election_type(), 
                          input$exit_poll_selector) 
    })
    
    output$exit_poll_expectation <- renderTable({
      get_exit_poll_expectation(exit_poll_data, 
                                input$exit_poll_year, 
                                state_selection(), 
                                election_type(), 
                                input$exit_poll_selector) 
    })
  })
  
  # Maps 
  output$map_menu_header <- renderText({input$selected_map})
  
  observeEvent(input$TL_map_select, {
    output$margin_map_2024 <- renderLeaflet({get_margin_map(BASEPATH, 2024, state_selection(), election_type())})
    output$margin_bubble_map_2024 <- renderLeaflet({get_margin_bubble_map(BASEPATH, 2024, state_selection(), election_type())})
    output$president_swing_map_20to24 <- renderLeaflet({get_swing_map(BASEPATH, state_selection(), "President", "President", 2020, 2024)})
  })
  
  observeEvent(input$TR_map_select, {
    output$margin_map_2020 <- renderLeaflet({get_margin_map(BASEPATH, 2020, state_selection(), election_type())})
    output$margin_bubble_map_2020 <- renderLeaflet({get_margin_bubble_map(BASEPATH, 2020, state_selection(), election_type())})
    output$president_swing_map_16to20 <- renderLeaflet({get_swing_map(BASEPATH, state_selection(), "President", "President", 2016, 2020)})
    output$president_senate_swing_map_24to24 <- renderLeaflet({get_swing_map(BASEPATH, state_selection(), "President", "Senate", 2024, 2024)})
    output$president_senate_swing_map_16to18 <- renderLeaflet({get_swing_map(BASEPATH, state_selection(), "President", "Senate", 2016, 2018)})
    output$president_governor_swing_map_24to24 <- renderLeaflet({get_swing_map(BASEPATH, state_selection(), "President", "Governor", 2024, 2024)})
    output$president_governor_swing_map_20to20 <- renderLeaflet({get_swing_map(BASEPATH, state_selection(), "President", "Governor", 2020, 2020)})
  })
  
  observeEvent(input$BL_map_select, {
    output$remaining_votes_map <- renderLeaflet({get_votes_left_map(BASEPATH, state_selection(), election_type())})
    
  })
  
  observeEvent(input$BR_map_select, {
    output$white_demographics_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "White")})
    output$black_demographics_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "Black")})
    output$hispanic_demographics_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "Hispanic")})
    output$median_income_demographics_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "Income")})
    output$white_college_educated_demographics_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "White College")})
  })
  
  
  # observeEvent(input$margin_year, {
  #   updateTabsetPanel(session, "margin_year",
  #                     selected = paste("margin_map_{input$margin_year}")
  #   )
  # })
  # observeEvent(input$bubble_year, {
  #   updateTabsetPanel(session, "bubble_year",
  #                     selected = paste("margin_bubble_map_{input$bubble_year}")
  #   )
  # })
  # observeEvent(input$swing_year, {
  #   updateTabsetPanel(session, "swing_year",
  #                     selected = paste("swing_map_{input$swing_year}")
  #   )
  # })
  
  # Graphs 
  output$margin_graph_2020 <- renderPlot(previous_time_graphs[[state_selection()]])
  output$expected_pct_graph_2020 <- renderPlot(previous_time_expected_pct_graphs[[state_selection()]])
  
  
  # Dropdown logic
  election_type <- reactive({ input$category_select })
  state <- reactive({ input$state_select })
  observe({
    filtered_states <- current_data %>%
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
    filtered_states <- current_data %>%
      filter(office_type == input$category_select | input$category_select == "All") %>%
      pull("state") %>%
      unique() %>%
      append("All", after = 0)
    
    # Check if the current state is in the filtered states
    current_state <- input$state_select
    if (current_state %in% filtered_states) {
      selected_state <- current_state  # Keep the current state if it exists in the dropdown
    } else {
      selected_state <- "AL"  # Fallback to "All" if the current state is not in the filtered states
    }
    # Update the state dropdown with the filtered states and maintain or reset the selection
    updateSelectInput(session, "state_select",
                      choices = filtered_states,
                      selected = selected_state
    )
  })
  output$selected_time <- renderText({closing_times[input$time_slider]})
  
  
  # Render the filtered elections table
  output$elections <- renderTable({
    output$elections <- renderUI({
      elections <- current_data %>%
        filter(
          (input$category_select == "All" | office_type == input$category_select),  # Skip filter if "All"
          (input$state_select == "All" | state == input$state_select)  # Skip filter if "All"
        ) %>% mutate(district = suppressWarnings((as.integer(district))))
      
      if (nrow(elections) == 0) {
        return(div("No elections match your criteria"))
      }
      
      lapply(1:nrow(elections), function(i) {
        election <- elections[i, ]
        div(
          class = "election-card",
          actionLink(inputId = paste0("election_", election$race_id), 
                     label = glue("{election$office_type} {election$state} - {trunc(election$pct_reporting)}% rep."))
          )
      })
    })
  })
}
