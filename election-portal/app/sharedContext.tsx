'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  SharedInfo,
  State,
  Year,
  RaceType,
  Demographic,
} from '../types/SharedInfoType';
import { useQuery } from 'react-query';
import axios from 'axios';
import { ElectionData } from '@/types/data';

const fetchRaceData = async (): Promise<Map<string, ElectionData>> => {
  try {
    const response = await axios.get<ElectionData[]>(
      'https://ti2579xmyi.execute-api.us-east-1.amazonaws.com/active?table=race'
    );

    // Convert the array to a Map, using a unique identifier as the key
    const electionDataMap = new Map<string, ElectionData>();
    response.data.forEach((item) => {
      var newItem: ElectionData = {
        Democratic_name: item.Democratic_name,
        rep_votes: item.rep_votes,
        office_type: item.office_type,
        state: item.state,
        district: item.district,
        Republican_name: item.Republican_name,
        pct_reporting: item.pct_reporting,
        dem_votes: item.dem_votes,
        dem_votes_pct: item.dem_votes_pct,
        rep_votes_pct: item.rep_votes_pct,
        swing: item.swing,
        margin_pct: item.margin_pct,
        officetype_district_state: item.officetype_district_state,
      };
      electionDataMap.set(item.officetype_district_state, newItem);
    });

    electionDataMap.forEach((key, item) => {
      console.log(key, item);
    });
    return electionDataMap;
  } catch (error) {
    console.error('Error fetching race data:', error);
    throw error;
  }
};

function getYearsFromBreakdown(breakdown: RaceType): Year[] {
  switch (breakdown) {
    case RaceType.Presidential:
      return [Year.Twenty, Year.Sixteen];
    case RaceType.Senate:
      return [Year.Eighteen, Year.Twelve];
    default:
      return [Year.TwentyTwo, Year.Twenty, Year.Eighteen, Year.Sixteen];
  }
}

interface SharedStateContextProps {
  state: SharedInfo;
}

const SharedStateContext = createContext<SharedStateContextProps | undefined>(
  undefined
);

export const SharedStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  const [page, setPage] = useState<string>('/');
  const setCurrentPage = (page: string) => {
    setPage(page);
    router.push(page);
  };
  const [view, setView] = useState<State>(State.National);
  const [level, setLevel] = useState<'county' | 'state' | 'national'>(
    'national'
  );
  const exitLevel = () => {
    if (level === 'county') {
      setLevel('state');
    } else if (level === 'state') {
      setLevel('national');
      setView(State.National);
    } else if (level === 'national') {
      setCurrentPage('/');
    }
  };
  const [drawMode, setDrawMode] = useState<boolean>(false);
  const toggleDraw = () => setDrawMode(!drawMode);
  const [breakdown, setBreakdown] = useState<RaceType>(RaceType.Presidential);
  const [availableBreakdowns, setAvailableBreakdowns] = useState<RaceType[]>([
    RaceType.Presidential,
    RaceType.Senate,
    RaceType.Gubernatorial,
  ]);
  const breakdownSwitch = (breakdown: RaceType) => {
    setAvailableYears(getYearsFromBreakdown(breakdown));
    setBreakdown(breakdown);
  };
  const [year, setYear] = useState<Year>(Year.Twenty);
  const [availableYears, setAvailableYears] = useState<Year[]>(
    getYearsFromBreakdown(breakdown)
  );
  const yearSwitch = (year: Year) => {
    setYear(year);
  };

  const [demographic, setDemographic] = useState<Demographic>(Demographic.Age);
  const [availableDemographics, setAvailibleDemographics] = useState<
    Demographic[]
  >([]);
  const demographicSwitch = (demographic: Demographic) => {
    if (availableDemographics.includes(demographic)) {
      setDemographic(demographic);
    }
  };
  const {
    data: electionData,
    isLoading: electionDataLoading,
    error: electionDataError,
  } = useQuery<Map<string, ElectionData>, Error>('raceData', fetchRaceData);

  const state: SharedInfo = {
    page,
    setCurrentPage,
    view,
    setView,
    level,
    setLevel,
    exitLevel,
    drawMode,
    toggleDraw,
    breakdown,
    availableBreakdowns,
    setAvailableBreakdowns,
    breakdownSwitch,
    year,
    availableYears,
    setAvailableYears,
    yearSwitch,
    demographic,
    demographicSwitch,
    availableDemographics,
    setAvailibleDemographics,
    electionData,
    electionDataError,
    electionDataLoading,
  };

  return (
    <SharedStateContext.Provider value={{ state }}>
      {children}
    </SharedStateContext.Provider>
  );
};

export const useSharedState = (): SharedStateContextProps => {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};
