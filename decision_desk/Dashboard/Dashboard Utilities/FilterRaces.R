library(dplyr)

filter_races <- function(current_races, office_selection="All", state_selection="All", district_selection="All") {
  data <- current_races
  
  if (office_selection != "All") {
    data <- data %>% filter(office_type == office_selection)
  }
  
  if (state_selection != "All") {
    data <- data %>% filter(state == state_selection)
  }
  
  if (district_selection != "All") {
    data <- data %>% filter(district == district_selection)
  }
  
  return(data)
}