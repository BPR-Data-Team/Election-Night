library(tidyverse)
library(leaflet)
library(leaflet.extras)
library(RColorBrewer)  # For color palettes
library(sf)
library(glue)
library(jsonlite)

county_data <- read_csv("cleaned_data/Changing Data/DDHQ_current_county_results.csv", show_col_types = FALSE)

transfer_names <- read_csv("cleaned_data/Locally-Hosted Data/Demographic_Name_Transfers.csv", show_col_types = FALSE) 

demographic_data <- read_csv("cleaned_data/Locally-Hosted Data/County_Demographics.csv", show_col_types = FALSE) 

get_demographic_graph <- function(BASEPATH, state_abbrev, demographic_type) {
  county_dems_data <- demographic_data %>%
    filter(state == state_abbrev)
  
  suppressMessages({suppressWarnings({
    geojson_link <- glue("GeoJSON/County/2022/{state.name[match(state_abbrev, state.abb)]}_2022.geojson")
    
    city_json <- glue("election-portal/public/GeoJSON/City/{state.name[match(state_abbrev, state.abb)]}.json")
    
    city_data <- fromJSON(city_json)
    city_sf <- st_as_sf(city_data, coords = c("lon", "lat"), crs = 4326)
  })})
  
  geo_data <- st_read(geojson_link) %>%
    left_join(county_dems_data, by = c("COUNTYFP" = "fips"))
  
  colname <- as.character(transfer_names[which(transfer_names$name_nice == demographic_type), "variable_name"])

  
  #Income and Age work differently! They are non-proportional, so they have to have graphs that go to their max
  if (demographic_type %in% c("Income", "Age")) {
    pal <- colorNumeric(palette = "OrRd", domain = c(0, max(geo_data[[colname]], na.rm = TRUE)))
    
    graph <- leaflet(geo_data, options = leafletOptions(
      attributionControl = FALSE, 
      zoomControl = FALSE,
      dragging = FALSE,
      scrollWheelZoom = FALSE,
      doubleClickZoom = FALSE,
      boxZoom = FALSE,
      touchZoom = FALSE)) %>%
      setMapWidgetStyle(list(background= "white")) %>%
      addPolygons(
        fillColor = ~pal(get(colname)),
        color = "black",
        weight = 1,
        opacity = 1,
        fillOpacity = 0.7,
        highlightOptions = highlightOptions(
          weight = 2,
          color = "#666",
          fillOpacity = 0.7,
          bringToFront = TRUE
        ),
        label = ~ glue("{NAME}: {get(colname)}")
      ) %>%
      addLegend(
        pal = pal,
        values = c(0, max(geo_data[[colname]], na.rm = TRUE)),
        position = "bottomright",
        title = glue("Median {demographic_type}")
      ) %>%
      # Adding city markets
      addCircleMarkers(
        data = city_sf,
        radius = 2,
        color = "black",
        fillColor = "black",
        fillOpacity = 0.8,
        weight = 1
      ) %>%
      addLabelOnlyMarkers(
        data = city_sf,
        label = ~name,
        labelOptions = labelOptions(
          noHide = TRUE,
          direction = "top",
          textOnly = TRUE,
          offset = c(0, -10),  # Offset label to move it above the marker
          style = list(
            "color" = "black",          # Use a darker green for better contrast
            "font-size" = "10px",         # Smaller font size to be less overpowering
            "font-weight" = "bold",
            "background-color" = "rgba(255, 255, 255, 0.7)",  # Semi-transparent white background for readability
            "padding" = "0.5px 0.5px",        # Add some padding for better visual spacing
            "border-radius" = "3px"       # Rounded corners for the background
          )
        )
      )
    
  } else {
    pal <- colorNumeric(palette = "OrRd", domain = c(0, 1))
    
    graph <- leaflet(geo_data, options = leafletOptions(
      attributionControl = FALSE, 
      zoomControl = FALSE,
      dragging = FALSE,
      scrollWheelZoom = FALSE,
      doubleClickZoom = FALSE,
      boxZoom = FALSE,
      touchZoom = FALSE)) %>%
      setMapWidgetStyle(list(background= "white")) %>%
      addPolygons(
        fillColor = ~pal(get(colname)),
        color = "black",
        weight = 1,
        opacity = 1,
        fillOpacity = 0.7,
        highlightOptions = highlightOptions(
          weight = 2,
          color = "#666",
          fillOpacity = 0.7,
          bringToFront = TRUE
        ),
        label = ~ glue("{NAME}: {100 * round(get(colname), 3)}%")
      ) %>%
      # Adding city markets
      addCircleMarkers(
        data = city_sf,
        radius = 2,
        color = "black",
        fillColor = "black",
        fillOpacity = 0.8,
        weight = 1
      ) %>%
      addLabelOnlyMarkers(
        data = city_sf,
        label = ~name,
        labelOptions = labelOptions(
          noHide = TRUE,
          direction = "top",
          textOnly = TRUE,
          offset = c(0, -10),  # Offset label to move it above the marker
          style = list(
            "color" = "black",          # Use a darker green for better contrast
            "font-size" = "10px",         # Smaller font size to be less overpowering
            "font-weight" = "bold",
            "background-color" = "rgba(255, 255, 255, 0.7)",  # Semi-transparent white background for readability
            "padding" = "0.5px 0.5px",        # Add some padding for better visual spacing
            "border-radius" = "3px"       # Rounded corners for the background
          )
        )
      ) %>%
      addLegend(
        pal = pal,
        values = c(0, 1),
        position = "bottomright",
        title = glue("{demographic_type} Percent"),
        labFormat = labelFormat(suffix = "%", transform = function(x) x * 100)
      ) 
  }
  
  return (graph)
}

state_abbrev <- "AL"
demographic_type <- "Income"

get_demographic_graph(getwd(), state_abbrev, demographic_type)



