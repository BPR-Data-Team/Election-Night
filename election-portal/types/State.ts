export enum State {
  National = 'National',
  Alabama = 'Alabama',
  Alaska = 'Alaska',
  Arizona = 'Arizona',
  Arkansas = 'Arkansas',
  California = 'California',
  Colorado = 'Colorado',
  Connecticut = 'Connecticut',
  DC = 'DC',
  Delaware = 'Delaware',
  Florida = 'Florida',
  Georgia = 'Georgia',
  Hawaii = 'Hawaii',
  Idaho = 'Idaho',
  Illinois = 'Illinois',
  Indiana = 'Indiana',
  Iowa = 'Iowa',
  Kansas = 'Kansas',
  Kentucky = 'Kentucky',
  Louisiana = 'Louisiana',
  Maine = 'Maine',
  Maryland = 'Maryland',
  Massachusetts = 'Massachusetts',
  Michigan = 'Michigan',
  Minnesota = 'Minnesota',
  Mississippi = 'Mississippi',
  Missouri = 'Missouri',
  Montana = 'Montana',
  Nebraska = 'Nebraska',
  Nevada = 'Nevada',
  NewHampshire = 'New Hampshire',
  NewJersey = 'New Jersey',
  NewMexico = 'New Mexico',
  NewYork = 'New York',
  NorthCarolina = 'North Carolina',
  NorthDakota = 'North Dakota',
  Ohio = 'Ohio',
  Oklahoma = 'Oklahoma',
  Oregon = 'Oregon',
  Pennsylvania = 'Pennsylvania',
  RhodeIsland = 'Rhode Island',
  SouthCarolina = 'South Carolina',
  SouthDakota = 'South Dakota',
  Tennessee = 'Tennessee',
  Texas = 'Texas',
  Utah = 'Utah',
  Vermont = 'Vermont',
  Virginia = 'Virginia',
  Washington = 'Washington',
  WestVirginia = 'West Virginia',
  Wisconsin = 'Wisconsin',
  Wyoming = 'Wyoming',
}

export const getStateFromString = (stateName: string): State => {
  const formattedStateName = stateName.replace(/\s+/g, '');
  const state = State[formattedStateName as keyof typeof State];
  if (!state) {
    throw new Error(`Invalid state name: ${stateName}`);
  }
  return state;
};

/**
 * @returns {State[]} An array of states that have Senate races
 */
export const getSenateRaceStates = () => {
  return [
    State.National,
    State.Arizona,
    State.California,
    State.Connecticut,
    State.Delaware,
    State.Florida,
    State.Hawaii,
    State.Indiana,
    State.Maine,
    State.Maryland,
    State.Massachusetts,
    State.Michigan,
    State.Minnesota,
    State.Mississippi,
    State.Missouri,
    State.Montana,
    State.Nebraska,
    State.Nevada,
    State.NewJersey,
    State.NewMexico,
    State.NewYork,
    State.NorthDakota,
    State.Ohio,
    State.Pennsylvania,
    State.RhodeIsland,
    State.Tennessee,
    State.Texas,
    State.Utah,
    State.Vermont,
    State.Virginia,
    State.Washington,
    State.WestVirginia,
    State.Wisconsin,
    State.Wyoming,
  ];
};

/**
 * @returns {State[]} An array of states that have gubernatorial races
 */
export const getGubernatorialRaceStates = () => {
  return [
    State.Delaware,
    State.Indiana,
    State.Missouri,
    State.Montana,
    State.NewHampshire,
    State.NorthCarolina,
    State.NorthDakota,
    State.Utah,
    State.Vermont,
    State.Washington,
    State.WestVirginia,
  ];
};

