import csv
from prettytable import PrettyTable
import polars as pl

# ---------------------------------- #
# True Vote Data
# ---------------------------------- #

true_votes_2012 = 93561320                  #https://en.wikipedia.org/wiki/2012_United_States_Senate_elections
true_votes_2016 = 96866509                  #https://en.wikipedia.org/wiki/2016_United_States_Senate_elections
true_votes_2018 = 90473222                  #https://en.wikipedia.org/wiki/2018_United_States_Senate_elections
true_votes_2020 = 80821083                  #https://en.wikipedia.org/wiki/2020_United_States_Senate_elections
true_votes_2022 = 92507402                  #https://en.wikipedia.org/wiki/2022_United_States_Senate_elections

true_dem_votes_2012 = 49988282              #https://en.wikipedia.org/wiki/2012_United_States_Senate_elections
true_dem_votes_2016 = 51315969              #https://en.wikipedia.org/wiki/2016_United_States_Senate_elections
true_dem_votes_2018 = 52224867              #https://en.wikipedia.org/wiki/2018_United_States_Senate_elections
true_dem_votes_2020 = 38011916              #https://en.wikipedia.org/wiki/2020_United_States_Senate_elections
true_dem_votes_2022 = 46208845              #https://en.wikipedia.org/wiki/2022_United_States_Senate_elections

true_gop_votes_2012 = 39128301              #https://en.wikipedia.org/wiki/2012_United_States_Senate_elections
true_gop_votes_2016 = 40841717              #https://en.wikipedia.org/wiki/2016_United_States_Senate_elections
true_gop_votes_2018 = 34722926              #https://en.wikipedia.org/wiki/2018_United_States_Senate_elections
true_gop_votes_2020 = 39834647              #https://en.wikipedia.org/wiki/2020_United_States_Senate_elections
true_gop_votes_2022 = 43850241

true_absentee_mail_in_2012 = ...            #Unknown
true_absentee_mail_in_2016 = 23.5           #https://ballotpedia.org/Analysis_of_absentee/mail-in_voting,_2016-2018
true_absentee_mail_in_2018 = 23.2           #https://ballotpedia.org/Analysis_of_absentee/mail-in_voting,_2016-2018
true_absentee_mail_in_2020 = ...            #Unknown
true_absentee_mail_in_2022 = ...            #Unknown

def summarize(file):
    with open(file, 'r', encoding='utf-8') as f_in:
        in_file = csv.reader(f_in)
        next(in_file) 

        total_votes = 0
        total_democrat_votes = 0
        total_republican_votes = 0
        
        absentee_percent_vals = []

        for row in in_file:
            votes = [int(x) for x in row[10].strip('[]').split(", ")]
            total_votes += sum(votes)
            total_democrat_votes += votes[0]
            total_republican_votes += votes[1]

            if row[14] != '':
                absentee_percent_vals.append(float(row[14]))

        if len(absentee_percent_vals) > 0:
            absentee_percent = round(sum(absentee_percent_vals)/len(absentee_percent_vals), 1)
        else:
            absentee_percent = 0

        return total_votes, total_democrat_votes, total_republican_votes, absentee_percent

# ---------------------------------- #
# Total Vote Summary 
# ---------------------------------- #

votes_2012, dem_votes_2012, gop_votes_2012, absentee_share_2012 = summarize('Senate by Precinct\\2012 Senate.csv')
votes_2016, dem_votes_2016, gop_votes_2016, absentee_share_2016 = summarize('Senate by Precinct\\2016 Senate.csv')
votes_2018, dem_votes_2018, gop_votes_2018, absentee_share_2018 = summarize('Senate by Precinct\\2018 Senate.csv')
votes_2020, dem_votes_2020, gop_votes_2020, absentee_share_2020 = summarize('Senate by Precinct\\2020 Senate.csv')
votes_2022, dem_votes_2022, gop_votes_2022, absentee_share_2022 = summarize('Senate by Precinct\\2022 Senate.csv')

votes_error_2012 = round(abs(votes_2012 - true_votes_2012) / true_votes_2012 * 100,2)
votes_error_2016 = round(abs(votes_2016 - true_votes_2016) / true_votes_2016 * 100,2)
votes_error_2018 = round(abs(votes_2018 - true_votes_2018) / true_votes_2018 * 100,2)
votes_error_2020 = round(abs(votes_2020 - true_votes_2020) / true_votes_2020 * 100,2)
votes_error_2022 = round(abs(votes_2022 - true_votes_2022) / true_votes_2022 * 100,2)

