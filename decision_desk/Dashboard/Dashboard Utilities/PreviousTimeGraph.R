library(tidyverse)
library(ggplot2)
library(plotly)
 
source("decision_desk/Dashboard/Dashboard Utilities/FilterRaces.R")

time_2020 <- read_csv("cleaned_data/Locally-Hosted Data/Same_Time_2020.csv", show_col_types = FALSE) %>%
  mutate(timestamp = with_tz(timestamp, tzone = "EST"))

get_margin_over_time_graph <- function(year, office_select, state_abbrev, district_select, time_data = time_2020) {
  if (year == 2020) {
    # WARNING: Can only do presidential margin in 2020
    state_time_2020 <- time_2020 %>% 
      filter(state == state_abbrev) 
    
    final_margin <- state_time_2020 %>%
      filter(timestamp == max(timestamp)) %>%
      pull(margin)
    
    graph_points <- state_time_2020 %>%
      filter(timestamp < as_datetime("2020-11-04 5:00:00", tz = "EST"))
    
    # Graph to plot vote share over time
    graph <- ggplot(graph_points, aes(x = timestamp, y = margin)) +
      geom_line(size = 1) +
      xlab("Time") +
      ylab("Margin") +
      scale_y_continuous(labels = function(x) ifelse(x < 0, paste0("R+", abs(x)), paste0("D+", x))) +
      coord_cartesian(ylim = c(-25, 25)) +
      scale_x_datetime(date_labels = "%l %p", date_breaks = "1 hour", expand = expansion(mult = c(0, 0))) +
      geom_hline(yintercept = 0, color = "purple", linetype = "solid") +
      geom_hline(yintercept = final_margin, color = ifelse(final_margin > 0, "blue", "red"), linetype = "dashed") +
      theme_minimal(base_size = 12) +
      theme(panel.grid.major = element_line(color = "gray90"),
            panel.grid.minor = element_blank(),
            legend.position = "none") 
  } else{
    data <- time_data %>% 
      filter_races(office_selection = office_select,
                   state_selection = state_abbrev,
                   district_selection = district_select)
    
    final_margin <- data %>% 
      filter(timestamp == max(timestamp)) %>%
      pull(margin_pct)
    
    graph_points <- data %>%
      filter(timestamp < as_datetime("2020-11-04 5:00:00", tz = "EST"))
    
    # Graph to plot vote share over time
    graph <- ggplot(graph_points, aes(x = timestamp, y = margin_pct)) +
      geom_line(size = 1) +
      xlab("Time") +
      ylab("Margin") +
      scale_y_continuous(labels = function(x) ifelse(x < 0, paste0("R+", abs(x)), paste0("D+", x))) +
      coord_cartesian(ylim = c(-25, 25)) +
      scale_x_datetime(date_labels = "%l %p", date_breaks = "1 hour", expand = expansion(mult = c(0, 0))) +
      geom_hline(yintercept = 0, color = "purple", linetype = "solid") +
      geom_hline(yintercept = final_margin, color = ifelse(final_margin > 0, "blue", "red"), linetype = "dashed") +
      theme_minimal(base_size = 12) +
      theme(panel.grid.major = element_line(color = "gray90"),
            panel.grid.minor = element_blank(),
            legend.position = "none") 
  }
  return(graph)
}

get_pct_reporting_over_time_graph <- function(year, office_select, state_abbrev, district_select, time_data = time_2020) {
  if (year == 2020) {
    state_time_2020 <- time_2020 %>% 
      filter(state == state_abbrev) 
    
    final_margin <- state_time_2020 %>%
      filter(timestamp == max(timestamp)) %>%
      pull(margin)
    
    graph_points <- state_time_2020 %>%
      filter(timestamp < as_datetime("2020-11-04 5:00:00", tz = "EST"))
    
    graph <- ggplot(graph_points, aes(x = timestamp, y = eevp)) +
      geom_line(size = 1) +
      xlab("Time") +
      ylab("% of vote in") +
      scale_y_continuous(limits = c(0, 100)) + 
      scale_x_datetime(date_labels = "%l %p", date_breaks = "1 hour", expand = expansion(mult = c(0, 0))) +
      theme_minimal(base_size = 12) +
      theme(panel.grid.major = element_line(color = "gray90"),
            panel.grid.minor = element_blank(),
            legend.position = "none") 
  } else{
    data <- time_data %>% 
      filter_races(office_selection = office_select,
                   state_selection = state_abbrev,
                   district_selection = district_select)
    
    graph_points <- data %>%
      filter(timestamp < as_datetime("2020-11-04 5:00:00", tz = "EST"))
    
    graph <- ggplot(graph_points, aes(x = timestamp, y = pct_reporting)) +
      geom_line(size = 1) +
      xlab("Time") +
      ylab("% of vote in") +
      scale_y_continuous(limits = c(0, 100)) + 
      scale_x_datetime(date_labels = "%l %p", date_breaks = "1 hour", expand = expansion(mult = c(0, 0))) +
      theme_minimal(base_size = 12) +
      theme(panel.grid.major = element_line(color = "gray90"),
            panel.grid.minor = element_blank(),
            legend.position = "none") 
  }
  return(graph)
}


