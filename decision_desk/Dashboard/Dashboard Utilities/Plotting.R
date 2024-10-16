library(tidyverse)
library(leaflet)
library(RColorBrewer)  # For color palettes
library(sf)
library(glue)

county_data <- read_csv("cleaned_data/DDHQ_current_county_results.csv")

#This is code to get a nicely-labeled 
get_label <- function(NAME, Republican_name, Democratic_name, Republican_votes, Democratic_votes, 
                      Republican_votes_percent, Democratic_votes_percent, expected_pct_in) {
  paste0(
    '<div style="font-family: Arial, sans-serif; padding: 10px; background-color: #f4f4f4; border-radius: 6px; max-width: 300px;">',
    '<strong style="font-size: 16px; color: #333;">', NAME, '</strong><br>',
    '<table style="width: 100%; font-size: 12px; margin-top: 8px; border-collapse: collapse;">',
    '<tr style="background-color: #e2e2e2;">',
    '<th style="text-align:left; padding: 6px;">Candidate</th>',
    '<th style="padding: 6px;">Total</th>',
    '<th style="padding: 6px;">Pct.</th>',
    '</tr>',
    '<tr>',
    '<td style="border-left: 4px solid red; padding: 6px;">', Republican_name, '</td>',
    '<td style="text-align:right; padding: 6px;">', format(Republican_votes, big.mark = ","), '</td>',
    '<td style="text-align:right; padding: 6px;">', sprintf("%.1f", Republican_votes_percent), '%</td>',
    '</tr>',
    '<tr style="background-color: #f9f9f9;">',
    '<td style="border-left: 4px solid blue; padding: 6px;">', Democratic_name, '</td>',
    '<td style="text-align:right; padding: 6px;">', format(Democratic_votes, big.mark = ","), '</td>',
    '<td style="text-align:right; padding: 6px;">', sprintf("%.1f", Democratic_votes_percent), '%</td>',
    '</tr>',
    '</table>',
    '<p style="margin-top: 10px; font-size: 10px; color: #666;">', expected_pct_in, '% of estimated votes reported</p>',
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
    
    graph <- leaflet(geo_data) %>%
      addProviderTiles(providers$CartoDB.PositronNoLabels) %>%  # A blank tile layer
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
    
    
    
    graph <- leaflet(geo_data) %>%
      addProviderTiles(providers$CartoDB.PositronNoLabels) %>%  # A blank tile layer
      addPolygons(
        fillColor = ~pal(margin_pct),
        color = "black",
        popup = ~get_label(NAME, Republican_name, Democratic_name, Republican_votes, Democratic_votes, 
                          Republican_votes_percent, Democratic_votes_percent, expected_pct_in),         # Add the custom label content
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

    graph <- leaflet(geo_data_centroids) %>%
      addProviderTiles(providers$CartoDB.PositronNoLabels) %>%  # A blank tile layer
      addCircleMarkers(
        fillColor = ~pal(margin_votes), 
        color = "black",
        radius = ~ 25 * abs(margin_votes / max_votes),
        popup = ~get_label(NAME, Republican_name, Democratic_name, Republican_votes, Democratic_votes, 
                           Republican_votes_percent, Democratic_votes_percent, expected_pct_in),         # Add the custom label content
        label = ~lapply(get_label(NAME, Republican_name, Democratic_name, Republican_votes, Democratic_votes, 
                                  Republican_votes_percent, Democratic_votes_percent, expected_pct_in), htmltools::HTML),  # Convert HTML for the popup
        weight = 1,
        opacity = 1,
        fillOpacity = 0.7
      )
  }

  return (graph)
  
}

state <- "GA"
office_type_check <- "President"
map_version <- "margin_bubble"

#get_graph(state, office_type_check, map_version)
