library(tidyverse)
library(leaflet)
library(leaflet.extras)
library(RColorBrewer)  # For color palettes
library(sf)
library(glue)
library(shinyWidgets)
library(bslib)

county_data <- read_csv("cleaned_data/Changing Data/DDHQ_current_county_results.csv", show_col_types = FALSE)

#---- COLOR BINS ------
# Define custom bins for swing values
bins <- c(-100, -30, -15, -10, -5, 0, 5, 10, 15, 30, 100)

# Define corresponding colors
colors <- colorRampPalette(c( "#B83C2B", "#ffffff", "#595D9A"))(length(bins) - 1)
pal <- colorBin(palette = colors, 
                bins = bins,
                domain = c(-100, 0, 100),
                na.color = "black")


# This is code to get a nicely-labeled hover box
get_label <- function(NAME, Republican_name, Democratic_name, Republican_votes, Democratic_votes, 
                      Republican_votes_percent, Democratic_votes_percent, pct_reporting) {
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
    pct_reporting, '% reported</div>',
    '</div>'
  )
}

get_label_votes_remaining <- function(NAME, total_votes_estimate, total_votes_lower, total_votes_upper, 
                                      margin_pct, margin_lower, margin_upper) {
  paste0(
    '<div style="font-family: Arial, sans-serif; padding: 6px; background-color: #f9f9f9; border-radius: 4px; max-width: 260px;">',
    '<strong style="font-size: 14px; color: #333;">', NAME, '</strong>',
    '<table style="width: 100%; font-size: 11px; margin-top: 4px;">',
    '<tr>',
    '<th style="text-align:left; padding: 4px;">Metric</th>',
    '<th style="text-align:right; padding: 4px;">Current</th>',
    '<th style="text-align:right; padding: 4px;">Predicted Interval</th>',
    '</tr>',
    '<tr>',
    '<td style="padding: 4px;">Turnout</td>',
    '<td style="text-align:right; padding: 4px;">', format(total_votes_estimate, big.mark = ","), '</td>',
    '<td style="text-align:right; padding: 4px;">', 
    format(total_votes_lower, big.mark = ","), ' - ', format(total_votes_upper, big.mark = ","), 
    '</td>',
    '</tr>',
    '<tr>',
    '<td style="padding: 4px;">Margin</td>',
    '<td style="text-align:right; padding: 4px;">', ifelse(margin_pct < 0, glue("R+{round(margin_pct, 1)}"), 
                                                           glue("D+{round(margin_pct, 1)}")), '</td>',
    '<td style="text-align:right; padding: 4px;">', 
    ifelse(margin_lower < 0, glue("R+{margin_lower}"), 
           glue("D+{margin_lower}")), ' - ', ifelse(margin_upper < 0, glue("R+{margin_upper}"), 
                                                    glue("D+{margin_upper}")), 
    '</td>',
    '</tr>',
    '</table>',
    '</div>'
  )
}

# Map makers 
get_margin_map <- function(BASEPATH, year, state_abbrev, office) {
  current_data <- county_data %>%
    filter(state == state_abbrev & office_type == office)
  
  geojson_link <- glue("{BASEPATH}/GeoJSON/County/2022/{state.name[match(state_abbrev, state.abb)]}_2022.geojson")
  
  geo_data <- st_read(geojson_link) %>% 
    left_join(current_data, by = c("COUNTYFP" = "fips"))
  
  if (year == 2024) {
    
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
                                  Republican_votes_percent, Democratic_votes_percent, pct_reporting), htmltools::HTML),  # Convert HTML for the popup
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
        
  } else if (year == 2020) {
    
    prev_total_votes <- round(100 * geo_data$margin_votes_1 / geo_data$margin_pct_1, 0)
    prev_dem_votes <- round((geo_data$margin_votes_1 + prev_total_votes) / 2, 0)
    prev_rep_votes <- round((prev_total_votes - geo_data$margin_votes_1) / 2, 0)
    prev_dem_pct <- 100 * prev_dem_votes / prev_total_votes
    prev_rep_pct <- 100 * prev_rep_votes / prev_total_votes
    
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
        fillColor = ~pal(margin_pct_1),
        color = "black",
        label = ~lapply(get_label(NAME, "Republican Candidate", "Democratic Candidate", prev_rep_votes, prev_dem_votes, 
                                  prev_rep_pct, prev_dem_pct, "100%"), htmltools::HTML),  # Convert HTML for the popup
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
    
  } else {
    stop("Invalid year for get_margin_map")
  }
  
  return(graph)
}