export const getHouseRaceStates = () => {
  return [
    State.National,
    State.Alabama,
    State.Alaska,
    State.Arizona,
    State.Arkansas,
    State.California,
    State.Colorado,
    State.Connecticut,
    State.Delaware,
    State.Florida,
    State.Georgia,
    State.Hawaii,
    State.Idaho,
    State.Illinois,
    State.Indiana,
    State.Iowa,
    State.Kansas,
    State.Kentucky,
    State.Louisiana,
    State.Maine,
    State.Maryland,
    State.Massachusetts,
    State.Michigan,
    State.Minnesota,
    State.Mississippi,
    State.Missouri,
    State.Montana,
    State.Nebraska,
    State.Nevada,
    State.NewHampshire,
    State.NewJersey,
    State.NewMexico,
    State.NewYork,
    State.NorthCarolina,
    State.NorthDakota,
    State.Ohio,
    State.Oklahoma,
    State.Oregon,
    State.Pennsylvania,
    State.RhodeIsland,
    State.SouthCarolina,
    State.SouthDakota,
    State.Tennessee,
    State.Texas,
    State.Utah,
    State.Vermont,
    State.Virginia,
    State.Washington,
    State.WestVirginia,
    State.Wisconsin,
    State.Wyoming,
  ];
};

export const getNumDistricts = (state: State): number => {
  switch (state) {
    case State.Alabama:
      return 7;
    case State.Alaska:
      return 1;
    case State.Arizona:
      return 9;
    case State.Arkansas:
      return 4;
    case State.California:
      return 52;
    case State.Colorado:
      return 8;
    case State.Connecticut:
      return 5;
    case State.Delaware:
      return 1;
    case State.Florida:
      return 28;
    case State.Georgia:
      return 14;
    case State.Hawaii:
      return 2;
    case State.Idaho:
      return 2;
    case State.Illinois:
      return 17;
    case State.Indiana:
      return 9;
    case State.Iowa:
      return 4;
    case State.Kansas:
      return 4;
    case State.Kentucky:
      return 6;
    case State.Louisiana:
      return 6;
    case State.Maine:
      return 2;
    case State.Maryland:
      return 8;
    case State.Massachusetts:
      return 9;
    case State.Michigan:
      return 13;
    case State.Minnesota:
      return 8;
    case State.Mississippi:
      return 4;
    case State.Missouri:
      return 8;
    case State.Montana:
      return 2;
    case State.Nebraska:
      return 3;
    case State.Nevada:
      return 4;
    case State.NewHampshire:
      return 2;
    case State.NewJersey:
      return 12;
    case State.NewMexico:
      return 3;
    case State.NewYork:
      return 26;
    case State.NorthCarolina:
      return 14;
    case State.NorthDakota:
      return 1;
    case State.Ohio:
      return 15;
    case State.Oklahoma:
      return 5;
    case State.Oregon:
      return 6;
    case State.Pennsylvania:
      return 17;
    case State.RhodeIsland:
      return 2;
    case State.SouthCarolina:
      return 7;
    case State.SouthDakota:
      return 1;
    case State.Tennessee:
      return 9;
    case State.Texas:
      return 38;
    case State.Utah:
      return 4;
    case State.Vermont:
      return 1;
    case State.Virginia:
      return 11;
    case State.Washington:
      return 10;
    case State.WestVirginia:
      return 2;
    case State.Wisconsin:
      return 8;
    case State.Wyoming:
      return 1;
    default:
      return 0;
  }
};

