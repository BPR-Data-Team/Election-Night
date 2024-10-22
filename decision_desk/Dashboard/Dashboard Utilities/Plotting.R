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

state <- "CA"
office_type_check <- "House"
map_version <- "margin_bubble"

get_graph(state, office_type_check, map_version)


# Load necessary libraries
library(ggplot2)
library(dplyr)
library(sf)
library(glue)
library(leaflet)

# Load house data from CSV
house_data <- read.csv("data/HouseHistory.csv")

# Map state abbreviations to full state names
state_abbrev_to_name <- c(
  "AL" = "Alabama", "AK" = "Alaska", "AZ" = "Arizona", "AR" = "Arkansas", "CA" = "California",
  "CO" = "Colorado", "CT" = "Connecticut", "DE" = "Delaware", "FL" = "Florida", "GA" = "Georgia",
  "HI" = "Hawaii", "ID" = "Idaho", "IL" = "Illinois", "IN" = "Indiana", "IA" = "Iowa",
  "KS" = "Kansas", "KY" = "Kentucky", "LA" = "Louisiana", "ME" = "Maine", "MD" = "Maryland",
  "MA" = "Massachusetts", "MI" = "Michigan", "MN" = "Minnesota", "MS" = "Mississippi", 
  "MO" = "Missouri", "MT" = "Montana", "NE" = "Nebraska", "NV" = "Nevada", "NH" = "New Hampshire",
  "NJ" = "New Jersey", "NM" = "New Mexico", "NY" = "New York", "NC" = "North Carolina", 
  "ND" = "North Dakota", "OH" = "Ohio", "OK" = "Oklahoma", "OR" = "Oregon", "PA" = "Pennsylvania",
  "RI" = "Rhode Island", "SC" = "South Carolina", "SD" = "South Dakota", "TN" = "Tennessee", 
  "TX" = "Texas", "UT" = "Utah", "VT" = "Vermont", "VA" = "Virginia", "WA" = "Washington",
  "WV" = "West Virginia", "WI" = "Wisconsin", "WY" = "Wyoming"
)

# Function to filter house data by state and year
get_house_data <- function(state_abbrev, year) {
  filtered_data <- house_data %>%
    filter(state_po == state_abbrev & year == year)
  return(filtered_data)
}

# Function to load the GeoJSON file for the given year and state
load_geojson <- function(state_abbrev, year) {
  # Get the full state name from the abbreviation
  state_name <- state_abbrev_to_name[state_abbrev]
  
  # Construct the file path using the full state name and year
  geojson_path <- glue("GeoJSON/County in Congressional District/{year}/{state_name}_{year}.geojson")
  
  # Load the GeoJSON file
  geo_data <- st_read(geojson_path)
  
  # Reproject to WGS84 (if necessary)
  geo_data <- st_transform(geo_data, crs = 4326)
  
  return(geo_data)
}

# Function to calculate vote margin correctly
calculate_margin <- function(data) {
  data %>%
    group_by(state_po, district) %>%
    filter(party %in% c("DEMOCRAT", "REPUBLICAN")) %>%  
    summarise(
      dem_votes = sum(candidatevotes[party == "DEMOCRAT"], na.rm = TRUE),
      rep_votes = sum(candidatevotes[party == "REPUBLICAN"], na.rm = TRUE),
      total_votes = max(totalvotes, na.rm = TRUE),  # Use max or unique for total votes
      margin_votes = rep_votes - dem_votes,
      margin_pct = (margin_votes / total_votes) * 100
    )
}

# Function to plot house data for a selected state and year using leaflet
plot_house_data_leaflet <- function(state_abbrev, year) {
  filtered_house_data <- get_house_data(state_abbrev, year)
  
  # Calculate margin for each district
  margin_data <- calculate_margin(filtered_house_data)
  
  # Load the corresponding GeoJSON file for the selected year and state
  geo_data <- load_geojson(state_abbrev, year)
  
  # Convert CD116FP in the GeoJSON to integer
  geo_data$CD116FP <- as.integer(geo_data$CD116FP)
  
  # Now perform the join using the converted column
  merged_data <- geo_data %>%
    left_join(margin_data, by = c("CD116FP" = "district"))  # Match district codes
  
  # Define color palette: red for Republicans, blue for Democrats
  color_pal <- colorFactor(c("blue", "red"), domain = c("DEMOCRAT", "REPUBLICAN"))
  
  # Create the leaflet map with margin percentage and votes in popup
  leaflet(data = merged_data) %>%
    addTiles() %>%
    addPolygons(
      fillColor = ~color_pal(ifelse(margin_votes > 0, "REPUBLICAN", "DEMOCRAT")),
      color = "white",
      weight = 1,
      popup = ~paste0(
        "District: ", CD116FP, "<br>",
        "Margin Votes: ", format(margin_votes, big.mark = ","), "<br>",
        "Margin %: ", round(margin_pct, 2), "%"
      )
    ) %>%
    addLegend(
      pal = color_pal,
      values = c("DEMOCRAT", "REPUBLICAN"),
      title = "Winning Party"
    )
}

# Example usage to plot House results for Alabama in 2020 with year-specific delimitations
plot_house_data_leaflet("AL", 2020)
