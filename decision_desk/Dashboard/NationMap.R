library(shiny)
library(leaflet)
library(geojsonio)  # For reading GeoJSON files

# Load GeoJSON for US states
us_states_geojson <- geojson_read("/Users/emilyhong/Desktop/24cast.org/Election-Night/GeoJSON/State/us-states.json", what = "sp")

# Define UI for the map module
mapModuleUI <- function(id) {
  ns <- NS(id)  # Create a namespace for the module
  leafletOutput(ns("stateMap"), height = 400)  # Specify height for the map
}


# Define server logic for the map module
mapModuleServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    
    # Render the leaflet map centered on the US
    output$stateMap <- renderLeaflet({
      leaflet() %>%
        addProviderTiles("CartoDB.Positron") %>%  # Add base map tiles
        addPolygons(
          data = map("state", fill = TRUE, plot = FALSE),  # Use US state boundaries from 'maps' package
          fillColor = "lightblue",  # Color for the states
          color = "white",  # Border color for the states
          weight = 2,  # Border thickness
          popup = ~paste("State:", sub(":", "", names(map("state", plot = FALSE)))),  # Popup with state name
          highlightOptions = highlightOptions(
            weight = 3,
            color = "blue",
            fillOpacity = 0.7
          )
        ) %>%
        setView(lng = -96, lat = 37.8, zoom = 4)  # Center the map on the US
    })
    
    # Add click event for state polygons
    observeEvent(input$stateMap_shape_click, {
      clicked_state <- input$stateMap_shape_click$id
      showModal(modalDialog(
        title = "State Information",
        paste("You clicked on state:", clicked_state)
      ))
    })
  })
}