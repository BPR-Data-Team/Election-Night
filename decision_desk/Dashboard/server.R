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
source("decision_desk/Dashboard/Dashboard Utilities/ExitPollExplorer.R")
source("decision_desk/Dashboard/Dashboard Utilities/PercentToWin.R")
source("decision_desk/Dashboard/Dashboard Utilities/FilterRaces.R")
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
    if (election_type() == "President" || election_type() == "Governor") {
      2020
    } else if (election_type() == "House") {
      2022
    } else {
      2018 
    }
  })
  
  selected_race_data <- reactive({
    current_data %>% filter_races(office_selection = election_type(),
                                  state_selection = state_selection(),
                                  district_selection = district_selection())
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
  
  performance_v_president <- reactive({
    presidential_margin <- current_data %>% 
      filter_races(state_selection = state_selection(),
                   office_selection = "President") 

    presidential_margin <- presidential_margin$margin_pct[1]
    current_margin <- selected_race_data()$margin_pct[1] 
    
    paste0(round(presidential_margin - current_margin, 1), "%")
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
    if (state_selection() == "All") {
      poll_closing %>% pull("Shift.in.results")
    } else {
      poll_closing %>% 
        filter(State == state_selection()) %>% 
        pull("Shift.in.results")
    }
  })
  
  output$performance_v_president <- renderText({
    presidential_margin <- current_data %>% 
      filter_races(office_selection = "President",
                   state_selection = state_selection()) %>%
      pull(margin_pct)[1]
    
    current_margin <- selected_race_data()$margin_pct[1]
    
    glue(round(presidential_margin - current_margin, 1), "%")
  })
  
  output$expected_pct_in = renderText({
    glue(round(selected_race_data()$expected_pct_in[1], 1), "%")
  })
  
  output$next_poll_close <- renderText({
    invalidateLater(10000, session)
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
    race_list <- if (state_selection() == "All") {
      poll_closing
    } else {
      poll_closing %>%
        filter(State == state_selection())
    }
    
    race_list <- race_list %>%
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
      as.data.frame() #%>%
     # rename("Number" = "V1")
    
    race_list$Category <- rownames(race_list)
    rownames(race_list) <- NULL
    race_list <- race_list[, c(ncol(race_list), 1:(ncol(race_list)-1))]
  })
  
  output$return_times <- renderTable({
    race_list <- if (state_selection() == "All") {
      poll_closing
    } else {
      poll_closing %>%
        filter(State == state_selection())
    }
    
    race_list <- race_list %>%
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
    
    race_list <- if (state_selection() == "All") {
      poll_closing %>% pull("Races.to.Watch")
    } else {
     poll_closing %>%
        filter(State == state_selection()) %>%
        pull("Races.to.Watch")
    }
    
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
    if (input$TL_map_select == "2024_margin") {
      if (election_type() == "House") {
        output$TL_map <- renderLeaflet({get_margin_map_district(2024, state_selection(), district_selection())})
      } else {
        output$TL_map <- renderLeaflet({get_margin_map(2024, state_selection(), election_type())})
      }
      
    } else if (input$TL_map_select == "2024_margin_bubble") {
      if (election_type() == "House") {
        output$TL_map <- renderLeaflet({get_margin_bubble_map_district(2024, state_selection(), district_selection())})
      } else {
        output$TL_map <- renderLeaflet({get_margin_bubble_map(2024, state_selection(), election_type())})
      }
      
    } else if (input$TL_map_select == "2024_swing") {
      output$TL_map <- renderLeaflet({get_swing_map(state_selection(), election_type(), election_type(), 2020, 2024)})
    
    } 
  })
  
  observeEvent(input$TR_map_select, {
    if (input$TR_map_select == "2020_margin") {
      if (election_type() == "House") {
        output$TR_map <- renderLeaflet({get_margin_map_district(2020, state_selection(), district_selection())})
      } else {
        output$TR_map <- renderLeaflet({get_margin_map(2020, state_selection(), election_type())})
      }
      
    } else if (input$TR_map_select == "2020_margin_bubble") {
      if (election_type() == "House") {
        output$TR_map <- renderLeaflet({get_margin_bubble_map(2020, state_selection(), district_selection())})
      } else {
        output$TR_map <- renderLeaflet({get_margin_bubble_map_district(2020, state_selection(), district_selection())})
      }
    
    } else if (input$TR_map_select == "swing_20") {
      output$TR_map <- renderLeaflet({get_swing_map(state_selection(), election_type(), election_type(), 2016, 2020)})
    
    } else if (input$TR_map_select == "pres_sen_swing_24") {
      output$TR_map <- renderLeaflet({get_swing_map(state_selection(), "President", "Senate", 2024, 2024)})
    
    } else if (input$TR_map_select == "pres_sen_swing_16_18") {
      output$TR_map <- renderLeaflet({get_swing_map(state_selection(), "President", "Senate", 2016, 2018)})
    
    } else if (input$TR_map_select == "pres_gov_swing_24") {
      output$TR_map <- renderLeaflet({get_swing_map(state_selection(), "President", "Governor", 2024, 2024)})
    
    } else if (input$TR_map_select == "pres_gov_swing_20") {
      output$TR_map <- renderLeaflet({get_swing_map(state_selection(), "President", "Governor", 2020, 2020)})
    
    } else {
      output$TR_map <- renderLeaflet({NULL})
    }
  })
  
  output$remaining_votes_map <- renderLeaflet({get_votes_left_map(state_selection(), election_type())})
  
  observeEvent(input$BR_map_select, {
    if (input$BR_map_select == "white") {
      output$demographic_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "White")})
    } else if (input$BR_map_select == 'black') {
      output$demographic_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "Black")})
    } else if (input$BR_map_select == 'hispanic') {
      output$demographic_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "Hispanic")})
    } else if (input$BR_map_select == 'income') {
      output$demographic_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "Income")})
    } else if (input$BR_map_select == 'white_college') {
      output$demographic_map <- renderLeaflet({get_demographic_graph(BASEPATH, state_selection(), "White College")})
    } 
  })
  
  # Graphs 
  output$margin_graph_2020 <- renderPlot(previous_time_graphs[[state_selection()]])
  output$expected_pct_graph_2020 <- renderPlot(previous_time_expected_pct_graphs[[state_selection()]])

  # Dropdown logic
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
    req(input$TL_map_select, input$TR_map_select)
    
    # Filter states based on the selected election type
    filtered_states <- current_data %>%
      filter_races(office_selection = input$category_select) %>%
      arrange(state) %>%
      pull("state") %>%
      unique() %>%
      append("All", after = 0)
    
    # Check if the current state is in the filtered states
    selected_state <- ifelse(state_selection() %in% filtered_states, 
                             state_selection(), 
                             "All")
    
    # Update the state dropdown with the filtered states and maintain or reset the selection
    updateSelectInput(session, "state_select",
                      choices = filtered_states,
                      selected = selected_state
    )
    
    if (input$category_select != "House") {
      updateSelectInput(session, "district_select", selected = "All")
    }
  })
  
  observeEvent(input$state_select, {
    req(input$TL_map_select, input$TR_map_select)
    
    if (input$category_select == "House") {
      filtered_districts <- selected_race_data() %>%
        arrange(district) %>%
        pull("district") %>%
        unique() %>%
        append("All", after = 0)
      
      selected_district <- ifelse(input$district_select %in% filtered_districts, 
                                  input$district_select, 
                                  "All") 
      
      updateSelectInput(session, "district_select",
                        choices = filtered_districts,
                        selected = selected_district
      )
      
    }
  })
  
  output$selected_time <- renderText({closing_times[input$time_slider]})
  
  # Filter elections based on sliders and checkbox
  filtered_races <- reactive({
    elections <- selected_race_data() %>%
        mutate(race_id = row_number()) %>% 
        arrange(state, office_type, district)
      
      # Filter by percent reporting
      elections <- elections %>%
        filter(pct_reporting >= input$percent_reporting_bounds[1],
               pct_reporting <= input$percent_reporting_bounds[2])

      # Filter by closing times
      closing_time_lower <- as.POSIXct(input$poll_closing_bounds[1], format = "%Y-%m-%d %I:%M %p")
      closing_time_upper <- as.POSIXct(input$poll_closing_bounds[2], format = "%Y-%m-%d %I:%M %p")
        
      elections <- elections %>%
        mutate(poll_close = lapply(poll_close, function (i) {
          time_only <- as.POSIXct(i, format = "%H:%M:%S")
          noon <- as.POSIXct("12:00:00", format = "%H:%M:%S")
          
          if (is.na(time_only)) {
            return(NA)
          }
          
          date_part <- if (time_only >= noon) "2024-11-05" else "2024-11-06"
          
          return(as.POSIXct(paste(date_part, i), format = "%Y-%m-%d %H:%M:%S"))
        })) %>%
        filter(poll_close >= closing_time_lower,
               poll_close <= closing_time_upper)

      # Filter by key races 
      if (input$key_races) {
        elections <- elections %>% filter(race_to_watch == TRUE)
      }
      
      return(elections)
  })
  
  # Render the filtered elections table
  output$elections <- renderTable({
    output$elections <- renderUI({
      lapply(filtered_races()$race_id, function(i) {
        election <- filtered_races() %>% filter(race_id == i)
        
        div(
          class = "election-card",
          actionLink(inputId = paste0("election_", i), 
                     label = glue("{election$office_type} {election$state} {election$district} - {trunc(election$pct_reporting)}% rep."))
        )
      })
    })
  })


  # Observe clicks on action links
  last_clicked <- reactiveVal(NULL)
  observe({
    for (i in filtered_races()$race_id %>% unique()) {
      link_id <- paste0("election_", i)
      
      observeEvent(input[[link_id]], {
        req(input[[link_id]])
        
        if (is.null(last_clicked) || link_id != isolate(last_clicked())) {
          election <- filtered_races() %>% filter(race_id == i)
          
          updateSelectInput(session, "category_select", selected = election$office_type)
          updateSelectInput(session, "state_select", selected = election$state)
          updateSelectInput(session, "district_select", selected = election$district)
          
          last_clicked(link_id)
          
          break
        }
      }, ignoreInit = TRUE)
    }
  })
}