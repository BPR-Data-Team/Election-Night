library(shiny)
library(shinyWidgets)
library(bslib)
library(ggplot2)
library(leaflet)

source("decision_desk/Dashboard/Dashboard Utilities/Plotting.R")
source("decision_desk/Dashboard/Dashboard Utilities/TimeToNextPoll.R")
source("decision_desk/Dashboard/Dashboard Utilities/DemographicMaps.R")
source("decision_desk/Dashboard/Dashboard Utilities/BettingOdds.R")
source("decision_desk/Dashboard/Dashboard Utilities/PreviousTimeGraph.R")
source("decision_desk/Dashboard/Dashboard Utilities/ExitPollExplorer.R")
source("decision_desk/Dashboard/Dashboard Utilities/PercentToWin.R")
source("decision_desk/Dashboard/Dashboard Utilities/FilterRaces.R")
source("decision_desk/Dashboard/Dashboard Utilities/Websocket.R")
# ------------------------------ DATA INPUT ------------------------------------ #

historical_data <- read.csv("cleaned_data/Locally-Hosted Data/historical_elections.csv")

county_names <- read.csv("cleaned_data/Locally-Hosted Data/FIPS References/county_fips.csv")
electoral_votes <- read.csv("cleaned_data/Locally-Hosted Data/ElectoralVotes.csv")
election_types <- c("All", "President", "Senate", "Governor", "House")

poll_closing <- read.csv("cleaned_data/Locally-Hosted Data/poll_closing.csv")
closing_times <- poll_closing %>% pull("Poll.Closing") %>% unique() %>% head(-1)

exit_poll_data_2020 <- read.csv("cleaned_data/Locally-Hosted Data/CNN_exit_polls_2020.csv")

cat("Loaded locally hosted data\n")
cat("Loading REST data...\n")

current_data <- reactive({
  race_data <- get_rest_api_data("race")
  race_data <- race_data %>% 
  mutate(across(!c(when_to_call, state, race_to_watch, Republican_name, office_type, poll_close, Independent_name, officetype_district_state, Democratic_name),
        as.numeric))
})

timeseries_df <- reactive(NULL)

called_races <- reactive({get_rest_api_data("logan")})

exit_poll_data_2024 <- reactive({get_rest_api_data("exit_polls") %>%
  mutate(across(c(demographic_pct, answer_pct)), as.numeric)
})

county_data <- reactive({get_rest_api_data("county") %>%
  mutate(across(!c(fips, officetype_county_district_state, state, county, Green_name, Republican_name, office_type, Independent_name, Democratic_name),
         as.numeric))
})


# ------------------------------ SERVER ------------------------------------- #

