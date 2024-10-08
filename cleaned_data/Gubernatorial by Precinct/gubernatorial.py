import polars as pl 
import csv

years = [2016, 2018, 2020]
input_file = 'Raw data\\Gubernatorial\\raw data.csv'

year_list = []
fips_list = []
county_list = []
state_list = []
dem_votes_list = []
gop_votes_list = []
total_votes_list = []
dem_nominee_list = []
gop_nominee_list = []

with open(input_file, 'r', encoding='utf-8') as f_in:
    reader = csv.reader(f_in)
    next(reader)
    for row in reader:
        year = int(row[1])

        if year < 2010:
            continue

        fips = row[2]
        county = row[3].title()
        state = row[4]
        dem_votes = int(row[9]) if row[9] != 'NA' else 0
        gop_votes = int(row[12]) if row[12] != 'NA' else 0
        total_votes = int(row[16]) if row[16] != 'NA' else 0

        year_list.append(year)
        fips_list.append(fips)
        county_list.append(county)
        state_list.append(state)
        dem_votes_list.append(dem_votes)
        gop_votes_list.append(gop_votes)
        total_votes_list.append(total_votes)


df = pl.DataFrame({'year': year_list, 
                   'fips': fips_list, 
                   'county': county_list, 
                   'state': state_list, 
                   'dem_votes': dem_votes_list, 
                   'gop_votes': gop_votes_list, 
                   'total_votes': total_votes_list},
            schema={'year': pl.Int32, 
                    'fips': pl.Utf8, 
                    'county': pl.Utf8, 
                    'state': pl.Utf8, 
                    'dem_votes': pl.Int32, 
                    'gop_votes': pl.Int32, 
                    'total_votes': pl.Int32})

for year in years:
    print(f'Processing {year}')
    output_file = f'Gubernatorial by Precinct\\{year} Gubernatorial.csv'

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

        year_data = df.filter(pl.col('year') == year)

        if len(year_data) == 0:
            print(f"No data for {year}")
            continue

        for row in year_data.iter_rows(named=True):
            year = row['year']
            fips = row['fips']
            county = row['county']
            state = row['state']
            dem_votes = row['dem_votes']
            gop_votes = row['gop_votes']
            total_votes = row['total_votes']

            if total_votes == 0:
                if dem_votes == 0 and gop_votes == 0:
                    dem_vote_share = 0
                    gop_vote_share = 0
                else:
                    total_votes = dem_votes + gop_votes
            else:
                dem_vote_share = round(dem_votes / total_votes * 100, 1)
                gop_vote_share = round(gop_votes / total_votes * 100, 1)
                
            margin_votes = (dem_votes - gop_votes)
            margin_percent = round(dem_vote_share - gop_vote_share, 1)

            writer.writerow([
                '',
                '',
                year,
                'Governor',
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
                '',
                '',
                dem_vote_share, 
                gop_vote_share,
                '',
                '',
                margin_votes,
                margin_percent,
                '',
                ''])
    