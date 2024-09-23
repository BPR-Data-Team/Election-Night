import json 
import csv
import polars as pl

input_file = 'Senate by Precinct\\Raw Data\\nyt_senate_2012.json'
output_file = 'Senate by Precinct\\2012 Senate.csv'

fips_dict = pl.read_csv('FIPS References\county_fips.csv')

scraped_data = []
with open(input_file, 'r') as f_in:
    data = json.load(f_in)

    for state_name in data:
        state = data[state_name]
        candidates = state['candidates']

        gop_votes_field = ''
        dem_votes_field = ''

        for candidate in candidates:
            if (candidate['party'] == 'REP'): 
                gop_votes_field = candidate['votes_field']

            if (candidate['party'] == 'DEM'):
                dem_votes_field = candidate['votes_field']

        gop_votes = state['county_votes'][gop_votes_field] if gop_votes_field else 0
        dem_votes = state['county_votes'][dem_votes_field] if dem_votes_field else 0
        total_votes = state['county_votes']['total_votes']
        counties =  state['county_votes']['location_fips']

        county_records = zip(counties, total_votes, gop_votes, dem_votes)

        for row in county_records:
            scraped_data.append([state_name] + list(row))
            
df = pl.DataFrame(scraped_data, schema=['state', 'fips', 'total_votes', 'gop_votes', 'dem_votes'])

with open(output_file, 'w+', newline='', encoding='utf-8') as f_out:
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
        'x_name',
        'percent_precincts_reporting',
        'x_votes',
        'x_votes_percent', 
        'margin_votes',
        'margin_percent',
        'absentee_percent',
        'absentee_margin'])
    
    for state in df['state'].unique().to_list():
        counties = df.filter(pl.col('state') == state)

        for county in counties.iter_rows(named=True):
            fips = county['fips']
            county_name = fips_dict.filter(pl.col('fips') == int(fips))['county_name'].to_list()[0]

            total_votes = county['total_votes']
            dem_votes = county['dem_votes']
            gop_votes = county['gop_votes']

            dem_votes_percent = round(dem_votes / total_votes * 100, 1)
            gop_votes_percent = round(gop_votes / total_votes * 100, 1)

            margin = round(dem_votes - gop_votes, 1)
            margin_percent = round(dem_votes_percent - gop_votes_percent, 1)

            writer.writerow([
                '',
                '',
                2012,
                'Senate',
                state,
                county_name,
                0,
                fips,
                [],
                100,
                [dem_votes, gop_votes],
                [dem_votes_percent, gop_votes_percent],
                margin,
                margin_percent,
                '',
                ''
            ])

            

