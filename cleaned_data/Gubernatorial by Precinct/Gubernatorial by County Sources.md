SOURCES

Data for 2012-2020 from:

Algara, Carlos; Sharif Amlani, 2021, "Replication Data for: Partisanship & Nationalization in American Elections: Evidence from Presidential, Senatorial, & Gubernatorial Elections in the U.S. Counties, 1872-2020", https://doi.org/10.7910/DVN/DGUMFI, Harvard Dataverse, V1, UNF:6:glfQoiLzpXDGTfErebfBIQ== [fileUNF]


'True' margins (dem percent - gop percent) across state from:

2012: https://en.wikipedia.org/wiki/2012_United_States_gubernatorial_elections

2016: https://en.wikipedia.org/wiki/2016_United_States_gubernatorial_elections

2018: https://en.wikipedia.org/wiki/2018_United_States_gubernatorial_elections

2020: https://en.wikipedia.org/wiki/2020_United_States_gubernatorial_elections

----------------------------------------------------------------------------------------------------------------

TESTING RESULTS 

2016 Gubernatorial Elections

![image](https://github.com/user-attachments/assets/37fcd4b8-022d-4879-a490-50838c7622d3)


2018 Gubernatorial Election

![image](https://github.com/user-attachments/assets/b0fc0366-805c-413b-945c-e8498d24da0f)

![image](https://github.com/user-attachments/assets/d1cad1c1-60da-47a8-ba0e-424977b36a16)


2020 Gubernatorial Election

![image](https://github.com/user-attachments/assets/8def9081-7153-423c-8537-7c1539e4dbf8)


----------------------------------------------------------------------------------------------------------------

CODEBOOK

The files '2012 Gubernatorial.csv', '2016 Gubernatorial.csv', '2018 Gubernatorial.csv', and '2020 Gubernatorial.csv' contain aggregated county-level election results for each gubernatorial elections.  

All of the files share the following columns:

- 'test_data' - empty column used for standardization with DDHQ data
- 'ddhq_id' - empty column used for standardization with DDHQ data
- 'year' - 2016, 2018, 2020, or 2022
- 'office_type' - Senate
- 'state' - two letter abbreviation for state
- 'county' - county name
- 'district' - column of 0s for Senate to standardize with house data
- 'fips' - 5 digit FIPS code
- 'x_name' - empty list for standardization with DDHQ data
- 'percent_precincts_reporting' - 100 for all counties to reflect past election results
- 'x_votes' - list [dem_votes, gop_votes]
- 'x_votes_percent' - list [dem_percent, gop_percent] calculated as (100 * x_votes / total_votes) 
- 'margin_votes' - calculated as (dem_votes - gop_votes)
- 'margin_percent' - calculated as (dem_percent - gop_percent)
- 'absentee_percent' - calculated as (100 * absentee_votes / total_votes) 
- 'absentee_margin' - calculated as (absentee_dem_votes - absentee_gop_votes)
