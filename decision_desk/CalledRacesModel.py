import numpy as np
import pandas as pd
import math
from scipy import special
from scipy import optimize
import re

items = [
    {"officetype_district_state": "Governor0DE", "called": "NC"},
    {"officetype_district_state": "Governor0IN", "called": "NC"},
    {"officetype_district_state": "Governor0MO", "called": "NC"},
    {"officetype_district_state": "Governor0MT", "called": "NC"},
    {"officetype_district_state": "Governor0NC", "called": "NC"},
    {"officetype_district_state": "Governor0ND", "called": "NC"},
    {"officetype_district_state": "Governor0NH", "called": "NC"},
    {"officetype_district_state": "Governor0UT", "called": "NC"},
    {"officetype_district_state": "Governor0VT", "called": "NC"},
    {"officetype_district_state": "Governor0WA", "called": "NC"},
    {"officetype_district_state": "Governor0WV", "called": "NC"},
    {"officetype_district_state": "House1AK", "called": "NC"},
    {"officetype_district_state": "Governor0DE", "called": "NC"},
    {"officetype_district_state": "Governor0IN", "called": "NC"},
    {"officetype_district_state": "Governor0MO", "called": "NC"},
    {"officetype_district_state": "Governor0MT", "called": "NC"},
    {"officetype_district_state": "Governor0NC", "called": "NC"},
    {"officetype_district_state": "Governor0ND", "called": "NC"},
    {"officetype_district_state": "Governor0NH", "called": "NC"},
    {"officetype_district_state": "Governor0UT", "called": "NC"},
    {"officetype_district_state": "Governor0VT", "called": "NC"},
    {"officetype_district_state": "Governor0WA", "called": "NC"},
    {"officetype_district_state": "Governor0WV", "called": "NC"},
    {"officetype_district_state": "House1AK", "called": "NC"},
    {"officetype_district_state": "House1AL", "called": "NC"},
    {"officetype_district_state": "House2AL", "called": "NC"},
    {"officetype_district_state": "House3AL", "called": "NC"},
    {"officetype_district_state": "House4AL", "called": "NC"},
    {"officetype_district_state": "House5AL", "called": "NC"},
    {"officetype_district_state": "House6AL", "called": "NC"},
    {"officetype_district_state": "House7AL", "called": "NC"},
    {"officetype_district_state": "House1AR", "called": "NC"},
    {"officetype_district_state": "House2AR", "called": "NC"},
    {"officetype_district_state": "House3AR", "called": "NC"},
    {"officetype_district_state": "House4AR", "called": "NC"},
    {"officetype_district_state": "House1AZ", "called": "NC"},
    {"officetype_district_state": "House2AZ", "called": "NC"},
    {"officetype_district_state": "House3AZ", "called": "NC"},
    {"officetype_district_state": "House4AZ", "called": "NC"},
    {"officetype_district_state": "House5AZ", "called": "NC"},
    {"officetype_district_state": "House6AZ", "called": "NC"},
    {"officetype_district_state": "House7AZ", "called": "NC"},
    {"officetype_district_state": "House8AZ", "called": "NC"},
    {"officetype_district_state": "House9AZ", "called": "NC"},
    {"officetype_district_state": "House1CA", "called": "NC"},
    {"officetype_district_state": "House10CA", "called": "NC"},
    {"officetype_district_state": "House11CA", "called": "NC"},
    {"officetype_district_state": "House12CA", "called": "NC"},
    {"officetype_district_state": "House13CA", "called": "NC"},
    {"officetype_district_state": "House14CA", "called": "NC"},
    {"officetype_district_state": "House15CA", "called": "NC"},
    {"officetype_district_state": "House16CA", "called": "NC"},
    {"officetype_district_state": "House17CA", "called": "NC"},
    {"officetype_district_state": "House18CA", "called": "NC"},
    {"officetype_district_state": "House19CA", "called": "NC"},
    {"officetype_district_state": "House2CA", "called": "NC"},
    {"officetype_district_state": "House20CA", "called": "NC"},
    {"officetype_district_state": "House21CA", "called": "NC"},
    {"officetype_district_state": "House22CA", "called": "NC"},
    {"officetype_district_state": "House23CA", "called": "NC"},
    {"officetype_district_state": "House24CA", "called": "NC"},
    {"officetype_district_state": "House25CA", "called": "NC"},
    {"officetype_district_state": "House26CA", "called": "NC"},
    {"officetype_district_state": "House27CA", "called": "NC"},
    {"officetype_district_state": "House28CA", "called": "NC"},
    {"officetype_district_state": "House29CA", "called": "NC"},
    {"officetype_district_state": "House3CA", "called": "NC"},
    {"officetype_district_state": "House30CA", "called": "NC"},
    {"officetype_district_state": "House31CA", "called": "NC"},
    {"officetype_district_state": "House32CA", "called": "NC"},
    {"officetype_district_state": "House33CA", "called": "NC"},
    {"officetype_district_state": "House34CA", "called": "NC"},
    {"officetype_district_state": "House35CA", "called": "NC"},
    {"officetype_district_state": "House36CA", "called": "NC"},
    {"officetype_district_state": "House37CA", "called": "NC"},
    {"officetype_district_state": "House38CA", "called": "NC"},
    {"officetype_district_state": "House39CA", "called": "NC"},
    {"officetype_district_state": "House4CA", "called": "NC"},
    {"officetype_district_state": "House40CA", "called": "NC"},
    {"officetype_district_state": "House41CA", "called": "NC"},
    {"officetype_district_state": "House42CA", "called": "NC"},
    {"officetype_district_state": "House43CA", "called": "NC"},
    {"officetype_district_state": "House44CA", "called": "NC"},
    {"officetype_district_state": "House45CA", "called": "NC"},
    {"officetype_district_state": "House46CA", "called": "NC"},
    {"officetype_district_state": "House47CA", "called": "NC"},
    {"officetype_district_state": "House48CA", "called": "NC"},
    {"officetype_district_state": "House49CA", "called": "NC"},
    {"officetype_district_state": "House5CA", "called": "NC"},
    {"officetype_district_state": "House50CA", "called": "NC"},
    {"officetype_district_state": "House51CA", "called": "NC"},
    {"officetype_district_state": "House52CA", "called": "NC"},
    {"officetype_district_state": "House6CA", "called": "NC"},
    {"officetype_district_state": "House7CA", "called": "NC"},
    {"officetype_district_state": "House8CA", "called": "NC"},
    {"officetype_district_state": "House9CA", "called": "NC"},
    {"officetype_district_state": "House1CO", "called": "NC"},
    {"officetype_district_state": "House2CO", "called": "NC"},
    {"officetype_district_state": "House3CO", "called": "NC"},
    {"officetype_district_state": "House4CO", "called": "NC"},
    {"officetype_district_state": "House5CO", "called": "NC"},
    {"officetype_district_state": "House6CO", "called": "NC"},
    {"officetype_district_state": "House7CO", "called": "NC"},
    {"officetype_district_state": "House8CO", "called": "NC"},
    {"officetype_district_state": "House1CT", "called": "NC"},
    {"officetype_district_state": "House2CT", "called": "NC"},
    {"officetype_district_state": "House3CT", "called": "NC"},
    {"officetype_district_state": "House4CT", "called": "NC"},
    {"officetype_district_state": "House5CT", "called": "NC"},
    {"officetype_district_state": "House1DE", "called": "NC"},
    {"officetype_district_state": "House1FL", "called": "NC"},
    {"officetype_district_state": "House10FL", "called": "NC"},
    {"officetype_district_state": "House11FL", "called": "NC"},
    {"officetype_district_state": "House12FL", "called": "NC"},
    {"officetype_district_state": "House13FL", "called": "NC"},
    {"officetype_district_state": "House14FL", "called": "NC"},
    {"officetype_district_state": "House15FL", "called": "NC"},
    {"officetype_district_state": "House16FL", "called": "NC"},
    {"officetype_district_state": "House17FL", "called": "NC"},
    {"officetype_district_state": "House18FL", "called": "NC"},
    {"officetype_district_state": "House19FL", "called": "NC"},
    {"officetype_district_state": "House2FL", "called": "NC"},
    {"officetype_district_state": "House20FL", "called": "NC"},
    {"officetype_district_state": "House21FL", "called": "NC"},
    {"officetype_district_state": "House22FL", "called": "NC"},
    {"officetype_district_state": "House23FL", "called": "NC"},
    {"officetype_district_state": "House24FL", "called": "NC"},
    {"officetype_district_state": "House25FL", "called": "NC"},
    {"officetype_district_state": "House26FL", "called": "NC"},
    {"officetype_district_state": "House27FL", "called": "NC"},
    {"officetype_district_state": "House28FL", "called": "NC"},
    {"officetype_district_state": "House3FL", "called": "NC"},
    {"officetype_district_state": "House4FL", "called": "NC"},
    {"officetype_district_state": "House5FL", "called": "NC"},
    {"officetype_district_state": "House6FL", "called": "NC"},
    {"officetype_district_state": "House7FL", "called": "NC"},
    {"officetype_district_state": "House8FL", "called": "NC"},
    {"officetype_district_state": "House9FL", "called": "NC"},
    {"officetype_district_state": "House1GA", "called": "NC"},
    {"officetype_district_state": "House10GA", "called": "NC"},
    {"officetype_district_state": "House11GA", "called": "NC"},
    {"officetype_district_state": "House12GA", "called": "NC"},
    {"officetype_district_state": "House13GA", "called": "NC"},
    {"officetype_district_state": "House14GA", "called": "NC"},
    {"officetype_district_state": "House2GA", "called": "NC"},
    {"officetype_district_state": "House3GA", "called": "NC"},
    {"officetype_district_state": "House4GA", "called": "NC"},
    {"officetype_district_state": "House5GA", "called": "NC"},
    {"officetype_district_state": "House6GA", "called": "NC"},
    {"officetype_district_state": "House7GA", "called": "NC"},
    {"officetype_district_state": "House8GA", "called": "NC"},
    {"officetype_district_state": "House9GA", "called": "NC"},
    {"officetype_district_state": "House1HI", "called": "NC"},
    {"officetype_district_state": "House2HI", "called": "NC"},
    {"officetype_district_state": "House1IA", "called": "NC"},
    {"officetype_district_state": "House2IA", "called": "NC"},
    {"officetype_district_state": "House3IA", "called": "NC"},
    {"officetype_district_state": "House4IA", "called": "NC"},
    {"officetype_district_state": "House1ID", "called": "NC"},
    {"officetype_district_state": "House2ID", "called": "NC"},
    {"officetype_district_state": "House1IL", "called": "NC"},
    {"officetype_district_state": "House10IL", "called": "NC"},
    {"officetype_district_state": "House11IL", "called": "NC"},
    {"officetype_district_state": "House12IL", "called": "NC"},
    {"officetype_district_state": "House13IL", "called": "NC"},
    {"officetype_district_state": "House14IL", "called": "NC"},
    {"officetype_district_state": "House15IL", "called": "NC"},
    {"officetype_district_state": "House16IL", "called": "NC"},
    {"officetype_district_state": "House17IL", "called": "NC"},
    {"officetype_district_state": "House2IL", "called": "NC"},
    {"officetype_district_state": "House3IL", "called": "NC"},
    {"officetype_district_state": "House4IL", "called": "NC"},
    {"officetype_district_state": "House5IL", "called": "NC"},
    {"officetype_district_state": "House6IL", "called": "NC"},
    {"officetype_district_state": "House7IL", "called": "NC"},
    {"officetype_district_state": "House8IL", "called": "NC"},
    {"officetype_district_state": "House9IL", "called": "NC"},
    {"officetype_district_state": "House1IN", "called": "NC"},
    {"officetype_district_state": "House2IN", "called": "NC"},
    {"officetype_district_state": "House3IN", "called": "NC"},
    {"officetype_district_state": "House4IN", "called": "NC"},
    {"officetype_district_state": "House5IN", "called": "NC"},
    {"officetype_district_state": "House6IN", "called": "NC"},
    {"officetype_district_state": "House7IN", "called": "NC"},
    {"officetype_district_state": "House8IN", "called": "NC"},
    {"officetype_district_state": "House9IN", "called": "NC"},
    {"officetype_district_state": "House1KS", "called": "NC"},
    {"officetype_district_state": "House2KS", "called": "NC"},
    {"officetype_district_state": "House3KS", "called": "NC"},
    {"officetype_district_state": "House4KS", "called": "NC"},
    {"officetype_district_state": "House1KY", "called": "NC"},
    {"officetype_district_state": "House2KY", "called": "NC"},
    {"officetype_district_state": "House3KY", "called": "NC"},
    {"officetype_district_state": "House4KY", "called": "NC"},
    {"officetype_district_state": "House5KY", "called": "NC"},
    {"officetype_district_state": "House6KY", "called": "NC"},
    {"officetype_district_state": "House1MA", "called": "NC"},
    {"officetype_district_state": "House2MA", "called": "NC"},
    {"officetype_district_state": "House3MA", "called": "NC"},
    {"officetype_district_state": "House4MA", "called": "NC"},
    {"officetype_district_state": "House5MA", "called": "NC"},
    {"officetype_district_state": "House6MA", "called": "NC"},
    {"officetype_district_state": "House7MA", "called": "NC"},
    {"officetype_district_state": "House8MA", "called": "NC"},
    {"officetype_district_state": "House9MA", "called": "NC"},
    {"officetype_district_state": "House1MD", "called": "NC"},
    {"officetype_district_state": "House2MD", "called": "NC"},
    {"officetype_district_state": "House3MD", "called": "NC"},
    {"officetype_district_state": "House4MD", "called": "NC"},
    {"officetype_district_state": "House5MD", "called": "NC"},
    {"officetype_district_state": "House6MD", "called": "NC"},
    {"officetype_district_state": "House7MD", "called": "NC"},
    {"officetype_district_state": "House8MD", "called": "NC"},
    {"officetype_district_state": "House1ME", "called": "NC"},
    {"officetype_district_state": "House2ME", "called": "NC"},
    {"officetype_district_state": "House1MI", "called": "NC"},
    {"officetype_district_state": "House10MI", "called": "NC"},
    {"officetype_district_state": "House11MI", "called": "NC"},
    {"officetype_district_state": "House12MI", "called": "NC"},
    {"officetype_district_state": "House13MI", "called": "NC"},
    {"officetype_district_state": "House2MI", "called": "NC"},
    {"officetype_district_state": "House3MI", "called": "NC"},
    {"officetype_district_state": "House4MI", "called": "NC"},
    {"officetype_district_state": "House5MI", "called": "NC"},
    {"officetype_district_state": "House6MI", "called": "NC"},
    {"officetype_district_state": "House7MI", "called": "NC"},
    {"officetype_district_state": "House8MI", "called": "NC"},
    {"officetype_district_state": "House9MI", "called": "NC"},
    {"officetype_district_state": "House1MN", "called": "NC"},
    {"officetype_district_state": "House2MN", "called": "NC"},
    {"officetype_district_state": "House3MN", "called": "NC"},
    {"officetype_district_state": "House4MN", "called": "NC"},
    {"officetype_district_state": "House5MN", "called": "NC"},
    {"officetype_district_state": "House6MN", "called": "NC"},
    {"officetype_district_state": "House7MN", "called": "NC"},
    {"officetype_district_state": "House8MN", "called": "NC"},
    {"officetype_district_state": "House1MO", "called": "NC"},
    {"officetype_district_state": "House2MO", "called": "NC"},
    {"officetype_district_state": "House3MO", "called": "NC"},
    {"officetype_district_state": "House4MO", "called": "NC"},
    {"officetype_district_state": "House5MO", "called": "NC"},
    {"officetype_district_state": "House6MO", "called": "NC"},
    {"officetype_district_state": "House7MO", "called": "NC"},
    {"officetype_district_state": "House8MO", "called": "NC"},
    {"officetype_district_state": "House1MS", "called": "NC"},
    {"officetype_district_state": "House2MS", "called": "NC"},
    {"officetype_district_state": "House3MS", "called": "NC"},
    {"officetype_district_state": "House4MS", "called": "NC"},
    {"officetype_district_state": "House1MT", "called": "NC"},
    {"officetype_district_state": "House2MT", "called": "NC"},
    {"officetype_district_state": "House1NC", "called": "NC"},
    {"officetype_district_state": "House10NC", "called": "NC"},
    {"officetype_district_state": "House11NC", "called": "NC"},
    {"officetype_district_state": "House12NC", "called": "NC"},
    {"officetype_district_state": "House13NC", "called": "NC"},
    {"officetype_district_state": "House14NC", "called": "NC"},
    {"officetype_district_state": "House2NC", "called": "NC"},
    {"officetype_district_state": "House3NC", "called": "NC"},
    {"officetype_district_state": "House4NC", "called": "NC"},
    {"officetype_district_state": "House5NC", "called": "NC"},
    {"officetype_district_state": "House6NC", "called": "NC"},
    {"officetype_district_state": "House7NC", "called": "NC"},
    {"officetype_district_state": "House8NC", "called": "NC"},
    {"officetype_district_state": "House9NC", "called": "NC"},
    {"officetype_district_state": "House1ND", "called": "NC"},
    {"officetype_district_state": "House1NE", "called": "NC"},
    {"officetype_district_state": "House2NE", "called": "NC"},
    {"officetype_district_state": "House3NE", "called": "NC"},
    {"officetype_district_state": "House1NH", "called": "NC"},
    {"officetype_district_state": "House2NH", "called": "NC"},
    {"officetype_district_state": "House1NJ", "called": "NC"},
    {"officetype_district_state": "House10NJ", "called": "NC"},
    {"officetype_district_state": "House11NJ", "called": "NC"},
    {"officetype_district_state": "House12NJ", "called": "NC"},
    {"officetype_district_state": "House2NJ", "called": "NC"},
    {"officetype_district_state": "House3NJ", "called": "NC"},
    {"officetype_district_state": "House4NJ", "called": "NC"},
    {"officetype_district_state": "House5NJ", "called": "NC"},
    {"officetype_district_state": "House6NJ", "called": "NC"},
    {"officetype_district_state": "House7NJ", "called": "NC"},
    {"officetype_district_state": "House8NJ", "called": "NC"},
    {"officetype_district_state": "House9NJ", "called": "NC"},
    {"officetype_district_state": "House1NM", "called": "NC"},
    {"officetype_district_state": "House2NM", "called": "NC"},
    {"officetype_district_state": "House3NM", "called": "NC"},
    {"officetype_district_state": "House1NV", "called": "NC"},
    {"officetype_district_state": "House2NV", "called": "NC"},
    {"officetype_district_state": "House3NV", "called": "NC"},
    {"officetype_district_state": "House4NV", "called": "NC"},
    {"officetype_district_state": "House1NY", "called": "NC"},
    {"officetype_district_state": "House10NY", "called": "NC"},
    {"officetype_district_state": "House11NY", "called": "NC"},
    {"officetype_district_state": "House12NY", "called": "NC"},
    {"officetype_district_state": "House13NY", "called": "NC"},
    {"officetype_district_state": "House14NY", "called": "NC"},
    {"officetype_district_state": "House15NY", "called": "NC"},
    {"officetype_district_state": "House16NY", "called": "NC"},
    {"officetype_district_state": "House17NY", "called": "NC"},
    {"officetype_district_state": "House18NY", "called": "NC"},
    {"officetype_district_state": "House19NY", "called": "NC"},
    {"officetype_district_state": "House2NY", "called": "NC"},
    {"officetype_district_state": "House20NY", "called": "NC"},
    {"officetype_district_state": "House21NY", "called": "NC"},
    {"officetype_district_state": "House22NY", "called": "NC"},
    {"officetype_district_state": "House23NY", "called": "NC"},
    {"officetype_district_state": "House24NY", "called": "NC"},
    {"officetype_district_state": "House25NY", "called": "NC"},
    {"officetype_district_state": "House26NY", "called": "NC"},
    {"officetype_district_state": "House3NY", "called": "NC"},
    {"officetype_district_state": "House4NY", "called": "NC"},
    {"officetype_district_state": "House5NY", "called": "NC"},
    {"officetype_district_state": "House6NY", "called": "NC"},
    {"officetype_district_state": "House7NY", "called": "NC"},
    {"officetype_district_state": "House8NY", "called": "NC"},
    {"officetype_district_state": "House9NY", "called": "NC"},
    {"officetype_district_state": "House1OH", "called": "NC"},
    {"officetype_district_state": "House10OH", "called": "NC"},
    {"officetype_district_state": "House11OH", "called": "NC"},
    {"officetype_district_state": "House12OH", "called": "NC"},
    {"officetype_district_state": "House13OH", "called": "NC"},
    {"officetype_district_state": "House14OH", "called": "NC"},
    {"officetype_district_state": "House15OH", "called": "NC"},
    {"officetype_district_state": "House2OH", "called": "NC"},
    {"officetype_district_state": "House3OH", "called": "NC"},
    {"officetype_district_state": "House4OH", "called": "NC"},
    {"officetype_district_state": "House5OH", "called": "NC"},
    {"officetype_district_state": "House6OH", "called": "NC"},
    {"officetype_district_state": "House7OH", "called": "NC"},
    {"officetype_district_state": "House8OH", "called": "NC"},
    {"officetype_district_state": "House9OH", "called": "NC"},
    {"officetype_district_state": "House1OK", "called": "NC"},
    {"officetype_district_state": "House2OK", "called": "NC"},
    {"officetype_district_state": "House3OK", "called": "NC"},
    {"officetype_district_state": "House4OK", "called": "NC"},
    {"officetype_district_state": "House5OK", "called": "NC"},
    {"officetype_district_state": "House1OR", "called": "NC"},
    {"officetype_district_state": "House2OR", "called": "NC"},
    {"officetype_district_state": "House3OR", "called": "NC"},
    {"officetype_district_state": "House4OR", "called": "NC"},
    {"officetype_district_state": "House5OR", "called": "NC"},
    {"officetype_district_state": "House6OR", "called": "NC"},
    {"officetype_district_state": "House1PA", "called": "NC"},
    {"officetype_district_state": "House10PA", "called": "NC"},
    {"officetype_district_state": "House11PA", "called": "NC"},
    {"officetype_district_state": "House12PA", "called": "NC"},
    {"officetype_district_state": "House13PA", "called": "NC"},
    {"officetype_district_state": "House14PA", "called": "NC"},
    {"officetype_district_state": "House15PA", "called": "NC"},
    {"officetype_district_state": "House16PA", "called": "NC"},
    {"officetype_district_state": "House17PA", "called": "NC"},
    {"officetype_district_state": "House2PA", "called": "NC"},
    {"officetype_district_state": "House3PA", "called": "NC"},
    {"officetype_district_state": "House4PA", "called": "NC"},
    {"officetype_district_state": "House5PA", "called": "NC"},
    {"officetype_district_state": "House6PA", "called": "NC"},
    {"officetype_district_state": "House7PA", "called": "NC"},
    {"officetype_district_state": "House8PA", "called": "NC"},
    {"officetype_district_state": "House9PA", "called": "NC"},
    {"officetype_district_state": "House1RI", "called": "NC"},
    {"officetype_district_state": "House2RI", "called": "NC"},
    {"officetype_district_state": "House1SC", "called": "NC"},
    {"officetype_district_state": "House2SC", "called": "NC"},
    {"officetype_district_state": "House3SC", "called": "NC"},
    {"officetype_district_state": "House4SC", "called": "NC"},
    {"officetype_district_state": "House5SC", "called": "NC"},
    {"officetype_district_state": "House6SC", "called": "NC"},
    {"officetype_district_state": "House7SC", "called": "NC"},
    {"officetype_district_state": "House1SD", "called": "NC"},
    {"officetype_district_state": "House1TN", "called": "NC"},
    {"officetype_district_state": "House2TN", "called": "NC"},
    {"officetype_district_state": "House3TN", "called": "NC"},
    {"officetype_district_state": "House4TN", "called": "NC"},
    {"officetype_district_state": "House5TN", "called": "NC"},
    {"officetype_district_state": "House6TN", "called": "NC"},
    {"officetype_district_state": "House7TN", "called": "NC"},
    {"officetype_district_state": "House8TN", "called": "NC"},
    {"officetype_district_state": "House9TN", "called": "NC"},
    {"officetype_district_state": "House1TX", "called": "NC"},
    {"officetype_district_state": "House10TX", "called": "NC"},
    {"officetype_district_state": "House11TX", "called": "NC"},
    {"officetype_district_state": "House12TX", "called": "NC"},
    {"officetype_district_state": "House13TX", "called": "NC"},
    {"officetype_district_state": "House14TX", "called": "NC"},
    {"officetype_district_state": "House15TX", "called": "NC"},
    {"officetype_district_state": "House16TX", "called": "NC"},
    {"officetype_district_state": "House17TX", "called": "NC"},
    {"officetype_district_state": "House18TX", "called": "NC"},
    {"officetype_district_state": "House19TX", "called": "NC"},
    {"officetype_district_state": "House2TX", "called": "NC"},
    {"officetype_district_state": "House20TX", "called": "NC"},
    {"officetype_district_state": "House21TX", "called": "NC"},
    {"officetype_district_state": "House22TX", "called": "NC"},
    {"officetype_district_state": "House23TX", "called": "NC"},
    {"officetype_district_state": "House24TX", "called": "NC"},
    {"officetype_district_state": "House25TX", "called": "NC"},
    {"officetype_district_state": "House26TX", "called": "NC"},
    {"officetype_district_state": "House27TX", "called": "NC"},
    {"officetype_district_state": "House28TX", "called": "NC"},
    {"officetype_district_state": "House29TX", "called": "NC"},
    {"officetype_district_state": "House3TX", "called": "NC"},
    {"officetype_district_state": "House30TX", "called": "NC"},
    {"officetype_district_state": "House31TX", "called": "NC"},
    {"officetype_district_state": "House32TX", "called": "NC"},
    {"officetype_district_state": "House33TX", "called": "NC"},
    {"officetype_district_state": "House34TX", "called": "NC"},
    {"officetype_district_state": "House35TX", "called": "NC"},
    {"officetype_district_state": "House36TX", "called": "NC"},
    {"officetype_district_state": "House37TX", "called": "NC"},
    {"officetype_district_state": "House38TX", "called": "NC"},
    {"officetype_district_state": "House4TX", "called": "NC"},
    {"officetype_district_state": "House5TX", "called": "NC"},
    {"officetype_district_state": "House6TX", "called": "NC"},
    {"officetype_district_state": "House7TX", "called": "NC"},
    {"officetype_district_state": "House8TX", "called": "NC"},
    {"officetype_district_state": "House9TX", "called": "NC"},
    {"officetype_district_state": "House1UT", "called": "NC"},
    {"officetype_district_state": "House2UT", "called": "NC"},
    {"officetype_district_state": "House3UT", "called": "NC"},
    {"officetype_district_state": "House4UT", "called": "NC"},
    {"officetype_district_state": "House1VA", "called": "NC"},
    {"officetype_district_state": "House10VA", "called": "NC"},
    {"officetype_district_state": "House11VA", "called": "NC"},
    {"officetype_district_state": "House2VA", "called": "NC"},
    {"officetype_district_state": "House3VA", "called": "NC"},
    {"officetype_district_state": "House4VA", "called": "NC"},
    {"officetype_district_state": "House5VA", "called": "NC"},
    {"officetype_district_state": "House6VA", "called": "NC"},
    {"officetype_district_state": "House7VA", "called": "NC"},
    {"officetype_district_state": "House8VA", "called": "NC"},
    {"officetype_district_state": "House9VA", "called": "NC"},
    {"officetype_district_state": "House1VT", "called": "NC"},
    {"officetype_district_state": "House1WA", "called": "NC"},
    {"officetype_district_state": "House10WA", "called": "NC"},
    {"officetype_district_state": "House2WA", "called": "NC"},
    {"officetype_district_state": "House3WA", "called": "NC"},
    {"officetype_district_state": "House4WA", "called": "NC"},
    {"officetype_district_state": "House5WA", "called": "NC"},
    {"officetype_district_state": "House6WA", "called": "NC"},
    {"officetype_district_state": "House7WA", "called": "NC"},
    {"officetype_district_state": "House8WA", "called": "NC"},
    {"officetype_district_state": "House9WA", "called": "NC"},
    {"officetype_district_state": "House1WI", "called": "NC"},
    {"officetype_district_state": "House2WI", "called": "NC"},
    {"officetype_district_state": "House3WI", "called": "NC"},
    {"officetype_district_state": "House4WI", "called": "NC"},
    {"officetype_district_state": "House5WI", "called": "NC"},
    {"officetype_district_state": "House6WI", "called": "NC"},
    {"officetype_district_state": "House7WI", "called": "NC"},
    {"officetype_district_state": "House8WI", "called": "NC"},
    {"officetype_district_state": "House1WV", "called": "NC"},
    {"officetype_district_state": "House2WV", "called": "NC"},
    {"officetype_district_state": "House1WY", "called": "NC"},
    {"officetype_district_state": "President0AK", "called": "NC"},
    {"officetype_district_state": "President0AL", "called": "NC"},
    {"officetype_district_state": "President0AR", "called": "NC"},
    {"officetype_district_state": "President0AZ", "called": "NC"},
    {"officetype_district_state": "President0CA", "called": "NC"},
    {"officetype_district_state": "President0CO", "called": "NC"},
    {"officetype_district_state": "President0CT", "called": "NC"},
    {"officetype_district_state": "President0DC", "called": "NC"},
    {"officetype_district_state": "President0DE", "called": "NC"},
    {"officetype_district_state": "President0FL", "called": "NC"},
    {"officetype_district_state": "President0GA", "called": "NC"},
    {"officetype_district_state": "President0HI", "called": "NC"},
    {"officetype_district_state": "President0IA", "called": "NC"},
    {"officetype_district_state": "President0ID", "called": "NC"},
    {"officetype_district_state": "President0IL", "called": "NC"},
    {"officetype_district_state": "President0IN", "called": "NC"},
    {"officetype_district_state": "President0KS", "called": "NC"},
    {"officetype_district_state": "President0KY", "called": "NC"},
    {"officetype_district_state": "President0LA", "called": "NC"},
    {"officetype_district_state": "President0MA", "called": "NC"},
    {"officetype_district_state": "President0MD", "called": "NC"},
    {"officetype_district_state": "President0ME", "called": "NC"},
    {"officetype_district_state": "President1ME", "called": "NC"},
    {"officetype_district_state": "President2ME", "called": "NC"},
    {"officetype_district_state": "President0MI", "called": "NC"},
    {"officetype_district_state": "President0MN", "called": "NC"},
    {"officetype_district_state": "President0MO", "called": "NC"},
    {"officetype_district_state": "President0MS", "called": "NC"},
    {"officetype_district_state": "President0MT", "called": "NC"},
    {"officetype_district_state": "President0NC", "called": "NC"},
    {"officetype_district_state": "President0ND", "called": "NC"},
    {"officetype_district_state": "President0NE", "called": "NC"},
    {"officetype_district_state": "President0NH", "called": "NC"},
    {"officetype_district_state": "President0NJ", "called": "NC"},
    {"officetype_district_state": "President0NM", "called": "NC"},
    {"officetype_district_state": "President0NV", "called": "NC"},
    {"officetype_district_state": "President0NY", "called": "NC"},
    {"officetype_district_state": "President0OH", "called": "NC"},
    {"officetype_district_state": "President0OK", "called": "NC"},
    {"officetype_district_state": "President0OR", "called": "NC"},
    {"officetype_district_state": "President0PA", "called": "NC"},
    {"officetype_district_state": "President0RI", "called": "NC"},
    {"officetype_district_state": "President0SC", "called": "NC"},
    {"officetype_district_state": "President0SD", "called": "NC"},
    {"officetype_district_state": "President0TN", "called": "NC"},
    {"officetype_district_state": "President0TX", "called": "NC"},
    {"officetype_district_state": "President0UT", "called": "NC"},
    {"officetype_district_state": "President0VA", "called": "NC"},
    {"officetype_district_state": "President0VT", "called": "NC"},
    {"officetype_district_state": "President0WA", "called": "NC"},
    {"officetype_district_state": "President0WI", "called": "NC"},
    {"officetype_district_state": "President0WV", "called": "NC"},
    {"officetype_district_state": "President0WY", "called": "NC"},
    {"officetype_district_state": "Senate0AZ", "called": "NC"},
    {"officetype_district_state": "Senate0CA", "called": "NC"},
    {"officetype_district_state": "Senate0DE", "called": "NC"},
    {"officetype_district_state": "Senate0FL", "called": "NC"},
    {"officetype_district_state": "Senate0HI", "called": "NC"},
    {"officetype_district_state": "Senate0IN", "called": "NC"},
    {"officetype_district_state": "Senate0MA", "called": "NC"},
    {"officetype_district_state": "Senate0MD", "called": "NC"},
    {"officetype_district_state": "Senate0ME", "called": "NC"},
    {"officetype_district_state": "Senate0MI", "called": "NC"},
    {"officetype_district_state": "Senate0MN", "called": "NC"},
    {"officetype_district_state": "Senate0MO", "called": "NC"},
    {"officetype_district_state": "Senate0MS", "called": "NC"},
    {"officetype_district_state": "Senate0MT", "called": "NC"},
    {"officetype_district_state": "Senate0ND", "called": "NC"},
    {"officetype_district_state": "Senate0NE", "called": "NC"},
    {"officetype_district_state": "Senate0NJ", "called": "NC"},
    {"officetype_district_state": "Senate0NM", "called": "NC"},
    {"officetype_district_state": "Senate0NV", "called": "NC"},
    {"officetype_district_state": "Senate0NY", "called": "NC"},
    {"officetype_district_state": "Senate0OH", "called": "NC"},
    {"officetype_district_state": "Senate0PA", "called": "NC"},
    {"officetype_district_state": "Senate0RI", "called": "NC"},
    {"officetype_district_state": "Senate0TN", "called": "NC"},
    {"officetype_district_state": "Senate0TX", "called": "NC"},
    {"officetype_district_state": "Senate0UT", "called": "NC"},
    {"officetype_district_state": "Senate0VA", "called": "NC"},
    {"officetype_district_state": "Senate0VT", "called": "NC"},
    {"officetype_district_state": "Senate0WA", "called": "NC"},
    {"officetype_district_state": "Senate0WI", "called": "NC"},
    {"officetype_district_state": "Senate0WV", "called": "NC"},
    {"officetype_district_state": "Senate0WY", "called": "NC"}
]


