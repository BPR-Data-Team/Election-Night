import requests 
import polars as pl 
import csv
from bs4 import BeautifulSoup

states = ['Alabama',
        'Alaska',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Florida',
        'Georgia',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Iowa',
        'Kansas',
        'Maine',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Mexico',
        'New York',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Vermont',
        'Wisconsin',
        'Wyoming']

state = 'South Dakota'
url = f'https://www.politico.com/2022-election/results/{state.lower().replace(" ", "-")}/statewide-offices/'

response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

print(soup.prettify())