library(dplyr)

filter_races <- function(current_races, office_selection="All", state_selection="All", district_selection="All") {
  if (class(current_races) == "list") {
    stop("Invalid current_races input for filter_races")
  }
  
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