# Getting matrices and vectors from locally-hosted data
cov_matrix = np.load("../cleaned_data/AWS_data/cov_matrix.npy")
mean_predictions = np.load("../cleaned_data/AWS_data/mean_predictions.npy")
officetype_district = np.load("../cleaned_data/AWS_data/officetype_district_state.npy")
# Create lists to store the parsed components
office_type = []
district = []
state = []

# Parse each entry
for entry in officetype_district:
    # Use regex to capture office type, district, and state
    match = re.match(r'([A-Za-z]+)(\d+)([A-Za-z]+)', entry)
    if match:
        office_type.append(match.group(1))                  # Office type (e.g., House, Senate)
        district.append(int(match.group(2)))                # District number, cast to int
        state.append(match.group(3))                        # State abbreviation

# Create a DataFrame
new_predictions_df = pd.DataFrame({
    'office_type': office_type,
    'district': district,
    'state': state
})


original_predictions_df = pd.read_csv("../cleaned_data/AWS_data/Predictions.csv")

#Creating upper and lower bounds for predictions
rep_called_states = [item['officetype_district_state'] for item in items if item['called'] == 'R']
dem_called_states = [item['officetype_district_state'] for item in items if item['called'] == 'D']
lower_bounds = [0 if state_district in dem_called_states else -100 for state_district in officetype_district]
upper_bounds = [0 if state_district in rep_called_states else 100 for state_district in officetype_district]

