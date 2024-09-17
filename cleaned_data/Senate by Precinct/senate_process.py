import polars as pl 
import csv

years = [2016, 2018, 2020, 2022]

for year in years:
    print(f"Processing {year} data")
    input_file = f'Senate by Precinct\\Raw Data\\{year} Senate Raw.csv'
    output_file = f'Senate by Precinct\\{year} Senate.csv'
    
    # ---------------------------------- #
    # Load the data
    # ---------------------------------- #

    states = []
    counties = []
    parties = []
    modes = []
    votes = []

    state_index = 0
    county_index = 0
    party_index = 0
    mode_index = 0
    votes_index = 0

    if year == 2016: 
        state_index = 3
        county_index = 7
        party_index = 19
        mode_index = 20
        votes_index = 21
    elif year == 2018:
        state_index = 16
        county_index = 6
        party_index = 3
        mode_index = 4
        votes_index = 5
    elif year == 2020:
        state_index = 16
        county_index = 6
        party_index = 3
        mode_index = 4
        votes_index = 5
    elif year == 2022:
        state_index = 2
        county_index = 7
        party_index = 12
        mode_index = 4
        votes_index = 14
    else: 
        raise ValueError("Invalid year")

    #Clean data
    with open(input_file, 'r') as f_in:
        reader = csv.reader(f_in)
        next(reader)
        for row in reader:
            states.append(row[state_index].strip('"').title())
            counties.append(row[county_index].strip('"').title())
            parties.append(row[party_index].strip('"').title())
            modes.append(row[mode_index].strip('"').title())
            votes.append(int(float(row[votes_index])))
            
    data = pl.DataFrame({'state': states, 'county': counties, 'party': parties, 'mode': modes, 'votes': votes},
                        {'state': pl.Utf8, 'county': pl.Utf8, 'party': pl.Utf8, 'mode': pl.Utf8, 'votes': pl.Int32})

    # ---------------------------------- #
    # Aggregate by county
    # ---------------------------------- #

    #This list taken from voting modes in the data
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
            'state', 
            'county', 
            'total_votes', 
            'dem_votes', 
            'gop_votes', 
            'winner', 
            'margin', 
            'dem_vote_share', 
            'gop_vote_share', 
            'absentee_votes', 
            'absentee_vote_share', 
            'dem_absentee_votes', 
            'gop_absentee_votes', 
            'absentee_winner',
            'dem_absentee_vote_share',
            'gop_absentee_vote_share'])
        
        for state in data['state'].unique().to_list():
            state_level_data = data.filter(pl.col('state') == state)
            
            for county in state_level_data['county'].unique().to_list():
                county_level_data = state_level_data.filter(pl.col('county') == county) 

                total_votes = county_level_data['votes'].sum()
                dem_votes = county_level_data.filter((pl.col('party') == 'Democratic') | (pl.col('party') == 'Democrat'))['votes'].sum()
                gop_votes = county_level_data.filter(pl.col('party') == 'Republican')['votes'].sum()
                dem_vote_share = round(dem_votes / total_votes * 100, 1)
                gop_vote_share = round(gop_votes / total_votes * 100, 1)

                winner = "Democrat" if dem_votes > gop_votes else "Republican"
                margin = round(abs(dem_vote_share - gop_vote_share), 1)

                absentee_vote_records = county_level_data.filter(~pl.col('mode').is_in(election_day_modes))
                absentee_votes = absentee_vote_records['votes'].sum()
                absentee_vote_share = round(absentee_votes / total_votes * 100, 1)

                dem_absentee_votes = absentee_vote_records.filter(pl.col('party') == 'Democratic')['votes'].sum()
                gop_absentee_votes = absentee_vote_records.filter(pl.col('party') == 'Republican')['votes'].sum()
                absentee_winner = "Democrat" if dem_absentee_votes > gop_absentee_votes else "Republican"
                
                #Check division by zero
                if absentee_votes == 0:
                    dem_absentee_vote_share = 0
                    gop_absentee_vote_share = 0
                else:
                    dem_absentee_vote_share = round(dem_absentee_votes / absentee_votes * 100, 1)
                    gop_absentee_vote_share = round(gop_absentee_votes / absentee_votes * 100, 1)

                writer.writerow([
                    state, 
                    county, 
                    total_votes, 
                    dem_votes, 
                    gop_votes, 
                    winner, 
                    margin, 
                    dem_vote_share, 
                    gop_vote_share, 
                    absentee_votes, 
                    absentee_vote_share, 
                    dem_absentee_votes, 
                    gop_absentee_votes, 
                    absentee_winner,
                    dem_absentee_vote_share,
                    gop_absentee_vote_share])
        

            