server <- function(input, output, session) {
  election_type <- reactive({input$category_select})
  state_selection <- reactive({input$state_select})
  district_selection <- reactive({input$district_select})

  # Update current data
  new_data <- get_new_data(session)
  observeEvent(new_data, {
    table <- new_data$table()
    data <- new_data$data()
    
    if (is.null(table)) {
      return(NULL)
    }

    if (table == "Race_Results") {
      new_row_key <- data$officetype_district_state
      updated_data <- current_data() %>% filter(officetype_district_state != new_row_key)
      current_data(rbind(updated_data, data))
      timeseries_df(rbind(timeseries_df, 
                          data %>% 
                            select(office_type, state, district, margin_pct, pct_reporting) %>%
                            mutate(timestamp = Sys.time())))

    } else if (table == "Exit_Polls") {
      new_row_key <- data$state_officetype_answer_lastname
      updated_data <- exit_poll_data_2024() %>% filter(state_officetype_answer_lastname != new_row_key)
      exit_poll_data_2024(rbind(updated_data, data))

    } else if (table == "Logan_Called_Elections") {
      new_row_key <- data$state_district_office
      updated_data <- called_races() %>% filter(state_district_office != new_row_key)
      called_races(rbind(updated_data,data))

    } else { #table == County_Results
      new_row_key <- data$officetype_county_district_state
      updated_data <- county_data() %>% filter(officetype_county_district_state != new_row_key)
      county_data(rbind(updated_data, data))
    }
  })

  cat("Loaded REST data\n")
  
  last_election_year <- reactive({
    if (election_type() == "President" || election_type() == "Governor") {
      2020
    } else if (election_type() == "House") {
      2022
    } else {
      2018 
    }
  })
  
  structured_called_races <- reactive({
    called_races() %>%
      mutate(
        state = str_extract(state_district_office, "^[A-Z]{2}"),
        district = str_extract(state_district_office, "\\d{1,2}"),
        office = str_extract(state_district_office, "\\D+$")
      ) %>% 
      mutate(state_name = state.name[match(state, state.abb)]) %>%
      left_join(electoral_votes, by = "state")
    })
  

  dem_ev_tally <- reactive({
    dem_races <- structured_called_races() %>%
      filter(called == 'D',
             office == "President") %>%
      pull("votes") %>%
      sum()
    
    dem_races
  })
  rep_ev_tally <- reactive({
    structured_called_races() %>%
      filter(called == 'R',
             office == "President") %>%
      pull("votes") %>%
      sum()
  }) 
  
  electoral_vote_tally <- renderText({
    rep <- paste0("<font color=\"#FF0000\">", dem_ev_tally(), "</font>")
    dem <- paste0("<font color=\"#0000FF\">", rep_ev_tally(), "</font>")
    
    glue("{rep} - {dem}")
  })
  output$electoral_vote_tally <- electoral_vote_tally
  output$house_electoral_vote_tally <- electoral_vote_tally
  
  selected_race_data <- reactive({
     filter_races(current_data(),
                  office_selection = election_type(),
                  state_selection = state_selection(),
                  district_selection = district_selection())
      
  })

  dem_votes <- renderText({format(selected_race_data()$dem_votes[1], nsmall=0, big.mark=",")})
  rep_votes <- renderText({format(selected_race_data()$rep_votes[1], nsmall=0, big.mark=",")})
  dem_pct <- renderText({paste0(selected_race_data()$dem_votes_pct[1], "%")})
  rep_pct <- renderText({paste0(selected_race_data()$rep_votes_pct[1], "%")})
  
  output$dem_votes <- dem_votes
  output$rep_votes <- rep_votes
  output$dem_pct <- dem_pct
  output$rep_pct <- rep_pct
  output$house_dem_votes <- dem_votes
  output$house_rep_votes <- rep_votes
  output$house_dem_pct <- dem_pct
  output$house_rep_pct <- rep_pct
  
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
    presidential_margin <- current_data() %>% 
      filter_races(state_selection = state_selection(),
                   office_selection = "President") 
    
    presidential_margin <- presidential_margin$margin_pct[1]
    
    current_margin <- selected_race_data()$margin_pct[1] 
    
    paste0(round(presidential_margin - current_margin, 1), "%")
  })
  output$house_performance_v_president <- renderText({performance_v_president()})
    
  output$performance_or_ev <- renderText({
    ifelse(election_type() == "President", 
           state_electoral_votes(),
           performance_v_president())
  })
  
  output$last_election_header <- renderUI({glue("Performance v. {last_election_year()}")})
  output$last_election_turnout_header <- renderUI({glue("{last_election_year()} Turnout")})
  output$last_election_turnout_map_header <- renderUI({glue("{last_election_year()} Turnout Map")})
  output$last_election_margin_header <- renderUI({glue("{last_election_year()} Margin")})
  
  current_margin <- renderText({
    val <- selected_race_data()$margin_pct[1] 
    ifelse(val < 0,
      glue("<font color=\"#FF0000\">", round(val, 1), "%</font>"),
      glue("<font color=\"#0000FF\">+", round(val, 1), "%</font>")
    )
  })
  output$current_margin <- current_margin
  output$house_margin <- current_margin
  
  last_election_margin <- renderText({
    val <- selected_race_data()$margin_pct_1[1]
    ifelse (val < 0,
      glue("<font color=\"#FF0000\">", round(val, 1), "%</font>"),
      glue("<font color=\"#0000FF\">+", round(val, 1), "%</font>")
    )
  })
  output$last_election_margin <- last_election_margin
  output$house_2022_margin <- last_election_margin
  
  percent_reporting <- renderText({
    glue(round((selected_race_data()$pct_reporting[1]), 1), "%")
  })
  output$percent_reporting <- percent_reporting
  output$house_pct_reporting <- percent_reporting
  
  election_night_shift <- renderText({
    if (state_selection() == "All") {
      poll_closing %>% pull("Shift.in.results")
    } else {
      poll_closing %>% 
        filter(State == state_selection()) %>% 
        pull("Shift.in.results")
    }
  })
  output$election_night_shift <- election_night_shift
  output$house_election_night_shift <- election_night_shift
  
  output$performance_v_president <- renderText({
    presidential_margin <- current_data() %>% 
      filter_races(office_selection = "President",
                   state_selection = state_selection()) %>%
      pull(margin_pct)[1]
    
    current_margin <- selected_race_data()$margin_pct[1]
    
    glue(round(presidential_margin - current_margin, 1), "%")
  })
  
  output$expected_pct_in = renderText({
    glue(round((selected_race_data()$expected_pct_in[1]), 1), "%")
  })
  
  last_election_turnout <- renderText({
    turnout <- round(100 * (selected_race_data()$margin_votes_1) / (selected_race_data()$margin_pct_1), 0)
    format(turnout, nsmall=0, big.mark=",")
  })
  output$house_2022_turnout <- last_election_turnout
  output$last_election_turnout <- last_election_turnout
  
  current_turnout <- renderText({format((selected_race_data()$total_votes[1]), nsmall=0, big.mark=",")})
  output$current_turnout <- current_turnout
  output$house_turnout <- current_turnout
  
  output$predicted_turnout_CI <- renderText({
    lower <- format((selected_race_data()$total_votes_lower[1]), nsmall=0, big.mark=",")
    upper <- format((selected_race_data()$total_votes_upper[1]), nsmall=0, big.mark=",")
    glue("{lower} - {upper}")
  })
  
  output$margin_95_ci <- renderText({
    dem_lower <- (selected_race_data()$dem_votes_lower[1])
    dem_upper <- (selected_race_data()$dem_votes_upper[1])
    rep_lower <- (selected_race_data()$rep_votes_lower[1])
    rep_upper <- (selected_race_data()$rep_votes_upper[1])
    
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
  
  races_to_watch <- renderTable({
    
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
  output$races_to_watch <- races_to_watch
  output$house_races_to_watch <- races_to_watch

  # Exit Polls
  observeEvent(input$exit_poll_selector, {
    output$exit_poll_table <- renderTable({
      if (input$exit_poll_year == 2020) {
        get_exit_poll_table(exit_poll_data_2020, 
                            input$exit_poll_year, 
                            state_selection(), 
                            election_type(), 
                            input$exit_poll_selector) 
      } else {
        get_exit_poll_table(exit_poll_data_2024(), 
                            input$exit_poll_year, 
                            state_selection(), 
                            election_type(), 
                            input$exit_poll_selector) 
      }
    })
    
    output$exit_poll_expectation <- renderTable({
      if (input$exit_poll_year == 2020) {
        get_exit_poll_expectation(exit_poll_data_2020, 
                                  input$exit_poll_year, 
                                  state_selection(), 
                                  election_type(), 
                                  input$exit_poll_selector) 
      } else {
        get_exit_poll_expectation(exit_poll_data_2024(), 
                                  input$exit_poll_year, 
                                  state_selection(), 
                                  election_type(), 
                                  input$exit_poll_selector) 
      }
    })
  })
  
  # Maps 
  output$map_menu_header <- renderText({input$selected_map})

  output$house_margin_map <- renderLeaflet({get_margin_map_district(county_data(), 2024, state_selection(), district_selection())})
  output$house_margin_bubble_map <- renderLeaflet({get_margin_bubble_map_district(county_data(), 2024, state_selection(), district_selection())})
  
  observeEvent(input$TL_map_select, {
    if (input$TL_map_select == "2024_margin") {
      output$TL_map <- renderLeaflet({get_margin_map(county_data(), 2024, state_selection(), election_type())})
      
    } else if (input$TL_map_select == "2024_margin_bubble") {
      output$TL_map <- renderLeaflet({get_margin_bubble_map(county_data(), 2024, state_selection(), election_type())})
      
    } else if (input$TL_map_select == "2024_swing") {
      output$TL_map <- renderLeaflet({get_swing_map(county_data(), state_selection(), election_type(), election_type(), 2020, 2024)})
    
    } else if (input$TL_map_select == "benchmark_differential") {
      output$TL_map <- renderLeaflet({get_benchmark_differential_map(county_data(), state_selection(), election_type())})
    }
  })
  
  observeEvent(input$TR_map_select, {
    if (input$TR_map_select == "2020_margin") {
      output$TR_map <- renderLeaflet({get_margin_map(county_data(), 2020, state_selection(), election_type())})
      
    } else if (input$TR_map_select == "2020_margin_bubble") {
      output$TR_map <- renderLeaflet({get_margin_bubble_map(county_data(), 2020, state_selection(), election_type())})
    
    } else if (input$TR_map_select == "swing_20") {
      output$TR_map <- renderLeaflet({get_swing_map(county_data(), state_selection(), election_type(), election_type(), 2016, 2020)})
    
    } else if (input$TR_map_select == "pres_sen_swing_24") {
      output$TR_map <- renderLeaflet({get_swing_map(county_data(), state_selection(), "President", "Senate", 2024, 2024)})
    
    } else if (input$TR_map_select == "pres_sen_swing_16_18") {
      output$TR_map <- renderLeaflet({get_swing_map(county_data(), state_selection(), "President", "Senate", 2016, 2018)})
    
    } else if (input$TR_map_select == "pres_gov_swing_24") {
      output$TR_map <- renderLeaflet({get_swing_map(county_data(), state_selection(), "President", "Governor", 2024, 2024)})
    
    } else if (input$TR_map_select == "pres_gov_swing_20") {
      output$TR_map <- renderLeaflet({get_swing_map(county_data(), state_selection(), "President", "Governor", 2020, 2020)})
    
    } else if (input$TR_map_select == "benchmarks") {
      output$TR_map <- renderLeaflet({get_benchmark_map(state_selection())})
    } else {
      output$TR_map <- renderLeaflet({NULL})
    }
  })
  
  output$remaining_votes_map <- renderLeaflet({get_votes_left_map(county_data(), state_selection(), election_type())})
  
  observeEvent(input$BR_map_select, {
    if (input$BR_map_select == "white") {
      output$demographic_map <- renderLeaflet({get_demographic_graph(state_selection(), "White")})
    } else if (input$BR_map_select == 'black') {
      output$demographic_map <- renderLeaflet({get_demographic_graph(state_selection(), "Black")})
    } else if (input$BR_map_select == 'hispanic') {
      output$demographic_map <- renderLeaflet({get_demographic_graph(state_selection(), "Hispanic")})
    } else if (input$BR_map_select == 'income') {
      output$demographic_map <- renderLeaflet({get_demographic_graph(state_selection(), "Income")})
    } else if (input$BR_map_select == 'white_college') {
      output$demographic_map <- renderLeaflet({get_demographic_graph(state_selection(), "White College")})
    } 
  })
  
  # Graphs 
  margin_graph_2020 <- renderPlot(get_margin_over_time_graph(2020, election_type(), state_selection(), district_selection()))
  expected_pct_graph_2020 <- renderPlot(get_pct_reporting_over_time_graph(2020, election_type(), state_selection(), district_selection()))
  
  margin_graph_2024 <- renderPlot(get_margin_over_time_graph(2024, election_type(), state_selection(), district_selection(), timeseries_df()))
  expected_pct_graph_2024 <- renderPlot(get_pct_reporting_over_time_graph(2024, election_type(), state_selection(), district_selection(), timeseries_df()))
  
  output$margin_graph_2020 <- margin_graph_2020
  output$house_margin_graph_2022 <- margin_graph_2020
  
  output$expected_pct_graph_2020 <- expected_pct_graph_2020
  output$house_expected_pct_graph_2022 <- expected_pct_graph_2020
  
  output$margin_graph_2024 <- margin_graph_2024
  output$house_margin_graph_2024 <- margin_graph_2024
  
  output$expected_pct_graph_2024 <- expected_pct_graph_2024
  output$house_expected_pct_graph_2024 <- expected_pct_graph_2024
  
  # FAILED CODE FOR GRAPH OVER TIME 
  # harris_to_win_df <- reactive(data.frame())
  # observe({
  #   req(nrow(current_data()) > 0)
  #   pct_to_win <- pct_harris_to_win(current_data(), state_selection(), election_type(), district_selection())
  #   updated_pct_to_win <- rbind(harris_to_win_df(), pct_to_win)
  #   harris_to_win_df(updated_pct_to_win)
  # })
  #                                    
  # 
  # observeEvent(harris_to_win_df(), {
  #   output$pct_to_win_graph <- pct_harris_to_win_graph(harris_to_win_df(),  state_selection(), election_type(), district_selection())
  # })
  
  # LAST MINUTE PATCH TO PROVIDE MINIMUM FUNCTIONALITY
  harris_to_win_list <- reactive({
    pct_harris_to_win_value(current_data(), state_selection(), election_type(), district_selection())
  })
  
  output$harris_to_win_ci <- renderText({
    lower <- harris_to_win_list()$pct_to_win_lower
    upper <- harris_to_win_list()$pct_to_win_upper
    
    glue("Confidence Interval: {round(lower, 1)}% - {round(upper, 1)}%")
  })
  output$harris_to_win <- renderText({
    glue("Percent to win: {round(harris_to_win_list()$pct_to_win, 1)}%")
  })
  output$votes_remaining <- renderText({
    glue("Votes Remaining: {format(harris_to_win_list()$votes_remaining, nsmall=0, big.mark=',')}")
  })
  
  output$house_harris_to_win_ci <- renderText({
    lower <- harris_to_win_list()$pct_to_win_lower
    upper <- harris_to_win_list()$pct_to_win_upper
    
    glue("Confidence Interval: {round(lower, 1)}% - {round(upper, 1)}%")
  })
  output$house_harris_to_win <- renderText({
    glue("Percent to win: {round(harris_to_win_list()$pct_to_win, 1)}%")
  })
  output$house_votes_remaining <- renderText({
    glue("Votes Remaining: {format(harris_to_win_list()$votes_remaining, nsmall=0, big.mark=',')}")
  })
  

  # Dropdown logic
  observe({
    filtered_states <- current_data() %>%
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
    filtered_states <- current_data() %>%
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
                        selected = selected_district)
      
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
  output$elections <- renderUI({
    lapply(filtered_races()$race_id, function(i) {
      election <- filtered_races() %>% filter(race_id == i)
      
      # Create dynamic action links for each election
      div(
        class = "election-card",
        actionLink(
          inputId = paste0("election_", i),
          label = glue("{election$office_type} {election$state} {election$district} - {trunc((election$pct_reporting))}% rep.")
        )
      )
    })
  })
  
  # Observe clicks on action links
  observe({
    lapply(filtered_races()$race_id, function(i) {
      link_id <- paste0("election_", i)
      
      observeEvent(input[[link_id]], {
        req(input[[link_id]])
        
        # Update the select inputs to reflect the chosen election
        election <- filtered_races() %>% filter(race_id == i)
        updateSelectInput(session, "category_select", selected = election$office_type)
        updateSelectInput(session, "state_select", selected = election$state)
        updateSelectInput(session, "district_select", selected = election$district)
      }, ignoreInit = TRUE)
    })
  })
}