#---- THE FOLLOWING CODE IS FROM GITHUB, DO NOT CHANGE! ----

EPS = 10e-15

class TruncatedMVN:
    """
    Create a normal distribution :math:`X  \sim N ({\mu}, {\Sigma})` subject to linear inequality constraints
    :math:`lb < X < ub` and sample from it using minimax tilting. Based on the MATLAB implemention by the authors
    (reference below).

    :param np.ndarray mu: (size D) mean of the normal distribution :math:`\mathbf {\mu}`.
    :param np.ndarray cov: (size D x D) covariance of the normal distribution :math:`\mathbf {\Sigma}`.
    :param np.ndarray lb: (size D) lower bound constrain of the multivariate normal distribution :math:`\mathbf lb`.
    :param np.ndarray ub: (size D) upper bound constrain of the multivariate normal distribution :math:`\mathbf ub`.
    :param Union[int, None] seed: a random seed.

    Note that the algorithm may not work if 'cov' is close to being rank deficient.

    Reference:
    Botev, Z. I., (2016), The normal law under linear restrictions: simulation and estimation via minimax tilting,
    Journal of the Royal Statistical Society Series B, 79, issue 1, p. 125-148,

    Example:
        >>> d = 10  # dimensions
        >>>
        >>> # random mu and cov
        >>> mu = np.random.rand(d)
        >>> cov = 0.5 - np.random.rand(d ** 2).reshape((d, d))
        >>> cov = np.triu(cov)
        >>> cov += cov.T - np.diag(cov.diagonal())
        >>> cov = np.dot(cov, cov)
        >>>
        >>> # constraints
        >>> lb = np.zeros_like(mu) - 2
        >>> ub = np.ones_like(mu) * np.inf
        >>>
        >>> # create truncated normal and sample from it
        >>> n_samples = 100000
        >>> samples = TruncatedMVN(mu, cov, lb, ub).sample(n_samples)

    Reimplementation by Paul Brunzema
    """

    def __init__(self, mu, cov, lb, ub, seed=None):
        self.dim = len(mu)
        if not cov.shape[0] == cov.shape[1]:
            raise RuntimeError("Covariance matrix must be of shape DxD!")
        if not (self.dim == cov.shape[0] and self.dim == len(lb) and self.dim == len(ub)):
            raise RuntimeError("Dimensions D of mean (mu), covariance matric (cov), lower bound (lb) "
                               "and upper bound (ub) must be the same!")

        self.cov = cov
        self.orig_mu = mu
        self.orig_lb = lb
        self.orig_ub = ub
        
        # permutated
        self.lb = lb - mu  # move distr./bounds to have zero mean
        self.ub = ub - mu  # move distr./bounds to have zero mean
        if np.any(self.ub <= self.lb):
            raise RuntimeError("Upper bound (ub) must be strictly greater than lower bound (lb) for all D dimensions!")

        # scaled Cholesky with zero diagonal, permutated
        self.L = np.empty_like(cov)
        self.unscaled_L = np.empty_like(cov)

        # placeholder for optimization
        self.perm = None
        self.x = None
        self.mu = None
        self.psistar = None

        # for numerics
        self.eps = EPS

        # a random state
        self.random_state = np.random.RandomState(seed)

    def sample(self, n):
        """
        Create n samples from the truncated normal distribution.

        :param int n: Number of samples to create.
        :return: D x n array with the samples.
        :rtype: np.ndarray
        """
        if not isinstance(n, int):
            raise RuntimeError("Number of samples must be an integer!")

        # factors (Cholesky, etc.) only need to be computed once!
        if self.psistar is None:
            self.compute_factors()

        # start acceptance rejection sampling
        rv = np.array([], dtype=np.float64).reshape(self.dim, 0)
        accept, iteration = 0, 0
        while accept < n:
            logpr, Z = self.mvnrnd(n, self.mu)  # simulate n proposals
            idx = -np.log(self.random_state.rand(n)) > (self.psistar - logpr)  # acceptance tests
            rv = np.concatenate((rv, Z[:, idx]), axis=1)  # accumulate accepted
            accept = rv.shape[1]  # keep track of # of accepted
            iteration += 1
            if iteration == 10 ** 3:
                print('Warning: Acceptance prob. smaller than 0.001.')
            elif iteration > 10 ** 4:
                accept = n
                rv = np.concatenate((rv, Z), axis=1)
                print('Warning: Sample is only approximately distributed.')

        # finish sampling and postprocess the samples!
        order = self.perm.argsort(axis=0)
        rv = rv[:, :n]
        rv = self.unscaled_L @ rv
        rv = rv[order, :]

        # retransfer to original mean
        rv += np.tile(self.orig_mu.reshape(self.dim, 1), (1, rv.shape[-1]))  # Z = X + mu
        return rv
    
    def compute_factors(self):
        # compute permutated Cholesky factor and solve optimization

        # Cholesky decomposition of matrix with permuation
        self.unscaled_L, self.perm = self.colperm()
        D = np.diag(self.unscaled_L)
        if np.any(D < self.eps):
            print('Warning: Method might fail as covariance matrix is singular!')

        # rescale
        scaled_L = self.unscaled_L / np.tile(D.reshape(self.dim, 1), (1, self.dim))
        self.lb = self.lb / D
        self.ub = self.ub / D

        # remove diagonal
        self.L = scaled_L - np.eye(self.dim)

        # get gradient/Jacobian function
        gradpsi = self.get_gradient_function()
        x0 = np.zeros(2 * (self.dim - 1))

        # find optimal tilting parameter non-linear equation solver
        sol = optimize.root(gradpsi, x0, args=(self.L, self.lb, self.ub), method='hybr', jac=True)
        if not sol.success:
            print('Warning: Method may fail as covariance matrix is close to singular!')
        self.x = sol.x[:self.dim - 1]
        self.mu = sol.x[self.dim - 1:]

        # compute psi star
        self.psistar = self.psy(self.x, self.mu)
        
    def reset(self):
        # reset factors -> when sampling, optimization for optimal tilting parameters is performed again

        # permutated
        self.lb = self.orig_lb - self.orig_mu  # move distr./bounds to have zero mean
        self.ub = self.orig_ub - self.orig_mu

        # scaled Cholesky with zero diagonal, permutated
        self.L = np.empty_like(self.cov)
        self.unscaled_L = np.empty_like(self.cov)

        # placeholder for optimization
        self.perm = None
        self.x = None
        self.mu = None
        self.psistar = None

    def mvnrnd(self, n, mu):
        # generates the proposals from the exponentially tilted sequential importance sampling pdf
        # output:     logpr, log-likelihood of sample
        #             Z, random sample
        mu = np.append(mu, [0.])
        Z = np.zeros((self.dim, n))
        logpr = 0
        for k in range(self.dim):
            # compute matrix multiplication L @ Z
            col = self.L[k, :k] @ Z[:k, :]
            # compute limits of truncation
            tl = self.lb[k] - mu[k] - col
            tu = self.ub[k] - mu[k] - col
            # simulate N(mu,1) conditional on [tl,tu]
            Z[k, :] = mu[k] + self.trandn(tl, tu)
            # update likelihood ratio
            logpr += lnNormalProb(tl, tu) + .5 * mu[k] ** 2 - mu[k] * Z[k, :]
        return logpr, Z

    def trandn(self, lb, ub):
        """
        Sample generator for the truncated standard multivariate normal distribution :math:`X \sim N(0,I)` s.t.
        :math:`lb<X<ub`.

        If you wish to simulate a random variable 'Z' from the non-standard Gaussian :math:`N(m,s^2)`
        conditional on :math:`lb<Z<ub`, then first simulate x=TruncatedMVNSampler.trandn((l-m)/s,(u-m)/s) and set
        Z=m+s*x.
        Infinite values for 'ub' and 'lb' are accepted.

        :param np.ndarray lb: (size D) lower bound constrain of the normal distribution :math:`\mathbf lb`.
        :param np.ndarray ub: (size D) upper bound constrain of the normal distribution :math:`\mathbf lb`.

        :return: D samples if the truncated normal distribition x ~ N(0, I) subject to lb < x < ub.
        :rtype: np.ndarray
        """
        if not len(lb) == len(ub):
            raise RuntimeError("Lower bound (lb) and upper bound (ub) must be of the same length!")

        x = np.empty_like(lb)
        a = 0.66  # threshold used in MATLAB implementation
        # three cases to consider
        # case 1: a<lb<ub
        I = lb > a
        if np.any(I):
            tl = lb[I]
            tu = ub[I]
            x[I] = self.ntail(tl, tu)
        # case 2: lb<ub<-a
        J = ub < -a
        if np.any(J):
            tl = -ub[J]
            tu = -lb[J]
            x[J] = - self.ntail(tl, tu)
        # case 3: otherwise use inverse transform or accept-reject
        I = ~(I | J)
        if np.any(I):
            tl = lb[I]
            tu = ub[I]
            x[I] = self.tn(tl, tu)
        return x

    def tn(self, lb, ub, tol=2):
        # samples a column vector of length=len(lb)=len(ub) from the standard multivariate normal distribution
        # truncated over the region [lb,ub], where -a<lb<ub<a for some 'a' and lb and ub are column vectors
        # uses acceptance rejection and inverse-transform method

        sw = tol  # controls switch between methods, threshold can be tuned for maximum speed for each platform
        x = np.empty_like(lb)
        # case 1: abs(ub-lb)>tol, uses accept-reject from randn
        I = abs(ub - lb) > sw
        if np.any(I):
            tl = lb[I]
            tu = ub[I]
            x[I] = self.trnd(tl, tu)

        # case 2: abs(u-l)<tol, uses inverse-transform
        I = ~I
        if np.any(I):
            tl = lb[I]
            tu = ub[I]
            pl = special.erfc(tl / np.sqrt(2)) / 2
            pu = special.erfc(tu / np.sqrt(2)) / 2
            x[I] = np.sqrt(2) * special.erfcinv(2 * (pl - (pl - pu) * self.random_state.rand(len(tl))))
        return x

    def trnd(self, lb, ub):
        # uses acceptance rejection to simulate from truncated normal
        x = self.random_state.randn(len(lb))  # sample normal
        test = (x < lb) | (x > ub)
        I = np.where(test)[0]
        d = len(I)
        while d > 0:  # while there are rejections
            ly = lb[I]
            uy = ub[I]
            y = self.random_state.randn(len(uy))  # resample
            idx = (y > ly) & (y < uy)  # accepted
            x[I[idx]] = y[idx]
            I = I[~idx]
            d = len(I)
        return x

    def ntail(self, lb, ub):
        # samples a column vector of length=len(lb)=len(ub) from the standard multivariate normal distribution
        # truncated over the region [lb,ub], where lb>0 and lb and ub are column vectors
        # uses acceptance-rejection from Rayleigh distr. similar to Marsaglia (1964)
        if not len(lb) == len(ub):
            raise RuntimeError("Lower bound (lb) and upper bound (ub) must be of the same length!")
        c = (lb ** 2) / 2
        n = len(lb)
        f = np.expm1(c - ub ** 2 / 2)
        x = c - np.log(1 + self.random_state.rand(n) * f)  # sample using Rayleigh
        # keep list of rejected
        I = np.where(self.random_state.rand(n) ** 2 * x > c)[0]
        d = len(I)
        while d > 0:  # while there are rejections
            cy = c[I]
            y = cy - np.log(1 + self.random_state.rand(d) * f[I])
            idx = (self.random_state.rand(d) ** 2 * y) < cy  # accepted
            x[I[idx]] = y[idx]  # store the accepted
            I = I[~idx]  # remove accepted from the list
            d = len(I)
        return np.sqrt(2 * x)  # this Rayleigh transform can be delayed till the end

    def psy(self, x, mu):
        # implements psi(x,mu); assumes scaled 'L' without diagonal
        x = np.append(x, [0.])
        mu = np.append(mu, [0.])
        c = self.L @ x
        lt = self.lb - mu - c
        ut = self.ub - mu - c
        p = np.sum(lnNormalProb(lt, ut) + 0.5 * mu ** 2 - x * mu)
        return p

    def get_gradient_function(self):
        # wrapper to avoid dependancy on self

        def gradpsi(y, L, l, u):
            # implements gradient of psi(x) to find optimal exponential twisting, returns also the Jacobian
            # NOTE: assumes scaled 'L' with zero diagonal
            d = len(u)
            c = np.zeros(d)
            mu, x = c.copy(), c.copy()
            x[0:d - 1] = y[0:d - 1]
            mu[0:d - 1] = y[d - 1:]

            # compute now ~l and ~u
            c[1:d] = L[1:d, :] @ x
            lt = l - mu - c
            ut = u - mu - c

            # compute gradients avoiding catastrophic cancellation
            w = lnNormalProb(lt, ut)
            pl = np.exp(-0.5 * lt ** 2 - w) / np.sqrt(2 * math.pi)
            pu = np.exp(-0.5 * ut ** 2 - w) / np.sqrt(2 * math.pi)
            P = pl - pu

            # output the gradient
            dfdx = - mu[0:d - 1] + (P.T @ L[:, 0:d - 1]).T
            dfdm = mu - x + P
            grad = np.concatenate((dfdx, dfdm[:-1]), axis=0)

            # construct jacobian
            lt[np.isinf(lt)] = 0
            ut[np.isinf(ut)] = 0

            dP = - P ** 2 + lt * pl - ut * pu
            DL = np.tile(dP.reshape(d, 1), (1, d)) * L
            mx = DL - np.eye(d)
            xx = L.T @ DL
            mx = mx[:-1, :-1]
            xx = xx[:-1, :-1]
            J = np.block([[xx, mx.T],
                          [mx, np.diag(1 + dP[:-1])]])
            return (grad, J)

        return gradpsi

    def colperm(self):
        perm = np.arange(self.dim)
        L = np.zeros_like(self.cov)
        z = np.zeros_like(self.orig_mu)

        for j in perm.copy():
            pr = np.ones_like(z) * np.inf  # compute marginal prob.
            I = np.arange(j, self.dim)  # search remaining dimensions
            D = np.diag(self.cov)
            s = D[I] - np.sum(L[I, 0:j] ** 2, axis=1)
            s[s < 0] = self.eps
            s = np.sqrt(s)
            tl = (self.lb[I] - L[I, 0:j] @ z[0:j]) / s
            tu = (self.ub[I] - L[I, 0:j] @ z[0:j]) / s
            pr[I] = lnNormalProb(tl, tu)
            # find smallest marginal dimension
            k = np.argmin(pr)

            # flip dimensions k-->j
            jk = [j, k]
            kj = [k, j]
            self.cov[jk, :] = self.cov[kj, :]  # update rows of cov
            self.cov[:, jk] = self.cov[:, kj]  # update cols of cov
            L[jk, :] = L[kj, :]  # update only rows of L
            self.lb[jk] = self.lb[kj]  # update integration limits
            self.ub[jk] = self.ub[kj]  # update integration limits
            perm[jk] = perm[kj]  # keep track of permutation

            # construct L sequentially via Cholesky computation
            s = self.cov[j, j] - np.sum(L[j, 0:j] ** 2, axis=0)
            if s < -0.01:
                raise RuntimeError("Sigma is not positive semi-definite")
            elif s < 0:
                s = self.eps
            L[j, j] = np.sqrt(s)
            new_L = self.cov[j + 1:self.dim, j] - L[j + 1:self.dim, 0:j] @ L[j, 0:j].T
            L[j + 1:self.dim, j] = new_L / L[j, j]

            # find mean value, z(j), of truncated normal
            tl = (self.lb[j] - L[j, 0:j - 1] @ z[0:j - 1]) / L[j, j]
            tu = (self.ub[j] - L[j, 0:j - 1] @ z[0:j - 1]) / L[j, j]
            w = lnNormalProb(tl, tu)  # aids in computing expected value of trunc. normal
            z[j] = (np.exp(-.5 * tl ** 2 - w) - np.exp(-.5 * tu ** 2 - w)) / np.sqrt(2 * math.pi)
        return L, perm


