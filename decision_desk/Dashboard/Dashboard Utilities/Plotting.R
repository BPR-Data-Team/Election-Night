library(tidyverse)
library(leaflet)
library(leaflet.extras)
library(RColorBrewer)  # For color palettes
library(sf)
library(glue)

county_data <- read_csv("cleaned_data/Changing Data/DDHQ_current_county_results.csv")

#This is code to get a nicely-labeled 
get_label <- function(NAME, Republican_name, Democratic_name, Republican_votes, Democratic_votes, 
                      Republican_votes_percent, Democratic_votes_percent, expected_pct_in) {
  # Extract last names
  Republican_last_name <- tail(strsplit(Republican_name, " ")[[1]], 1)
  Democratic_last_name <- tail(strsplit(Democratic_name, " ")[[1]], 1)
  
  paste0(
    '<div style="font-family: Arial, sans-serif; padding: 6px; background-color: #f9f9f9; border-radius: 4px; max-width: 260px;">',
    '<strong style="font-size: 14px; color: #333;">', NAME, '</strong>',
    '<table style="width: 100%; font-size: 11px; margin-top: 4px;">',
    '<tr>',
    '<th style="text-align:left; padding: 4px;">Candidate</th>',
    '<th style="text-align:right; padding: 4px;">Votes</th>',
    '<th style="text-align:right; padding: 4px;">Pct.</th>',
    '</tr>',
    '<tr>',
    '<td style="border-left: 3px solid red; padding: 4px;">', Republican_last_name, ' (R)</td>',
    '<td style="text-align:right; padding: 4px;">', format(Republican_votes, big.mark = ","), '</td>',
    '<td style="text-align:right; padding: 4px;">', sprintf("%.1f", Republican_votes_percent), '%</td>',
    '</tr>',
    '<tr>',
    '<td style="border-left: 3px solid blue; padding: 4px;">', Democratic_last_name, ' (D)</td>',
    '<td style="text-align:right; padding: 4px;">', format(Democratic_votes, big.mark = ","), '</td>',
    '<td style="text-align:right; padding: 4px;">', sprintf("%.1f", Democratic_votes_percent), '%</td>',
    '</tr>',
    '</table>',
    '<div style="font-size: 9px; color: #666; text-align: right; margin-top: 4px;">',
    expected_pct_in, '% reported</div>',
    '</div>'
  )
}



get_graph <- function(state_abbrev, office, map_type) {
  current_data <- county_data %>%
    filter(state == state_abbrev & office_type == office)

  geojson_link <- glue("{BASEPATH}/GeoJSON/County/2022/{state.name[match(state_abbrev, state.abb)]}_2022.geojson")

  geo_data <- st_read(geojson_link) %>%
    left_join(current_data, by = c("COUNTYFP" = "fips"))
  
  if (!(map_type %in% c("swing", "margin", "margin_bubble"))) {
    stop("Cannot create map of given type")
  }
  
  if (map_type == "swing") {
    #---- COLOR BINS ------
    # Define custom bins for swing values
    bins <- c(-Inf, -15, 0, 15, Inf)
    
    # Define corresponding colors
    colors <- colorRampPalette(c( "#B83C2B", "#ffffff", "#595D9A"))(length(bins) - 1)
    pal <- colorBin(
      palette = colors,
      bins = bins,
      domain = geo_data$swing,
      na.color = "black"
    )
    
    graph <- leaflet(geo_data, options = leafletOptions(
      attributionControl = FALSE, 
      zoomControl = FALSE,
      dragging = FALSE,
      scrollWheelZoom = FALSE,
      doubleClickZoom = FALSE,
      boxZoom = FALSE,
      touchZoom = FALSE)) %>%
      #addProviderTiles(providers$CartoDB.PositronNoLabels) %>%  # A blank tile layer
      setMapWidgetStyle(list(background= "white")) %>%
      addPolygons(
        fillColor = ~pal(swing),
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
        label = ~glue("{NAME} swing: {ifelse(swing > 0, 'D+', 'R+')}{abs(round(swing, 1))}")
      ) 
  }
  
  if (map_type == "margin") {
    #---- COLOR BINS ------
    # Define custom bins for swing values
    bins <- c(-Inf, -15, 0, 15, Inf)
    
    # Define corresponding colors
    colors <- colorRampPalette(c( "#B83C2B", "#ffffff", "#595D9A"))(length(bins) - 1)
    pal <- colorBin(
      palette = colors,
      bins = bins,
      domain = geo_data$margin_pct,
      na.color = "black"
    )
    
    
    
    graph <- leaflet(geo_data, options = leafletOptions(
      attributionControl = FALSE, 
      zoomControl = FALSE,
      dragging = FALSE,
      scrollWheelZoom = FALSE,
      doubleClickZoom = FALSE,
      boxZoom = FALSE,
      touchZoom = FALSE)) %>%
      #addProviderTiles(providers$CartoDB.PositronNoLabels) %>%  # A blank tile layer
      setMapWidgetStyle(list(background= "white")) %>%
      addPolygons(
        fillColor = ~pal(margin_pct),
        color = "black",
        label = ~lapply(get_label(NAME, Republican_name, Democratic_name, Republican_votes, Democratic_votes, 
                                 Republican_votes_percent, Democratic_votes_percent, expected_pct_in), htmltools::HTML),  # Convert HTML for the popup
        weight = 1,
        opacity = 1,
        fillOpacity = 0.7,
        highlightOptions = highlightOptions(
          weight = 2,
          color = "#666",
          fillOpacity = 0.7,
          bringToFront = TRUE
        )
      ) 
    
  }
  
  if (map_type == "margin_bubble") {
    geo_data_centroids <- st_centroid(geo_data)

    # Define custom bins for swing values
    bins <- c(-Inf, -15, 0, 15, Inf)
    
    # Define corresponding colors
    colors <- colorRampPalette(c( "#B83C2B", "#ffffff", "#595D9A"))(length(bins) - 1)
    pal <- colorBin(
      palette = colors,
      bins = bins,
      domain = geo_data$margin_pct,
      na.color = "black"
    )
    
    max_votes <- max(abs(geo_data_centroids$margin_votes))

    graph <- leaflet(geo_data, options = leafletOptions(
      attributionControl = FALSE, 
      zoomControl = FALSE,
      dragging = FALSE,
      scrollWheelZoom = FALSE,
      doubleClickZoom = FALSE,
      boxZoom = FALSE,
      touchZoom = FALSE)) %>%
      #addProviderTiles(providers$CartoDB.PositronNoLabels) %>%  # A blank tile layer
      setMapWidgetStyle(list(background= "white")) %>% # A blank tile layer
      addCircleMarkers(
        data = geo_data_centroids,
        fillColor = ~pal(margin_votes), 
        color = "black",
        radius = ~ 25 * abs(margin_votes / max_votes),
        weight = 1,
        opacity = 1,
        fillOpacity = 0.7
      ) %>%
      addPolygons(
        data = geo_data,
        weight = 1,
        color = "grey",
        fillColor = "white",
        opacity = 1,
        fillOpacity = 0,
        label = ~lapply(get_label(NAME, Republican_name, Democratic_name, Republican_votes, Democratic_votes, 
                                  Republican_votes_percent, Democratic_votes_percent, expected_pct_in), htmltools::HTML),  # Convert HTML for the popup
      ) 
      
  }

  return (graph)
  
}

state <- "AL"
office_type_check <- "President"
map_version <- "margin_bubble"

get_graph(state, office_type_check, map_version)