absentee_error_2016 = round(abs(absentee_share_2016 - true_absentee_mail_in_2016) / true_absentee_mail_in_2016 * 100,2)
absentee_error_2018 = round(abs(absentee_share_2018 - true_absentee_mail_in_2018) / true_absentee_mail_in_2018 * 100,2)

net_vote_table = PrettyTable()
net_vote_table.field_names = ["", "2012", "12 Error (%)", "2016", "16 Error (%)", "2018", "18 Error (%)", "2020", "20 Error (%)", "2022", "22 Error (%)"]
net_vote_table.add_rows([
    ["True Votes", true_votes_2012, "-", true_votes_2016, "-", true_votes_2018, "-", true_votes_2020, "-", true_votes_2022, "-",],
    ["Data Vote Total", votes_2012, votes_error_2012, votes_2016, votes_error_2016, votes_2018, votes_error_2018, votes_2020, votes_error_2020, votes_2022, votes_error_2022],
    ["True Absentee Vote Share", "?", "-", true_absentee_mail_in_2016, "-", true_absentee_mail_in_2018, "-", "?", "-", "?", "-"],
    ["Data Absentee Vote Share", "-", "-", absentee_share_2016, absentee_error_2016, absentee_share_2018, absentee_error_2018, absentee_share_2020, "?", absentee_share_2022, "?"],
])
print(net_vote_table)

# ---------------------------------- #
# Party Vote Summary
# ---------------------------------- #

dem_votes_error_2012 = round(abs(dem_votes_2012 - true_dem_votes_2012) / true_dem_votes_2012 * 100, 2)
dem_votes_error_2016 = round(abs(dem_votes_2016 - true_dem_votes_2016) / true_dem_votes_2016 * 100, 2)
dem_votes_error_2018 = round(abs(dem_votes_2018 - true_dem_votes_2018) / true_dem_votes_2018 * 100, 2)
dem_votes_error_2020 = round(abs(dem_votes_2020 - true_dem_votes_2020) / true_dem_votes_2020 * 100, 2)
dem_votes_error_2022 = round(abs(dem_votes_2022 - true_dem_votes_2022) / true_dem_votes_2022 * 100, 2)

gop_votes_error_2012 = round(abs(gop_votes_2012 - true_gop_votes_2012) / true_gop_votes_2012 * 100, 2)
gop_votes_error_2016 = round(abs(gop_votes_2016 - true_gop_votes_2016) / true_gop_votes_2016 * 100, 2)
gop_votes_error_2018 = round(abs(gop_votes_2018 - true_gop_votes_2018) / true_gop_votes_2018 * 100, 2)
gop_votes_error_2020 = round(abs(gop_votes_2020 - true_gop_votes_2020) / true_gop_votes_2020 * 100, 2)
gop_votes_error_2022 = round(abs(gop_votes_2022 - true_gop_votes_2022) / true_gop_votes_2022 * 100, 2)

party_vote_table = PrettyTable()
party_vote_table.field_names = ["", "2012", "12 Error (%)", "2016", "16 Error (%)", "2018", "18 Error (%)", "2020", "20 Error (%)", "2022", "22 Error (%)"]
party_vote_table.add_rows([
    ["True Dem Votes", true_dem_votes_2012, "-", true_dem_votes_2016, "-", true_dem_votes_2018, "-", true_dem_votes_2020, "-", true_dem_votes_2022, "-"], 
    ["Data Dem Votes", dem_votes_2012, dem_votes_error_2012, dem_votes_2016, dem_votes_error_2016, dem_votes_2018, dem_votes_error_2018, dem_votes_2020, dem_votes_error_2020, dem_votes_2022, dem_votes_error_2022],
    ["True GOP Votes", true_gop_votes_2012, "-", true_gop_votes_2016, "-", true_gop_votes_2018, "-", true_gop_votes_2020, "-", true_gop_votes_2022, "-"],
    ["Data GOP Votes", gop_votes_2012, gop_votes_error_2012, gop_votes_2016, gop_votes_error_2016, gop_votes_2018, gop_votes_error_2018, gop_votes_2020, gop_votes_error_2020, gop_votes_2022, gop_votes_error_2022]
])
print(party_vote_table)