def lnNormalProb(a, b):
    # computes ln(P(a<Z<b)) where Z~N(0,1) very accurately for any 'a', 'b'
    p = np.zeros_like(a)
    # case b>a>0
    I = a > 0
    if np.any(I):
        pa = lnPhi(a[I])
        pb = lnPhi(b[I])
        p[I] = pa + np.log1p(-np.exp(pb - pa))
    # case a<b<0
    idx = b < 0
    if np.any(idx):
        pa = lnPhi(-a[idx])  # log of lower tail
        pb = lnPhi(-b[idx])
        p[idx] = pb + np.log1p(-np.exp(pa - pb))
    # case a < 0 < b
    I = (~I) & (~idx)
    if np.any(I):
        pa = special.erfc(-a[I] / np.sqrt(2)) / 2  # lower tail
        pb = special.erfc(b[I] / np.sqrt(2)) / 2  # upper tail
        p[I] = np.log1p(-pa - pb)
    return p


def lnPhi(x):
    # computes logarithm of  tail of Z~N(0,1) mitigating numerical roundoff errors
    out = -0.5 * x ** 2 - np.log(2) + np.log(special.erfcx(x / np.sqrt(2)) + EPS)  # divide by zeros error -> add eps
    return out


#mu and covariance based on our predictions
random_samples = TruncatedMVN(mean_predictions, cov_matrix, lower_bounds, upper_bounds).sample(100000)

