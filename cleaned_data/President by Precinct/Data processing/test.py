import csv
from prettytable import PrettyTable


git_data_2016 = '2016 git data.csv'
mit_data_2016 = '2016 MIT data.csv'
git_data_2020 = '2020 git data.csv'
mit_data_2020 = '2020 MIT data.csv'

# Via https://en.wikipedia.org/wiki/Voter_turnout_in_United_States_presidential_elections
total_votes_2016 = 136669276
total_votes_2020 = 158429631	

# Via https://www.270towin.com/2016_Election/
total_gop_votes_2016 = 62984828
total_dem_votes_2016 = 65853514

# Via https://www.270towin.com/2020_Election/
total_gop_votes_2020 = 74216747
total_dem_votes_2020 = 81268867

# Via https://ballotpedia.org/Analysis_of_absentee/mail-in_voting,_2016-2018
absentee_mail_in_2016 = 0.24

# Via https://www.pewresearch.org/politics/2020/11/20/the-voting-experience-in-2020/
absentee_mail_in_2020 = 0.46

def git_summarize(file):
    with open(file, 'r') as f_in:
        in_file = csv.reader(f_in)
        next(in_file)

        total_votes = 0
        total_democrat_votes = 0
        total_republican_votes = 0

        for row in in_file:
            total_votes += int(row[4])
            total_democrat_votes += int(row[5])
            total_republican_votes += int(row[6])

        return total_votes, total_democrat_votes, total_republican_votes
    
def mit_summarize(file):
    with open(file, 'r') as f_in:
        in_file = csv.reader(f_in)
        next(in_file)

        votes = 0
        democrat_votes = 0
        republican_votes = 0
        absentee_votes = 0 
        democrat_absentee_votes = 0
        republican_absentee_votes = 0

        for row in in_file:
            votes += int(row[4])
            democrat_votes += int(row[5])
            republican_votes += int(row[6])
            absentee_votes += int(row[9])
            democrat_absentee_votes += int(row[14])
            republican_absentee_votes += int(row[13])

        absentee_vote_share = round(absentee_votes / votes, 2)
        democrat_absentee_vote_share = round(democrat_absentee_votes / absentee_votes, 2)
        republican_absentee_vote_share = round(republican_absentee_votes / absentee_votes, 2)

        return votes, democrat_votes, republican_votes, absentee_vote_share, democrat_absentee_vote_share, republican_absentee_vote_share
            
git_votes_2016, git_dem_2016, git_gop_2016 = git_summarize(git_data_2016)
git_votes_2020, git_dem_2020, git_gop_2020 = git_summarize(git_data_2020)
mit_votes_2016, mit_dem_2016, mit_gop_2016, mit_absentee_2016, mit_dem_absentee_2016, mit_gop_absentee_2016 = mit_summarize(mit_data_2016)
mit_votes_2020, mit_dem_2020, mit_gop_2020, mit_absentee_2020, mit_dem_absentee_2020, mit_gop_absentee_2020 = mit_summarize(mit_data_2020)

git_votes_error_2016 = round(abs(total_votes_2016 - git_votes_2016)/total_votes_2016*100, 3)
git_votes_error_2020 = round(abs(total_votes_2020 - git_votes_2020)/total_votes_2020*100, 3)
mit_votes_error_2016 = round(abs(total_votes_2016 - mit_votes_2016)/total_votes_2016*100, 3)
mit_votes_error_2020 = round(abs(total_votes_2020 - mit_votes_2020)/total_votes_2020*100, 3)

git_dem_error_2016 = round(abs(total_dem_votes_2016 - git_dem_2016)/total_dem_votes_2016*100, 3)
git_gop_error_2016 = round(abs(total_gop_votes_2016 - git_gop_2016)/total_gop_votes_2016*100, 3)
git_dem_error_2020 = round(abs(total_dem_votes_2020 - git_dem_2020)/total_dem_votes_2020*100, 3)
git_gop_error_2020 = round(abs(total_gop_votes_2020 - git_gop_2020)/total_gop_votes_2020*100, 3)

mit_dem_error_2016 = round(abs(total_dem_votes_2016 - mit_dem_2016)/total_dem_votes_2016*100, 3)
mit_gop_error_2016 = round(abs(total_gop_votes_2016 - mit_gop_2016)/total_gop_votes_2016*100, 3)
mit_dem_error_2020 = round(abs(total_dem_votes_2020 - mit_dem_2020)/total_dem_votes_2020*100, 3)
mit_gop_error_2020 = round(abs(total_gop_votes_2020 - mit_gop_2020)/total_gop_votes_2020*100, 3)

mit_absentee_error_2016 = round(abs(absentee_mail_in_2016 - mit_absentee_2016)/absentee_mail_in_2016*100, 3)
mit_absentee_error_2020 = round(abs(absentee_mail_in_2020 - mit_absentee_2020)/absentee_mail_in_2020*100, 3)

net_vote_table = PrettyTable()
net_vote_table.add_column('Year',
            ['True Votes',
            'Git Data Votes',
            'MIT Data Votes'])
net_vote_table.add_column('2016',
            [total_votes_2016,
            git_votes_2016,
            mit_votes_2016])
net_vote_table.add_column('Error (%)',
            ['N/A',
             git_votes_error_2016,
             mit_votes_error_2016])
net_vote_table.add_column('2020',
            [total_votes_2020,
            git_votes_2020,
            mit_votes_2020])
net_vote_table.add_column('Error (%)',
            ['N/A',
             git_votes_error_2020,
             mit_votes_error_2020])
print(net_vote_table)

party_vote_table = PrettyTable()
party_vote_table.add_column('Year', 
         ['True Dem Votes',
          'Git Data Dem Votes', 
          'MIT Data Dem Votes',
          'True GOP Votes',
          'Git Data GOP Votes',
          'MIT Data GOP Votes'])
party_vote_table.add_column('2016',
            [total_dem_votes_2016,
            git_dem_2016,
            mit_dem_2016,
            total_gop_votes_2016,
            git_gop_2016,
            mit_gop_2016])
party_vote_table.add_column('Error (%)',
            ['N/A',
             git_dem_error_2016,
             mit_dem_error_2016,
             'N/A',
             git_gop_error_2016,
             mit_gop_error_2016])
party_vote_table.add_column('2020',
            [total_dem_votes_2020,
            git_dem_2020,
            mit_dem_2020,
            total_gop_votes_2020,
            git_gop_2020,
            mit_gop_2020])
party_vote_table.add_column('Error (%)',
            ['N/A',
             git_dem_error_2020,
             mit_dem_error_2020,
            'N/A',
             git_gop_error_2020,
             mit_gop_error_2020])

print(party_vote_table)

absentee_table = PrettyTable()
absentee_table.add_column('Absentee/Early/Mail-In Votes', 
         ['True Absentee Vote Share', 
         'MIT Data Absentee Vote Share', 
         'MIT Data Dem Absentee Vote Share',
         'MIT Data GOP Absentee Vote Share'])
absentee_table.add_column('2016',
            [absentee_mail_in_2016,
            mit_absentee_2016,
            mit_dem_absentee_2016,
            mit_gop_absentee_2016])
absentee_table.add_column('Error (%)',
            ['N/A',
             mit_absentee_error_2016,
             '?',
             '?'])
absentee_table.add_column('2020',
            [absentee_mail_in_2020,
            mit_absentee_2020,
            mit_dem_absentee_2020,
            mit_gop_absentee_2020])
absentee_table.add_column('Error (%)',
            ['N/A',
             mit_absentee_error_2020,
             '?',
             '?'])

print(absentee_table)


