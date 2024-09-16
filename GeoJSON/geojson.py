import csv 
import geopandas as gpd
import os

sources = ['Congressional District', 'County']

# Load the state FIPS codes
fips_dict = {}
with open('state_fips.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        code, name = row
        fips_dict[code] = name

for source in sources:
    print(f'Processing: {source}')

    for year in [2016, 2018, 2020, 2022]:
        print(year)

        # Make the directory for the year
        os.makedirs(f'GeoJSON\\{source}\\{year}', exist_ok=True)

        # Process the shapefile 
        national_map = gpd.read_file(f'GeoJSON\\{source}\\Raw Data\\{year}\\{year} {source}.shp')

        for state in national_map['STATEFP'].unique(): 
            state_record = national_map[national_map['STATEFP'] == str(state)]
            
            state_name = fips_dict[str(state).lstrip('0')]
        
            state_record.to_file(f'GeoJSON\\{source}\\{year}\\{state_name}_{year}.geojson', driver='GeoJSON')