library(websocket)
library(httr)
library(jsonlite)
library(shiny)
library(shinycssloaders)

get_new_data <- function(session) {
  ws <- WebSocket$new("wss://xjilt868ci.execute-api.us-east-1.amazonaws.com/prod/")
  
  data <- reactiveVal(NULL)
  table_id <- reactiveVal(NULL)
  
  ws$onOpen(function(event) {
    cat(glue("connected at {Sys.time()}\n"))
  })
  
  ws$onMessage(function(event) {
    new_data <- fromJSON(event$data)
    
    table_id(new_data$tableName)
    
    observe(table_id, {
      cat("Received row from ", table_id(), "\n")
    })
    
    data(new_data$data)
  })
  
  ws$onClose(function(event) {
    cat("WebSocket closed!!!\n")
  })
  
  session$onSessionEnded(function() {
    ws$close()
  })
  
  return(list("table" = table_id, "data" = data))
}

get_rest_api_data <- function(table) {
  rest_api <- 'https://ti2579xmyi.execute-api.us-east-1.amazonaws.com/active?' # REAL REST API
  #rest_api <- 'https://hqd3pncjz7.execute-api.us-east-1.amazonaws.com/test?' # TEST REST API
  
  data <- reactiveVal(NULL)
  
  if (table == "county" || table == "race" || table == "exit_polls" || table == "logan") {
    url <- paste0(rest_api, "table=", table)
  } else {
    data("Invalid table selection for REST API")
  }
  
  api_response <- GET(url)
  
  df <- as.data.frame(bind_rows(fromJSON(content(api_response, as = "text", encoding = "UTF-8"))))
  data(df)

  return(data)
}

get_rest_api_data("race")
