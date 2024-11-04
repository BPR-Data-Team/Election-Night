export interface HistoricalElectionData {
  office_type: string;
  state: string;
  district: string;
  margin_pct_1: number;
  margin_votes_1: number;
  margin_pct_2: number;
  absentee_pct_1: number;
  absentee_margin_pct_1: number;
}

export interface ElectionData {
  office_type: string;
  state: string;
  district: string;
  Democratic_name: string;
  Republican_name: string;
  pct_reporting: number;
  dem_votes: number;
  rep_votes: number;
  dem_votes_pct: number;
  rep_votes_pct: number;
  swing: number;
  margin_pct: number;
  officetype_district_state: string;
}

export interface HistoricalCountyData {
  county: string;
  office_type: string;
  district: string;
  state: string;
  fips: string;
  margin_votes_1: number;
  margin_pct_1: number;
  absentee_pct_1: number;
  absentee_margin_pct_1: number;
  margin_pct_2: number;
  margin_votes_2: number;
}

// when merging into geojson, use county fips
export interface CountyData {
  county: string;
  office_type: string;
  district: string;
  state: string;
  fips: string;
  Democratic_name: string;
  Republican_name: string;
  dem_votes: number;
  rep_votes: number;
  dem_votes_pct: number;
  rep_votes_pct: number;
  swing: number;
  margin_pct: number;
  pct_reporting: number;
  officetype_county_district_state: string;
}

export interface RawCountyData {
  county: string;
  office_type: string;
  district: string;
  state: string;
  fips: string;
  Democratic_name: string;
  Republican_name: string;
  Democratic_votes: number;
  Republican_votes: number;
  Democratic_votes_percent: number;
  Republican_votes_percent: number;
  swing: number;
  margin_pct: number;
  pct_reporting: number;
  officetype_county_district_state: string;
}

export interface ExitPollData {
  state: string;
  office_type: string;
  question: string;
  answer: string;
  demographic_pct: number;
  answer_pct: number;
  lastName: string;
}

//Note: Unsure what this is doing here...
export interface ExitPollAnswer {
  state: string;
  office_type: string;
  question: string;
  answer: string;
  demographic_pct: number;
  answer_pct: number;
  lastName: string;
}

export interface RTCPresData {
  year: number;
  office_type: string;
  state: string;
  party_winner: string;
  electoral_votes: number;
  district: number;
}

// will need to parse partition key for fields
export interface CalledElection {
  state: string;
  district: string;
  office_type: string;
  is_called: string;
  state_district_office: string;
}

export interface CalledElectionRaw {
  called: string;
  state_district_office: string;
}