new_predictions_df['margins_new'] = random_samples.tolist()

#Now need to add additional rows for house, senate, and president
senate_samples = random_samples[new_predictions_df['office_type'] == 'Senate']
US_senate = np.sum(senate_samples >= 0, axis = 0) + 30 #of the races we're not predicting, the margin is -10

house_samples = random_samples[new_predictions_df['office_type'] == 'House']
US_house = np.sum(house_samples >= 0, axis = 0) + 27

electoral_votes = pd.read_csv('../cleaned_data/AWS_Data/Electoral Votes Sheet.csv')
president_samples = random_samples[new_predictions_df['office_type'] == 'President']

presidential_df = new_predictions_df[new_predictions_df['office_type'] == 'President']
presidential_df = presidential_df.join(electoral_votes.set_index(['state', 'district']), on = ['state', 'district'])

# Assuming president_samples is correctly filtered for presidential predictions
# Reshape the electoral votes to be broadcastable across the simulations
electoral_votes_broadcastable = presidential_df['electoral_votes'].values[:, np.newaxis]

# Now, president_samples should be shaped (52, number of simulations)
# Broadcast multiplication across simulations
democratic_electoral_votes = (president_samples >= 0) * electoral_votes_broadcastable

# Sum across states for each simulation
US_president = np.sum(democratic_electoral_votes, axis=0)

