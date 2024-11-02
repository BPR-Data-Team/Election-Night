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

export interface ExitPollData {
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
}