export const getStateAbbreviation = (state: State): string => {
  switch (state) {
    case State.Alabama:
      return 'AL';
    case State.Alaska:
      return 'AK';
    case State.Arizona:
      return 'AZ';
    case State.Arkansas:
      return 'AR';
    case State.California:
      return 'CA';
    case State.Colorado:
      return 'CO';
    case State.Connecticut:
      return 'CT';
    case State.DC:
      return 'DC';
    case State.Delaware:
      return 'DE';
    case State.Florida:
      return 'FL';
    case State.Georgia:
      return 'GA';
    case State.Hawaii:
      return 'HI';
    case State.Idaho:
      return 'ID';
    case State.Illinois:
      return 'IL';
    case State.Indiana:
      return 'IN';
    case State.Iowa:
      return 'IA';
    case State.Kansas:
      return 'KS';
    case State.Kentucky:
      return 'KY';
    case State.Louisiana:
      return 'LA';
    case State.Maine:
      return 'ME';
    case State.Maryland:
      return 'MD';
    case State.Massachusetts:
      return 'MA';
    case State.Michigan:
      return 'MI';
    case State.Minnesota:
      return 'MN';
    case State.Mississippi:
      return 'MS';
    case State.Missouri:
      return 'MO';
    case State.Montana:
      return 'MT';
    case State.Nebraska:
      return 'NE';
    case State.Nevada:
      return 'NV';
    case State.NewHampshire:
      return 'NH';
    case State.NewJersey:
      return 'NJ';
    case State.NewMexico:
      return 'NM';
    case State.NewYork:
      return 'NY';
    case State.NorthCarolina:
      return 'NC';
    case State.NorthDakota:
      return 'ND';
    case State.Ohio:
      return 'OH';
    case State.Oklahoma:
      return 'OK';
    case State.Oregon:
      return 'OR';
    case State.Pennsylvania:
      return 'PA';
    case State.RhodeIsland:
      return 'RI';
    case State.SouthCarolina:
      return 'SC';
    case State.SouthDakota:
      return 'SD';
    case State.Tennessee:
      return 'TN';
    case State.Texas:
      return 'TX';
    case State.Utah:
      return 'UT';
    case State.Vermont:
      return 'VT';
    case State.Virginia:
      return 'VA';
    case State.Washington:
      return 'WA';
    case State.WestVirginia:
      return 'WV';
    case State.Wisconsin:
      return 'WI';
    case State.Wyoming:
      return 'WY';
    case State.National:
      return 'US';
    default:
      return '';
  }
};
export const getStateFromAbbreviation = (abbreviation: string): State => {
  switch (abbreviation.toUpperCase()) {
    case 'AL':
      return State.Alabama;
    case 'AK':
      return State.Alaska;
    case 'AZ':
      return State.Arizona;
    case 'AR':
      return State.Arkansas;
    case 'CA':
      return State.California;
    case 'CO':
      return State.Colorado;
    case 'CT':
      return State.Connecticut;
    case 'DC':
      return State.DC;
    case 'DE':
      return State.Delaware;
    case 'FL':
      return State.Florida;
    case 'GA':
      return State.Georgia;
    case 'HI':
      return State.Hawaii;
    case 'ID':
      return State.Idaho;
    case 'IL':
      return State.Illinois;
    case 'IN':
      return State.Indiana;
    case 'IA':
      return State.Iowa;
    case 'KS':
      return State.Kansas;
    case 'KY':
      return State.Kentucky;
    case 'LA':
      return State.Louisiana;
    case 'ME':
      return State.Maine;
    case 'MD':
      return State.Maryland;
    case 'MA':
      return State.Massachusetts;
    case 'MI':
      return State.Michigan;
    case 'MN':
      return State.Minnesota;
    case 'MS':
      return State.Mississippi;
    case 'MO':
      return State.Missouri;
    case 'MT':
      return State.Montana;
    case 'NE':
      return State.Nebraska;
    case 'NV':
      return State.Nevada;
    case 'NH':
      return State.NewHampshire;
    case 'NJ':
      return State.NewJersey;
    case 'NM':
      return State.NewMexico;
    case 'NY':
      return State.NewYork;
    case 'NC':
      return State.NorthCarolina;
    case 'ND':
      return State.NorthDakota;
    case 'OH':
      return State.Ohio;
    case 'OK':
      return State.Oklahoma;
    case 'OR':
      return State.Oregon;
    case 'PA':
      return State.Pennsylvania;
    case 'RI':
      return State.RhodeIsland;
    case 'SC':
      return State.SouthCarolina;
    case 'SD':
      return State.SouthDakota;
    case 'TN':
      return State.Tennessee;
    case 'TX':
      return State.Texas;
    case 'UT':
      return State.Utah;
    case 'VT':
      return State.Vermont;
    case 'VA':
      return State.Virginia;
    case 'WA':
      return State.Washington;
    case 'WV':
      return State.WestVirginia;
    case 'WI':
      return State.Wisconsin;
    case 'WY':
      return State.Wyoming;
    case 'US':
      return State.National;
    default:
      throw new Error('Invalid state abbreviation');
  }
};
