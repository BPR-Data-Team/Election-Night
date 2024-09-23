########################################

SOURCES

Data from MIT Election Data + Science Lab

2016: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/NLTQAD
2018: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/DGNAFS
2020: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/ER9XTV 
2022: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/YB60EJ

########################################

RESULTS

Preliminary validation (testing.py and 'testing results.png') suggest that the data is reasonably accurate in terms of total votes and vote allocation by party. The absentee/early/mail-in vote results are very poor. The reason for this discrepancy is unclear but likely related to the way that voting 'mode' is reported inconsistently across counties. 

########################################

CODEBOOK

The files '2016 Senate.csv', '2018 Senate.csv', '2020 Senate.csv', and '2022 Senate.csv' contain aggregated county-level election results for the U.S. Senate. 

'test_data' - empty column used for standardization with DDHQ data
'ddhq_id' - empty column used for standardization with DDHQ data
'year' - 2016, 2018, 2020, or 2022
'office_type' - Senate
'state' - two letter abbreviation for state
'county' - county name
'district' - column of 0s for Senate to standardize with house data
'fips' - 5 digit FIPS code
'x_name' - empty list for standardization with DDHQ data
'percent_precincts_reporting' - 100 for all counties to reflect past election results
'x_votes' - list [dem_votes, gop_votes]
'x_votes_percent' - list [dem_percent, gop_percent] calculated as (100 * x_votes / total_votes) 
'margin_votes' - calculated as (dem_votes - gop_votes)
'margin_percent' - calculated as (dem_percent - gop_percent)
'absentee_percent' - calculated as (100 * absentee_votes / total_votes) 
'absentee_margin' - calculated as (absentee_dem_votes - absentee_gop_votes)