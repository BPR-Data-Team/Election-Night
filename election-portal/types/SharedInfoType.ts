import { RaceType } from "./RaceType";
import { Year } from "./Year";
import { State } from "./State";

export type SharedInfo = {
  page: string;
  setCurrentPage: (page: string) => void;
  view: State;
  setView: (view: State) => void;
  level: "county" | "state" | "national";
  setLevel: (level: "county" | "state" | "national") => void;
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
};

export { RaceType, Year, State };
