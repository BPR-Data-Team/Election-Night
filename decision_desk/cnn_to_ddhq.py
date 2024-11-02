import csv

input_filepath = "/Users/benlevy/Desktop/censusData/CNN_scraped_data.csv"
output_filepath = "/Users/benlevy/Desktop/censusData/CNN_to_DDHQ.csv"
io_filepaths = (input_filepath, output_filepath) #python is pass by value and I want to make sure nothing gets accidentally changed

cnn_header = []
cnn_columns_proper_to_real = { #Change values in KV pair to be election day true column headers
	"fips" : "fips",
	"state" : "state",
	"county" : "county",
	"percentReporting" : "percentReporting",
	"REP_name" : "REP_name",
	"DEM_name" : "DEM_name",
	"REP_votes_percent" : "REP_votes_percent",
	"DEM_votes_percent" : "DEM_votes_percent",
	"REP_votes" : "REP_votes",
	"DEM_votes" : "DEM_votes",
	"office_type" : "office_type",
	"LIB_name" : "LIB_name",
	"LIB_votes_percent" : "LIB_votes_percent",
	"LIB_votes" : "LIB_votes"
}

ddhq_dict = {
	"test_data" : "FALSE",
	"ddhq_id" : "NA",
	"year" : "2024",
	"office_type" : "",
	"state" : "",
	"county" : "",
	"district" : "0",
	"fips" : "",
	"Democratic_name" : "",
	"Republican_name" : "",
	"Independent_name" : "NA",
	"Green_name" : "NA",
	"total" : "NA",
	"reporting" : "NA",
	"pct_reporting" : "",
	"Democratic_votes" : "",
	"Republican_votes" : "",
	"Independent_votes" : "NA",
	"Green_votes" : "NA",
	"Democratic_votes_percent" : "",
	"Republican_votes_percent" : "",
	"Independent_votes_percent" : "NA",
	"Green_votes_percent" : "NA",
	"margin_votes" : "",
	"margin_pct" : "",
	"pct_absentee" : "NA",
	"absentee_margin" : "NA",
}

def map_row(row):
	ddhq_dict['state'] = row[cnn_header.index(cnn_columns_proper_to_real["state"])]
	ddhq_dict['county'] = row[cnn_header.index(cnn_columns_proper_to_real["county"])]
	ddhq_dict['pct_reporting'] = row[cnn_header.index(cnn_columns_proper_to_real["percentReporting"])]
	ddhq_dict['Republican_name'] = row[cnn_header.index(cnn_columns_proper_to_real["REP_name"])]
	ddhq_dict['Democratic_name'] = row[cnn_header.index(cnn_columns_proper_to_real["DEM_name"])]
	ddhq_dict['fips'] = row[cnn_header.index(cnn_columns_proper_to_real["fips"])][-3:]
	
	office_type = row[cnn_header.index(cnn_columns_proper_to_real["office_type"])]
	mapped_office_type = "NA"
	if office_type == "P":
		mapped_office_type = "President"
	elif office_type == "S":
		mapped_office_type = "Senate"
	elif office_type == "G":
		mapped_office_type = "Governor"
	elif office_type == "H":
		mapped_office_type = "House"
	else:
		print("Invalid Office Type")
	ddhq_dict['office_type'] = mapped_office_type

	dem_string = row[cnn_header.index(cnn_columns_proper_to_real["DEM_votes"])]
	rep_string = row[cnn_header.index(cnn_columns_proper_to_real["REP_votes"])]
	lib_string = row[cnn_header.index(cnn_columns_proper_to_real["LIB_votes"])]
	dem_votes = 0
	rep_votes = 0
	lib_votes = 0
	democrat_percent = 0
	republican_percent = 0
	if(dem_string != "NA"):
		dem_votes = int(dem_string.replace(",", ""))
	if(rep_string != "NA"):
		rep_votes = int(rep_string.replace(",", ""))
	if(lib_string != "NA"):
		lib_votes = int(lib_string.replace(",", ""))
	total_votes = dem_votes + rep_votes + lib_votes
	if(total_votes == 0):
		margin_votes = 0
		margin_percent = 0
	else:
		margin_votes = dem_votes - rep_votes
		margin_percent = margin_votes/total_votes
		democrat_percent = dem_votes/total_votes
		republican_percent = rep_votes/total_votes
	ddhq_dict['margin_votes'] = margin_votes
	ddhq_dict['margin_pct'] = margin_percent
	ddhq_dict['Democratic_votes_percent'] = democrat_percent
	ddhq_dict['Republican_votes_percent'] = republican_percent
	ddhq_dict['Republican_votes'] = rep_votes
	ddhq_dict['Democratic_votes'] = dem_votes

	return list(ddhq_dict.values())

with open(io_filepaths[0], newline='') as infile:
	with open(io_filepaths[1], 'w', newline='') as outfile:
		cnn_file = csv.reader(infile, delimiter=',', quotechar='"')
		ddhq_file = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
		is_first_row = True
		for row in cnn_file:
			new_row = []
			if(is_first_row):
				is_first_row = False
				cnn_header = row
				new_row = ddhq_dict.keys()
			else:
				new_row = map_row(row)
			ddhq_file.writerow(new_row)
