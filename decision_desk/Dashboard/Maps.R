mapServer <- function(id, election_type, state) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns
    
    # Reactive expression to construct the file path
    geojson_file_path <- reactive({
      category <- election_type()
      selected_state_abb <- state()
      if (selected_state_abb == "US") {
        selected_state <- "US"
      } else {
        selected_state <- state.name[match(selected_state_abb, state.abb)]
      }
      # Construct the file path
      glue("../../GeoJSON/County/2022/{selected_state}_2022.geojson")
    })
    
    # Reactive expression to read GeoJSON data
    geojson_data <- reactive({
      if (!file.exists(geojson_file_path())) {
        showNotification("No data available for this selection.", type = "warning")
        return(NULL)
      }
      st_read(geojson_file_path())
    })
    
    # Reactive value to store the selected FIPS code
    selected_fips <- reactiveVal(NULL)
    
    # Render the leaflet map
    output$map_container <- renderLeaflet({
      data <- geojson_data()
      req(data)
      
      leaflet(data = data, options = leafletOptions(
        attributionControl=FALSE)) %>%
        addPolygons(
          fillColor = "white",
          weight = 1,
          color = "black",
          fillOpacity = 0.7,
          highlight = highlightOptions(
            weight = 2,
            color = "#666",
            fillOpacity = 0.7,
            bringToFront = TRUE
          ),
          label = ~NAME,  # Replace 'NAME' with the actual field for county names
          labelOptions = labelOptions(
            style = list("font-weight" = "normal", padding = "3px 8px"),
            textsize = "15px",
            direction = "auto"
          ),
          layerId = ~COUNTYFP  #
        ) %>%
        addProviderTiles(providers$CartoDB.PositronNoLabels) %>%  # Light background without labels
        addProviderTiles(providers$CartoDB.PositronOnlyLabels)  # Only labels
    })
    
    # Adjust the map view when the data changes
    observe({
      data <- geojson_data()
      req(data)
      bounds <- st_bbox(data)
      leafletProxy("map_container") %>%
        fitBounds(
          lng1 = bounds$xmin,
          lat1 = bounds$ymin,
          lng2 = bounds$xmax,
          lat2 = bounds$ymax
        )
    })
    
    # Observe click events on the polygons
    observeEvent(input$map_container_shape_click, {
      click <- input$map_container_shape_click
      clicked_fips <- click$id  # The layerId we set earlier
      selected_fips(clicked_fips)  # Store the selected FIPS code
      
      # Optional: Display a notification or update UI elements
      showNotification(glue("Selected County FIPS: {clicked_fips}"), type = "message")
    })
    
    # Return the selected FIPS code to the main server
    return(list(
      selected_fips = selected_fips
    ))
  })
}

# Map Module UI
mapOutputUI <- function(id) {
  ns <- NS(id)
  leafletOutput(ns("map_container"))
}
