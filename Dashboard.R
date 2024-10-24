library(shiny)

cat(getwd())

source("./decision_desk/Dashboard/ui.R", local = TRUE)
source("./decision_desk/Dashboard/server.R", local = TRUE)

shinyApp(ui, server)
