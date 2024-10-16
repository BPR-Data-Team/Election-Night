# THIS FILE CONTAINS HELPER FUNCTIONs FOR DASHBOARD SERVER
# time_to_next_poll() returns a reactive string %H:%M:%S with time until next poll closure nationally

poll_closures <- read.csv("cleaned_data/PollClosures.csv")

time_to_next_poll <- function() {
  current_time <- reactive({
    invalidateLater(1000)  # Update every 1 second (1000 milliseconds)
    format(Sys.time(), "%H:%M:%S")
  })
  
  # Get future poll closure times in 24-hour format
  future_close_times <- reactive({
    poll_closures %>%
      select("Closure.Time") %>%
      lapply(function(time) {
        cleaned <- gsub("a", "AM", gsub("p", "PM", gsub(" EST", "", time)))
        to_24 <- format(strptime(cleaned, "%I:%M%p"), "%H:%M")
        
        # Filter for future poll closing times
        Filter(function(t) { current_time() < t }, to_24)
      })
  })
  
  
  # Get the next poll close time
  times <- reactive({unlist(future_close_times())})
  next_poll_close <- reactive({
    if (all(is.na(times())) || length(times()) == 0) {
      "24:00"
    } else {
      min(times())
    }
  })
  
  # Calculate current and next poll close time as POSIXct
  current_posix <- reactive({
    as.POSIXct(current_time(), format = "%H:%M:%S", tz = "EST")
  })
  
  next_posix <- reactive({
    as.POSIXct(paste0(next_poll_close(), ":00"), format = "%H:%M:%S", tz = "EST")
  })
  
  # Calculate the time difference in seconds
  time_difference_secs <- reactive({
    as.numeric(difftime(next_posix(), current_posix(), units = "secs"))
  })
  
  # Convert the time difference to hours, minutes, and seconds
  hours <- reactive({
    floor(time_difference_secs() / 3600)
  })
  
  minutes <- reactive({
    floor((time_difference_secs() %% 3600) / 60)
  })
  
  seconds <- reactive({
    floor(time_difference_secs() %% 60)
  })
  
  # Helper function to add a leading zero to single-digit time components
  two_digit <- function(time_value) {
    sprintf("%02d", time_value)
  }
  
  # Combine hours, minutes, and seconds into a formatted time string
  reactive({
    glue("{two_digit(hours())}:{two_digit(minutes())}:{two_digit(seconds())}")
  })
}
  
