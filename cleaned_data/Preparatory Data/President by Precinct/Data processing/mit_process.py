import pandas as pd
input_file = '2016.csv'
output_file = '2016 President by Precinct.csv'

data = pd.read_csv(input_file,low_memory=False, encoding='latin-1')

final_data = pd.DataFrame(columns=['state', 
                                    'county', 
                                    'total_winner',
                                    'total_margin', 
                                    'total_votes',
                                    'democrat_votes', 
                                    'republican_votes', 
                                    'democrat_vote_share', 
                                    'republican_vote_share', 
                                    'absentee_votes', 
                                    'absentee_vote_share', 
                                    'absentee_winner', 
                                    'absentee_margin', 
                                    'republican_absentee_votes',
                                    'democrat_absentee_votes',
                                    'republican_absentee_vote_share',
                                    'democrat_absentee_vote_share'])

for state in data['state'].unique():
    print(state)
    state_level_data = data.loc[data['state']==state]
    for county in state_level_data['county_name'].unique():
        county_level_data = state_level_data.loc[data['county_name']==county]
        county_votes = county_level_data.votes.sum()

        absentee_votes_records = (county_level_data
            .query("(mode != 'Election Day') and (mode != 'Polling Place Votes') and (mode != 'In Person') and (mode != 'Election Day Paper')"))
       
        absentee_votes = absentee_votes_records.votes.sum()
        absentee_vote_share = round(absentee_votes / county_votes, 3)*100

        republican_absentee_votes = absentee_votes_records.loc[absentee_votes_records['party'] == 'republican'].votes
        republican_absentee_vote_share = round(republican_absentee_votes.sum() / absentee_votes, 3)*100

        democrat_absentee_votes = absentee_votes_records.loc[absentee_votes_records['party'] == 'democratic'].votes
        democrat_absentee_vote_share = round(democrat_absentee_votes.sum() / absentee_votes, 3)*100

        democrat_votes = county_level_data.loc[county_level_data['party'] == 'democratic'].votes
        democrat_vote_share = round(democrat_votes.sum() / county_votes, 3)*100

        republican_votes = county_level_data.loc[county_level_data['party'] == 'republican'].votes
        republican_vote_share = round(republican_votes.sum() / county_votes, 3)*100
        
        winner = democrat_votes if democrat_votes.sum() > republican_votes.sum() else republican_votes
        winner_name = 'DEMOCRAT' if democrat_votes.sum() > republican_votes.sum() else 'REPUBLICAN'
        runner_up = democrat_votes if democrat_votes.sum() < republican_votes.sum() else republican_votes
        runner_up_name = 'DEMOCRAT' if democrat_votes.sum() < republican_votes.sum() else 'REPUBLICAN'

        absentee_winner = democrat_absentee_votes if democrat_absentee_votes.sum() > republican_absentee_votes.sum() else republican_absentee_votes
        absentee_winner_name = 'DEMOCRAT' if democrat_absentee_votes.sum() > republican_absentee_votes.sum() else 'REPUBLICAN'
        absentee_runner_up = democrat_absentee_votes if democrat_absentee_votes.sum() < republican_absentee_votes.sum() else republican_absentee_votes
        absentee_runner_up_name = 'DEMOCRAT' if democrat_absentee_votes.sum() < republican_absentee_votes.sum() else 'REPUBLICAN'

        margin = round((winner.sum()/county_votes) - (runner_up.sum()/county_votes), 3)*100
        absentee_margin = round((absentee_winner.sum()/absentee_votes) - (absentee_runner_up.sum()/absentee_votes), 3)*100

    
        final_data = pd.concat([final_data, 
                               pd.DataFrame([[state, 
                                            county, 
                                            winner_name,
                                            round(margin, 3),
                                            county_votes,
                                            democrat_votes.sum(),
                                            republican_votes.sum(),
                                            round(democrat_vote_share, 3),
                                            round(republican_vote_share, 3),
                                            absentee_votes,
                                            round(absentee_vote_share, 3),
                                            absentee_winner_name,
                                            round(absentee_margin, 3),
                                            republican_absentee_votes.sum(),
                                            democrat_absentee_votes.sum(),
                                            round(republican_absentee_vote_share, 3),
                                            round(democrat_absentee_vote_share, 3)]],
                                    columns=['state', 
                                            'county', 
                                            'total_winner',
                                            'total_margin',
                                            'total_votes', 
                                            'democrat_votes', 
                                            'republican_votes', 
                                            'democrat_vote_share', 
                                            'republican_vote_share', 
                                            'absentee_votes', 
                                            'absentee_vote_share', 
                                            'absentee_winner', 
                                            'absentee_margin', 
                                            'republican_absentee_votes',
                                            'democrat_absentee_votes',
                                            'republican_absentee_vote_share',
                                            'democrat_absentee_vote_share'])]) 

final_data.to_csv(output_file, index=False)