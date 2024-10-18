library(tidyverse)
library(ggplot2)
library(plotly)
 
time_2020 <- read_csv("cleaned_data/Locally-Hosted Data/Same_Time_2020.csv") %>%
  mutate(timestamp = with_tz(timestamp, tzone = "EST"))


get_time_graph <- function(state_abbrev, graph_type = "vote_share") {
  state_time_2020 <- time_2020 %>% 
    filter(state == state_abbrev) 
  
  final_margin <- state_time_2020 %>%
    filter(timestamp == max(timestamp)) %>%
    pull(margin)
  
  graph_points <- state_time_2020 %>%
    filter(timestamp < as_datetime("2020-11-04 5:00:00", tz = "EST"))
  
  
  # Define color based on margin value
  
  if (graph_type == "vote_share") {
    # Graph to plot vote share over time
    graph <- ggplot(graph_points, aes(x = timestamp, y = margin)) +
      geom_line(size = 1) +
      xlab("Time") +
      ylab("Margin") +
      scale_y_continuous(labels = function(x) ifelse(x < 0, paste0("R+", abs(x)), paste0("D+", x))) +
      scale_x_datetime(date_labels = "%l %p", date_breaks = "1 hour", expand = expansion(mult = c(0, 0))) +
      geom_hline(yintercept = 0, color = "purple", linetype = "solid") +
      geom_hline(yintercept = final_margin, color = ifelse(final_margin > 0, "blue", "red"), linetype = "dashed") +
      theme_minimal(base_size = 12) +
      theme(panel.grid.major = element_line(color = "gray90"),
            panel.grid.minor = element_blank(),
            legend.position = "none") 
    
  } else if (graph_type == "expected_pct_in") {
    graph <- ggplot(graph_points, aes(x = timestamp, y = eevp)) +
      geom_line(size = 1) +
      xlab("Time") +
      ylab("% of vote in") +
      scale_x_datetime(date_labels = "%l %p", date_breaks = "1 hour", expand = expansion(mult = c(0, 0))) +
      theme_minimal(base_size = 12) +
      theme(panel.grid.major = element_line(color = "gray90"),
            panel.grid.minor = element_blank(),
            legend.position = "none") 
  } else {
    stop("Please choose a different graph type!")
  }
  
  return (graph)
}


previous_time_graphs <- map(state.abb, ~ get_time_graph(., "vote_share"))
previous_time_expected_pct_graphs <- map(state.abb, ~ get_time_graph(., "expected_pct_in"))
names(previous_time_graphs) <- state.abb
names(previous_time_expected_pct_graphs) <- state.abb

