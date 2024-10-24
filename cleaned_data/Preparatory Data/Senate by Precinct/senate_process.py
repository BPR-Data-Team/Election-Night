import polars as pl 
import csv

years = [2012, 2016, 2018, 2020, 2022]

fips_dict = []
with open('FIPS References\\county_fips.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for row in reader:
        fips_dict.append(row)

county_fips_lookup = pl.DataFrame({'state': [row[1] for row in fips_dict], 'county': [row[2] for row in fips_dict], 'fips': [row[0] for row in fips_dict]},
                                {'state': pl.Utf8, 'county': pl.Utf8, 'fips': pl.Utf8})
                                  

for year in years:
    print(f"Processing {year} data")
    input_file = f'Raw data\\Senate\\{year} Senate Raw.csv'
    output_file = f'Senate by Precinct\\{year} Senate.csv'
    
    # ---------------------------------- #
    # Load the data
    # ---------------------------------- #

    state_index = 0
    county_index = 0
    party_index = 0
    mode_index = 0
    votes_index = 0

    if year == 2016: 
        county_index = 7
        state_index = 4
        fips_index = 8
        party_index = 19
        mode_index = 20
        votes_index = 21
    elif year == 2018:
        county_index = 6
        state_index = 19
        fips_index = 7
        party_index = 3
        mode_index = 4
        votes_index = 5
    elif year == 2020:
        county_index = 6
        state_index = 19
        fips_index = 7
        party_index = 3
        mode_index = 4
        votes_index = 5
    elif year == 2022:
        state_index = 3
        county_index = 7
        fips_index = 8
        party_index = 12
        mode_index = 4
        votes_index = 14
    else: 
        raise ValueError("Invalid year")

    states_list = []
    counties_list = []
    fips_list = []
    parties_list = []
    modes_list = []
    votes_list = []

    #Clean data
    with open(input_file, 'r') as f_in:
        reader = csv.reader(f_in)
        next(reader)
        for row in reader:
            state = row[state_index].strip('"').upper()
            county = row[county_index].strip('"').title()
            party = row[party_index].strip('"').title()
            mode = row[mode_index].strip('"').title()
            votes = int(float(row[votes_index]))

            try:
                fips = str(int(float(row[fips_index])))
                fips = fips if len(fips) == 5 else f"0{fips}"
            except:
                if county == '': #Handles Alaska
                    fips = ''
                else:
                    fips = county_fips_lookup.filter(pl.col('county_name') == county)['fips'].mode().to_list()[0]
                
           
            states_list.append(state)
            counties_list.append(county)
            fips_list.append(fips)
            parties_list.append(party)
            modes_list.append(mode)
            votes_list.append(votes)
            
    data = pl.DataFrame({'state': states_list, 'county': counties_list, 'fips': fips_list, 'party': parties_list, 'mode': modes_list, 'votes': votes_list},
                        {'state': pl.Utf8, 'county': pl.Utf8, 'fips': pl.Utf8, 'party': pl.Utf8, 'mode': pl.Utf8, 'votes': pl.Int32})

    # ---------------------------------- #
    # Aggregate by county
    # ---------------------------------- #

    #This list taken from voting modes in the data and categorized by hand
    election_day_modes = pl.Series(['P', 
        'Prov', 
        'Provisional Votes', 
        'Machine', 
        'One Stop', 
        'Failsafe Provisional',
        'Total',
        'Election',
        'Polling Place Votes DS200',
        'Polling Place Votes', 
        'A', 
        'Election Day Paper', 
        'C', 
        'Central Count', 
        'Provisional',
        'Polling',
        'In Person', 
        'Election Day',
        'Conditional Provisional Votes',
        ''])

    with open(output_file, 'w+', newline='') as f_out:
        writer = csv.writer(f_out)
        writer.writerow([
           'test_data',
            'ddhq_id',
            'year',
            'office_type',
            'state', 
            'county', 
            'district',
            'fips',
            'dem_name',
            'rep_name', 
            'ind_name', 
            'green_name',
            'percent_precincts_reporting',
            'dem_votes',
            'rep_votes', 
            'ind_votes', 
            'green_votes',
            'dem_votes_percent',
            'rep_votes_percent', 
            'ind_votes_percent', 
            'green_votes_percent',
            'margin_votes',
            'margin_percent',
            'absentee_percent',
            'absentee_margin'])
        
        for state in data['state'].unique().to_list():
            state_level_data = data.filter(pl.col('state') == state)
            
            for county in state_level_data['county'].unique().to_list():
                county_level_data = state_level_data.filter(pl.col('county') == county) 

                total_votes = county_level_data['votes'].sum()
                dem_votes = county_level_data.filter((pl.col('party') == 'Democratic') | (pl.col('party') == 'Democrat'))['votes'].sum()
                gop_votes = county_level_data.filter(pl.col('party') == 'Republican')['votes'].sum()
                other_votes = total_votes - dem_votes - gop_votes

                dem_vote_share = round(dem_votes / total_votes * 100, 1)
                gop_vote_share = round(gop_votes / total_votes * 100, 1)
                other_vote_share = round(other_votes / total_votes * 100, 1)

                winner = "Democrat" if dem_votes > gop_votes else "Republican"
                margin_votes = (dem_votes - gop_votes)
                margin_percent = round(dem_vote_share - gop_vote_share, 1)

                absentee_vote_records = county_level_data.filter(~pl.col('mode').is_in(election_day_modes))
                absentee_votes = absentee_vote_records['votes'].sum()
                absentee_percent = round(absentee_votes / total_votes * 100, 1)

                dem_absentee_votes = absentee_vote_records.filter(pl.col('party') == 'Democratic')['votes'].sum()
                gop_absentee_votes = absentee_vote_records.filter(pl.col('party') == 'Republican')['votes'].sum()
                absentee_margin = round((dem_absentee_votes - gop_absentee_votes)/absentee_votes, 1) if absentee_votes > 0 else 0

                fips = county_level_data['fips'].mode().to_list()[0]

                writer.writerow([
                    '',
                    '',
                    year,
                    'Senate',
                    state, 
                    county, 
                    0,
                    fips,
                    '',
                    '',
                    '',
                    '',
                    100,
                    dem_votes, 
                    gop_votes, 
                    other_votes,
                    '',
                    dem_vote_share, 
                    gop_vote_share, 
                    other_vote_share,
                    '',
                    margin_votes,
                    margin_percent,
                    absentee_percent,
                    absentee_margin])