US_rows = pd.DataFrame(
    data = {
        'state': ['US', 'US', 'US'], 
        'district': [0, 0, 0],
        'office_type': ['Senate', 'House', 'President'],
        'threshold_winning': [50, 217.5, 269],
        'margins_new': [US_senate.tolist(), US_house.tolist(), US_president.tolist()]
    }
)
new_predictions_df['threshold_winning'] = 0
new_predictions_df = pd.concat([new_predictions_df, US_rows], axis = 'rows')

predictions_df = original_predictions_df.join(new_predictions_df.set_index(['state', 'district', 'office_type']), on = ['state', 'district', 'office_type'])
#Getting the number of simulations where each party wins
predictions_df['dem_winning_pct_eday'] = predictions_df.apply(
    lambda x: np.sum(np.array(x['margins_new']) > x['threshold_winning']), axis = 1)
predictions_df['rep_winning_pct_eday'] = predictions_df.apply(
    lambda x: np.sum(np.array(x['margins_new']) < x['threshold_winning']), axis = 1)
predictions_df['tie_pct_eday'] = predictions_df.apply(
    lambda x: np.sum(np.array(x['margins_new']) == x['threshold_winning']), axis = 1)

predictions_df = predictions_df.drop(columns = ['margins_new', 'threshold_winning'])

#Final predictions, to go to the old AWS dataframe!
predictions_df.to_csv('../cleaned_data/AWS_data/LivePredictions.csv', index = False)