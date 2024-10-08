import polars as pl
from prettytable import PrettyTable

years = [2016, 2018, 2020]

true_margins = pl.read_csv('Gubernatorial by Precinct\\Raw Data\\true results.csv')

for year in years:
    df = pl.read_csv(f'Gubernatorial by Precinct\\{year} Gubernatorial.csv')
    
    states = []
    turnout = []
    margins = []
    true_results = []
    errors = []

    for state in df['state'].unique().to_list():
        state_df = df.filter(pl.col('state') == state)
        
        dem_votes = sum([int(x.strip('[]').split(', ')[0]) for x in state_df['x_votes']])
        gop_votes = sum([int(x.strip('[]').split(', ')[1]) for x in state_df['x_votes']])
        
        total_votes = dem_votes + gop_votes

        margin = round(100 * (dem_votes - gop_votes)/total_votes, 1)
        true_margin = float(true_margins.filter(pl.col('year') == year).filter(pl.col('state') == state)['margin'].to_list()[0])
        error = round(100 * (margin - true_margin)/true_margin, 1)

        states.append(state)
        turnout.append(total_votes)
        margins.append(margin)
        true_results.append(true_margin)
        errors.append(error)

    table = PrettyTable()
    table.add_column('State', states)
    table.add_column('Turnout', turnout)
    table.add_column('Margin', margins)
    table.add_column('True Margin', true_results)
    table.add_column('Error (%)', errors)

    print(f'{year} Gubernatorial Election')
    print(table)
    print()
