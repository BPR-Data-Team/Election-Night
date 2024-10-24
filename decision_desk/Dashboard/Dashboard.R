library(shiny)
library(shinyWidgets)
library(bslib)
library(ggplot2)
library(leaflet)

BASEPATH <- ifelse(Sys.getenv("ElectionNightPath") == "", 
                   "~/GitHub/Election-Night", 
                   Sys.getenv("ElectionNightPath"))
#BASEPATH <- "~/Documents/Atom/Election-Night"
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
election_types <- current_data %>% pull("office_type") %>% unique() %>% append(., "All", after = 0)

poll_closing <- read.csv("cleaned_data/Locally-Hosted Data/poll_closing.csv")
closing_times <- poll_closing %>% pull("Poll.Closing") %>% unique() %>% head(-1)

# ----------------------------- TODO ---------------------------------------- #
#predicted_margin
# change margin_95_ci from votes to percent 
#last_election_turnout
#election_night_shift
#margin_graph_2020
#expected_pct_graph_2020
#24cast_prediction
# If race type all, change dashboard to race agnostic

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
    
    output$predicted_margin <- renderText({"TODO"})
    
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
      print(glue("{dem_lower}, {dem_upper}, {rep_lower}, {rep_upper}"))
      
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
               "Not called elction night" = "No.Call.Election.Night") %>%
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
    
    # Maps 
    output$map_menu_header <- renderText({input$selected_map})
    output$margin_map_2024 <- renderLeaflet({get_graph(state_selection(), election_type(), "margin", BASEPATH)})
    output$margin_bubble_map_2024 <- renderLeaflet({get_graph(state_selection(), election_type(), "margin_bubble", BASEPATH)})
    output$swing_map_2024 <- renderLeaflet({get_graph(state_selection(), election_type(), "swing", BASEPATH)})
    
    observeEvent(input$margin_year, {
      updateTabsetPanel(session, "margin_year",
                        selected = paste("margin_map_{input$margin_year}")
      )
    })
    observeEvent(input$bubble_year, {
      updateTabsetPanel(session, "bubble_year",
                        selected = paste("margin_bubble_map_{input$bubble_year}")
      )
    })
    observeEvent(input$swing_year, {
      updateTabsetPanel(session, "swing_year",
                        selected = paste("swing_map_{input$swing_year}")
      )
    })
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
        selected_state <- "All"  # Fallback to "All" if the current state is not in the filtered states
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
        #print(time_str_to_num(input$poll_closing_bounds[1]))
        #print(time_str_to_num(current_data %>% left_join(poll_closing, by = c("state" = "State")) %>% filter(state == "MA", office_type == "President") %>% pull(Poll.Closing)))
        #print(time_str_to_num(input$poll_closing_bounds[2]))
        elections <- current_data %>%
          left_join(poll_closing, by = c("state" = "State")) %>%
          filter(
            (input$category_select == "All" | office_type == input$category_select),  # Skip filter if "All"
            (input$state_select == "All" | state == input$state_select),  # Skip filter if "All"
            (is.na(pct_reporting) | (input$percent_reporting_bounds[1] <= pct_reporting & input$percent_reporting_bounds[2] >= pct_reporting)),
            (time_str_to_num(input$poll_closing_bounds[1]) <= time_str_to_num(Poll.Closing) & time_str_to_num(input$poll_closing_bounds[2]) >= time_str_to_num(Poll.Closing))
          ) %>% mutate(district = suppressWarnings((as.integer(district))))
        
        if (nrow(elections) == 0) {
          return(div("No elections match your criteria"))
        }
        
        lapply(1:nrow(elections), function(i) {
          election <- elections[i, ]
          div(
            class = "election-card",
            actionLink(inputId = paste0("election_", election$race_id), label = glue("{election$office_type} {election$state} - {trunc(election$pct_reporting)}% rep."))          )
        })
      })
    })
}

# ------------------------------ UI ------------------------------------------ #
graphOutputUI <- page_sidebar(
  titlePanel(h1("24cast.org Election Day Dashboard", align = "center")),
  sidebar =  sidebar(
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
    sliderInput( 
      inputId = "percent_reporting_bounds", 
      label = "% Reporting:", 
      min = 0, max = 100, 
      value = c(30, 70),
      step = 10
    ),
    sliderTextInput(
      inputId = "poll_closing_bounds",
      label = "Poll Closing Times:",
      choices = closing_times,
      selected = c(closing_times[1], closing_times[length(closing_times)]),
      grid = TRUE,
      force_edges = TRUE
    ),
    checkboxInput(
      inputId = "key_races",
      label = "Key Races Only",
      value = FALSE
    ),
    tableOutput("elections")
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
      col_widths = c(9),
      div(style = "height:90px;"),
      card(
        card_header("Current Electoral Vote Tally"),
        "TODO"
      ),
      card(
        card_header("Time to next poll close"),
        textOutput("next_poll_close")
      )
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
      navset_card_underline(
        navbarMenu(
          textOutput("map_menu_header"), 
          tabPanel("Margin Map",
            tabsetPanel(id = "margin_year",
              type = "tabs", 
              selected = "2024",
              tabPanel("2024", leafletOutput("margin_map_2024")),
              tabPanel("2020", "TODO"),
              tabPanel("2016", "TODO")
            )
          ),
          tabPanel("Margin Bubble Map",
             tabsetPanel(id = "margin_bubble_year",
               type = "tabs", 
               selected = "2024",
               tabPanel("2024", leafletOutput("margin_bubble_map_2024")),
             )
          ),
          tabPanel("Swing Map",
             tabsetPanel(id = "swing_year",
               type = "tabs", 
               selected = "2024",
               tabPanel("2024", leafletOutput("swing_map_2024")),
               tabPanel("2020", "TODO"),
             )
          )
        ), 
        id = "selected_map"
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
