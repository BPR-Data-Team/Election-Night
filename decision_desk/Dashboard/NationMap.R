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
mapModuleServer <- function(id, stateInfo) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns  # Namespace for server-side elements
    
    # Render the leaflet map centered on the US
    output$stateMap <- renderLeaflet({
      leaflet(us_states_geojson) %>%
        addProviderTiles("CartoDB.Positron") %>%
        setView(lng = -96, lat = 37.8, zoom = 4) %>%  # Center the map on the US with appropriate zoom
        addPolygons(
          fillColor = "lightblue",  # Set default fill color
          weight = 1,
          opacity = 1,
          color = "white",
          dashArray = "3",
          fillOpacity = 0.7,
          highlightOptions = highlightOptions(
            weight = 5,
            color = "#666",
            dashArray = "",
            fillOpacity = 0.7,
            bringToFront = TRUE
          ),
          layerId = ~id,  # Ensure each state has a unique ID
          popup = ~paste("<strong>State:</strong>", name)  # Customize popup info
        )
    })
    
    # Add click event for state polygons
    observeEvent(input$stateMap_shape_click, {
      clicked_state <- input$stateMap_shape_click$id
      # Update the stateInfo reactive value when a state is clicked
      stateInfo(paste("You clicked on state:", clicked_state))
    })
  })
}
