
Dashboard.R is the main RShiny App that runs the dashboard. It needs to be run in the Election-Night working directory. 

It uses the following datasets:
* cleaned_data/DDHQ_test_data_county.csv
* cleaned_data/historical_elections.csv
* cleaned_data/FIPS References/county_fips.csv
* cleaned_data/ElectoralVotes.csv

And sources the utilities:
* decision_desk/dashboard/Dashboard Utilities/Plotting.R
* decision_desk/dashboard/Dashboard Utilities/TimeToNextPoll.R
* decision_desk/dashboard/Dashboard Utilities/DemographicTable.R
* decision_desk/dashboard/Dashboard Utilities/BettingOdds.R
* decision_desk/dashboard/Dashboard Utilities/Margins.R