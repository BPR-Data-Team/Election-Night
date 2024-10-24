@echo off
cd /d "%~dp0"

Rscript -e "if (!requireNamespace('renv', quietly = TRUE)) install.packages('renv'); renv::activate(); renv::hydrate()"

Rscript Dashboard.R