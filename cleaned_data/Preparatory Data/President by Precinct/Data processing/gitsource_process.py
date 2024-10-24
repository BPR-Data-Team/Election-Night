# ---------------------------------- #
# Used to process Presidential Returns by County for 2016 and 2018 
# Source: https://github.com/tonmcg/US_County_Level_Election_Results_08-20/tree/master
# Author: @mcapoor
# Last updated: 2024-09-12

# Input: year (2016 or 2020), '2016 git raw.csv' or '2020 git raw.csv'
# Output: '2016 git data.csv' or '2020 git data.csv' 
# ---------------------------------- #

import csv 
import pandas as pd

year = 2020 # 2016 or 2020
input_file = f'{year} git raw.csv'
output_file = f'{year} git data.csv'

# ---------------------------------- #
# Clean up raw data
# ---------------------------------- #
data = pd.DataFrame(columns=['state', 
                            'county', 
                            'winner',
                            'margin', 
                            'total_votes',
                            'democrat_votes', 
                            'republican_votes', 
                            'democrat_vote_share', 
                            'republican_vote_share', 
                            'fips'])

with open(input_file, 'r') as f_in:
    in_file = csv.reader(f_in)
    header = next(in_file)
    
    for row in in_file:
        
        dem_votes = int(float(row[4])) if year == 2020 else int(float(row[1])) 
        gop_votes = int(float(row[3])) if year == 2020 else int(float(row[2]))
        total_votes = int(float(row[5])) if year == 2020 else int(float(row[3])) 
        dem_share = round(dem_votes/total_votes*100, 1)
        gop_share = round(gop_votes/total_votes*100, 1)
        winner = "Democrat" if dem_share > gop_share else "Republican"
        margin = round(abs(dem_share - gop_share), 1)
        state = row[0] if year == 2020 else row[8] 
        county = row[2] if year == 2020 else row[9]
        fips = row[1] if year == 2020 else row[10]
        
        data = pd.concat([data, pd.DataFrame(
            ({'state': state, 
            'county': county,
            'winner': winner,
            'margin': margin, 
            'total_votes': total_votes, 
            'democrat_votes': dem_votes, 
            'republican_votes': gop_votes, 
            'democrat_vote_share': dem_share,
            'republican_vote_share': gop_share, 
            'fips': fips}), index=[0])])

# ---------------------------------- #
# Select and aggregate data
# ---------------------------------- #

final_data = pd.DataFrame(columns=['state', 
                        'county', 
                        'winner',
                        'margin', 
                        'total_votes',
                        'democrat_votes', 
                        'republican_votes', 
                        'democrat_vote_share', 
                        'republican_vote_share', 
                        'fips'])

for state in data['state'].unique():
    print(state)
    state_data = data.loc[data['state']==state]
    for county in state_data['county'].unique():
        county_data = state_data.loc[state_data['county']==county]
        
        dem_votes = county_data['democrat_votes'].sum()
        gop_votes = county_data['republican_votes'].sum()
        total_votes = county_data['total_votes'].sum()
        dem_share = round(dem_votes/total_votes*100, 1)
        gop_share = round(gop_votes/total_votes*100, 1)
        winner = "Democrat" if dem_share > gop_share else "Republican"
        margin = round(abs(dem_share - gop_share), 1)
        fips = county_data['fips'].values[0]
        
        final_data = pd.concat([final_data, pd.DataFrame(
            ({'state': state, 
            'county': county,
            'winner': winner,
            'margin': margin, 
            'total_votes': total_votes, 
            'democrat_votes': dem_votes, 
            'republican_votes': gop_votes, 
            'democrat_vote_share': dem_share,
            'republican_vote_share': gop_share, 
            'fips': fips}), index=[0])])
        
final_data.to_csv(output_file, index=False)