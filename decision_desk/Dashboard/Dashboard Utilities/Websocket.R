library(websocket)
library(httr)
library(jsonlite)
library(shiny)
library(shinycssloaders)

encode_key <- function(table, key) {
  if (is.null(key)) {
    return(NULL)
  }
  
  key <- str_replace_all(key, " ", "%20")
  if (table == "county") {
    return(paste0("&lastKey=%7B%22officetype_county_district_state%22%3A%20%22", key, "%22%7D"))
  } else if (table == "exit_polls") {
    return(paste0("&lastKey=%7B%22state_officetype_answer_lastname%22%3A%20%22", key, "%22%7D"))
  } else {
    stop("Invalid table to encode key")
  }
  
}

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

  data <- NULL
  
  if (table == "race" || table == "logan") {
    url <- paste0(rest_api, "table=", table)
    
    api_response <- GET(url)
    
    data <- as.data.frame(fromJSON(content(api_response, as = "text", encoding = "UTF-8")))
    
  } else if (table == "county" || table == "exit_polls") {
    lastKey <- NULL
    
    base_url <- paste0(rest_api, "table=", table)
    
    repeat {
      url <- paste0(base_url, encode_key(table, lastKey))

      response<- fromJSON(content(GET(url), as = "text", encoding = "UTF-8"))
      lastKey <- response$lastKey

      data_batch <- response$items
      
      data <- rbind(data, as.data.frame(data_batch))
      
      if (is.null(lastKey)) {
        break
      }
    }
  } else {
    data("Invalid table selection for REST API")
  }
  

  return(data)
}


