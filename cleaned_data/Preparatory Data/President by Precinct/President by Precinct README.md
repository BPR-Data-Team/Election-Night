This folder contains cleaned and processed Presidential Returns by County for 2016 and 2020. 

There are two datasets for each year: 
1) The MIT data, taken from the MIT Election Data + Science Lab 
* 2016: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/LYWX3D
* 2020: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/JXPREB
2) The "git" data, more accurately the tonmcg data, taken from GitHub
* 2016: https://github.com/tonmcg/US_County_Level_Election_Results_08-20/blob/master/2016_US_County_Level_Presidential_Results.csv
* 2020: https://github.com/tonmcg/US_County_Level_Election_Results_08-20/blob/master/2020_US_County_Level_Presidential_Results.csv

Here are the results for a preliminary comparison and accuracy check of the two aggregated files:

![image](https://github.com/user-attachments/assets/05eb1333-1d38-4d30-8457-2437175b7a16)

In general, it seems that the Git data is more accurate but the MIT data includes information about voting type (in person, absentee, early, mail-in, etc.) 

Note from the third table, though, that this presentation of the MIT data VERY incorrectly counts the absentee/early/mail-in data. This is likely due to differences in how voting method is named and reported across counties and states. I chose not to fix this issue because of the relative lower accuracy of the dataset on the whole but this bug could be patched later. 

The file gitsource_process.py was used to process the git data and can flexibly generate the aggregated files for 2016 and 2020 based on one flag. The file mit_process.py was partially used to process the MIT data; the other programs used were accidentally lost. mit_process.py likely has several bugs and needs to be slightly modified for the input/output files and column names/indices of 2020. The file test.py was used to generate the tables above as a preliminary sanity check to compare the two datasets. 

- mcapoor, 2024-09-12
