import { RaceType } from './RaceType';
import { Year } from './Year';
import { State } from './State';
import { Demographic } from './Demographic';
import {
  CountyData,
  ElectionData,
  CalledElection,
  ExitPollData,
  electionDisplayData,
} from './data';

export type SharedInfo = {
  page: string;
  setCurrentPage: (page: string) => void;
  view: State;
  setView: (view: State) => void;
  level: 'county' | 'state' | 'national';
  setLevel: (level: 'county' | 'state' | 'national') => void;
  exitLevel: () => void;
  drawMode: boolean;
  toggleDraw: () => void;
  breakdown: RaceType;
  availableBreakdowns: RaceType[];
  setAvailableBreakdowns: (breakdowns: RaceType[]) => void;
  breakdownSwitch: (breakdown: RaceType) => void;
  year: Year;
  availableYears: Year[];
  setAvailableYears: (years: Year[]) => void;
  yearSwitch: (year: Year) => void;
  demographic: Demographic;
  demographicSwitch: (demographic: Demographic) => void;
  availableDemographics: Demographic[];
  setAvailibleDemographics: (demographics: Demographic[]) => void;
  electionData: Map<string, ElectionData> | undefined;
  electionDataLoading: boolean;
  electionDataError: Error | null;
  countyData: Map<string, CountyData> | undefined;
  countyDataLoading: boolean;
  countyDataError: Error | null;
  exitPollData: Map<string, ExitPollData[]> | undefined;
  exitPollDataLoading: boolean;
  exitPollDataError: Error | null;
  calledElectionData: Map<string, CalledElection> | undefined;
  calledElectionDataLoading: boolean;
  calledElectionDataError: Error | null;
  countyName: string;
  setCountyName: (county: string) => void;
  HistoricalCountyDataDisplayMap: Map<string, electionDisplayData>;
  fetchHistoricalCountyDataForDisplay: (historicalCountyData: any) => void;
  HistoricalElectionDataDisplayMap: Map<string, electionDisplayData>;
  fetchHistoricalElectionDataForDisplay: (historicalElectionData: any) => void;
};

export { RaceType, Year, State, Demographic };
