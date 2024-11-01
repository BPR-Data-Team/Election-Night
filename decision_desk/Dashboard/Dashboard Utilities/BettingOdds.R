# This replicates the function of the earlier BettingsOdds.R implementation but modularizes it
get_betting_odds <- function(election_type, selected_state) {
  election_urls <- read_csv("cleaned_data/Locally-Hosted Data/betting_odds_links.csv", show_col_types = TRUE)
  
  if (selected_state == "All") {
    selected_state <- "US"
  }
  
  if (election_type == "All") {
    election_type <- "President"
  }
  
  if (election_type == "House") {
    return("Betting odds not available for house elections")
  }
  url_entry <- election_urls %>%
    filter(state == selected_state) %>%
    select(election_type)
  
  base_url <- url_entry[1]
  
  return(tags$iframe(
    src = base_url,
    width = "400",
    height = "100",
    frameBorder = "0"
  ))
}