get_margin_bubble_map <- function(BASEPATH, year, state_abbrev, office) {
  current_data <- county_data %>%
    filter(state == state_abbrev & office_type == office)
  
  geojson_link <- glue("{BASEPATH}/GeoJSON/County/2022/{state.name[match(state_abbrev, state.abb)]}_2022.geojson")
  
  geo_data <- st_read(geojson_link) %>%
    left_join(current_data, by = c("COUNTYFP" = "fips"))
  
  geo_data_centroids <- st_centroid(geo_data)

  if (year == 2024) {
    
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
                                  Republican_votes_percent, Democratic_votes_percent, pct_reporting), htmltools::HTML),  # Convert HTML for the popup
      )
    
  } else if (year == 2020) {
    
    max_votes <- max(abs(geo_data_centroids$margin_votes_1))
    
    prev_total_votes <- round(100 * geo_data$margin_votes_1 / geo_data$margin_pct_1, 0)
    prev_dem_votes <- round((geo_data$margin_votes_1 + prev_total_votes) / 2, 0)
    prev_rep_votes <- round((prev_total_votes - geo_data$margin_votes_1) / 2, 0)
    prev_dem_pct <- prev_dem_votes / prev_total_votes
    prev_rep_pct <- prev_rep_votes / prev_total_votes
    
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
        fillColor = ~pal(margin_votes_1), 
        color = "black",
        radius = ~ 25 * abs(margin_votes_1 / max_votes),
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
        label = ~lapply(get_label(NAME, "Republican Candidate", "Democratic Candidate", prev_rep_votes, prev_dem_votes, 
                                  prev_rep_pct, prev_dem_pct, "100%"), htmltools::HTML),  # Convert HTML for the popup
      )
    
  } else {
    warning("Invalid year for get_margin_bubble_map")
  }
    
  return(graph)
  }
 
get_votes_left_map <- function(BASEPATH, state_abbrev, office) {
  current_data <- county_data %>%
    filter(state == state_abbrev & office_type == office)
  
  geojson_link <- glue("{BASEPATH}/GeoJSON/County/2022/{state.name[match(state_abbrev, state.abb)]}_2022.geojson")
  
  geo_data <- st_read(geojson_link) %>%
    left_join(current_data, by = c("COUNTYFP" = "fips"))
  
  geo_data_centroids <- st_centroid(geo_data)

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
      radius = ~ ifelse(votes_remaining <= 0, 0, sqrt(votes_remaining) / 10),
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
      label = ~lapply(get_label_votes_remaining(NAME, total_votes, total_votes_lower, total_votes_upper, 
                                                margin_pct, margin_lower, margin_upper), htmltools::HTML),  # Convert HTML for the popup
    )
  
  return (graph)
}

get_swing_map <- function(BASEPATH, state_abbrev, office_1, office_2, year_1, year_2) {
  
  state_county_data <- county_data %>% filter(state == state_abbrev)
  
  #Data from the first (reference map)
  data_1 <- state_county_data %>% 
    filter(office_type == office_1) %>%
    mutate(margin_1 = case_when(
      year_1 == 2024 ~ margin_pct, 
      year_1 %in% c(2020, 2018) ~ margin_pct_1, 
      year_1 %in% c(2016, 2012) ~ margin_pct_2
    )) %>%
    select(fips, margin_1)
  
  #Data from the first (comparison map)
  data_2 <- state_county_data %>% 
    filter(office_type == office_2) %>%
    mutate(margin_2 = case_when(
      year_2 == 2024 ~ margin_pct, 
      year_2 %in% c(2020, 2018) ~ margin_pct_1, 
      year_2 %in% c(2016, 2012) ~ margin_pct_2
    )) %>%
    select(fips, margin_2)
  
  if (nrow(data_1) == 0) {
    stop("Office and Year For #1 not found")
  }
  
  if (nrow(data_2) == 0) {
    stop("Office and Year For #2 not found")
  }
  
  full_data <- full_join(data_1, data_2, by = 'fips') %>%
    mutate(swing = margin_1 - margin_2)

  geojson_link <- glue("{BASEPATH}/GeoJSON/County/2022/{state.name[match(state_abbrev, state.abb)]}_2022.geojson")
  
  geo_data <- st_read(geojson_link) %>%
    left_join(full_data, by = c("COUNTYFP" = "fips"))
  
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
  return(graph)
}

