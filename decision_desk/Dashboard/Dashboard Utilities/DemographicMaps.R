library(tidyverse)
library(leaflet)
library(leaflet.extras)
library(RColorBrewer)  # For color palettes
library(sf)
library(glue)

county_data <- read_csv("cleaned_data/Changing Data/DDHQ_current_county_results.csv")

transfer_names <- read_csv("cleaned_data/Locally-Hosted Data/Demographic_Names_Transfer") 

demographic_data <- read_csv("cleaned_data/Locally-Hosted Data/CountyDems2022.csv") %>%
  mutate(fips = str_sub(Geography, start = -3))

state_abbrev <- "AZ"

county_dems_data <- demographic_data %>%
  filter(state == state_abbrev)

geojson_link <- glue("{BASEPATH}/GeoJSON/County/2022/{state.name[match(state_abbrev, state.abb)]}_2022.geojson")

geo_data <- st_read(geojson_link) %>%
  left_join(county_dems_data, by = c("COUNTYFP" = "fips"))

colname <- "proportion_hispanic_latino"

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
    label = ~glue("{NAME}: {100 * round(get(colname), 3)}%")
  ) %>%
  addLegend(
    pal = pal,
    values = c(0, 1),
    position = "bottomright",
    title = glue("Proportion {colname}"),
    labFormat = labelFormat(suffix = "%", transform = function(x) x * 100)
  )
