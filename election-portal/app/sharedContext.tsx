'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
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
import {
  CountyData,
  ElectionData,
  CalledElection,
  ExitPollData,
  RawCountyData,
  CalledElectionRaw,
} from '@/types/data';

// FETCH DDHQ RACE
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
    console.log(`Total race data entries: ${electionDataMap.size}`);
    return electionDataMap;
  } catch (error) {
    console.error('Error fetching race data:', error);
    throw error;
  }
};

// FETCH DDHQ COUNTY WITH PAGINATION
const fetchCountyData = async (): Promise<Map<string, CountyData>> => {
  const countyDataMap = new Map<string, CountyData>();
  let lastKey = null; // set lastKey as null initially

  try {
    do {
      let url =
        'https://ti2579xmyi.execute-api.us-east-1.amazonaws.com/active?table=county';
      if (lastKey) {
        const encodedLastKey = encodeURIComponent(JSON.stringify(lastKey));
        url += `&lastKey=${encodedLastKey}`;
      }
      // fetch data now
      console.log('fetching county data from API');
      const response = await axios.get<{
        items: RawCountyData[];
        lastKey: string | null;
      }>(url);
      response.data.items.forEach((item) => {
        const newItem: CountyData = {
          county: item.county,
          office_type: item.office_type,
          district: item.district,
          state: item.state,
          fips: item.fips,
          Democratic_name: item.Democratic_name,
          Republican_name: item.Republican_name,
          dem_votes: item.Democratic_votes,
          rep_votes: item.Republican_votes,
          dem_votes_pct: item.Democratic_votes_percent,
          rep_votes_pct: item.Republican_votes_percent,
          swing: item.swing,
          margin_pct: item.margin_pct,
          pct_reporting: item.pct_reporting,
          officetype_county_district_state:
            item.officetype_county_district_state,
        };
        countyDataMap.set(item.officetype_county_district_state, newItem);
      });
      lastKey = response.data.lastKey;
      console.log(
        `County data map size after last API Pull: ${countyDataMap.size}`
      );
    } while (lastKey); // continue fetching until lastKey is null

    console.log(`Total county data entries: ${countyDataMap.size}`);

    return countyDataMap;
  } catch (error) {
    console.error('Error fetching county data:', error);
    throw error;
  }
};

// FETCH LOGAN DATA
const fetchCalledElectionData = async (): Promise<
  Map<string, CalledElection>
> => {
  try {
    const response = await axios.get<CalledElectionRaw[]>(
      'https://ti2579xmyi.execute-api.us-east-1.amazonaws.com/active?table=logan'
    );
    // First, parse out state, district, and office_type from key
    // Then convert REST API response into map
    const calledElectionMap = new Map<string, CalledElection>();
    response.data.forEach((item) => {
      const state_district_office = item.state_district_office;
      const regex = /([A-Z]{2})(\d+)(.+)/;
      const match = item.state_district_office.match(regex);
      if (match) {
        // Only destructure if match is not null
        const [, state, district, office_type] = match;
        var newItem: CalledElection = {
          state: state,
          district: district,
          office_type: office_type,
          is_called: item.called,
          state_district_office: state_district_office,
        };
        calledElectionMap.set(state_district_office, newItem);
      } else {
        console.error(
          `Pattern did not match for: ${item.state_district_office}`
        );
      }
    });

    console.log(`Total logan data entries: ${calledElectionMap.size}`);
    return calledElectionMap;
  } catch (error) {
    console.error('Error fetching logan data:', error);
    throw error;
  }
};

// FETCH EXIT POLLS WITH PAGINATION
const fetchExitPollData = async (): Promise<Map<string, ExitPollData>> => {
  const exitPollMap = new Map<string, ExitPollData>();
  let lastKey = null; // set lastKey as null initially

  try {
    do {
      let url =
        'https://ti2579xmyi.execute-api.us-east-1.amazonaws.com/active?table=exit_polls';
      if (lastKey) {
        const encodedLastKey = encodeURIComponent(JSON.stringify(lastKey));
        url += `&lastKey=${encodedLastKey}`;
      }
      // fetch data now
      console.log('fetching exit poll data from API');
      const response = await axios.get<{
        items: ExitPollData[];
        lastKey: string | null;
      }>(url);
      response.data.items.forEach((item) => {
        const newItem: ExitPollData = {
          state: item.state,
          office_type: item.office_type,
          question: item.question,
          answer: item.answer,
          demographic_pct: item.demographic_pct,
          answer_pct: item.answer_pct,
          lastName: item.lastName,
        };
        exitPollMap.set(
          item.state + item.office_type + item.answer + item.lastName,
          newItem
        );
      });
      lastKey = response.data.lastKey;
      console.log(
        `Exit poll data map size after last API Pull: ${exitPollMap.size}`
      );
    } while (lastKey); // continue fetching until lastKey is null

    console.log(`Total exit poll data entries: ${exitPollMap.size}`);

    return exitPollMap;
  } catch (error) {
    console.error('Error fetching exit poll data:', error);
    throw error;
  }
};

function getYearsFromBreakdown(breakdown: RaceType): Year[] {
  switch (breakdown) {
    case RaceType.Presidential:
      return [Year.TwentyFour, Year.Twenty, Year.Sixteen];
    case RaceType.Senate:
      return [Year.TwentyFour, Year.Eighteen, Year.Twelve];
    case RaceType.Gubernatorial:
      return [Year.TwentyFour, Year.Twenty, Year.Sixteen];
    default:
      return [
        Year.TwentyFour,
        Year.TwentyTwo,
        Year.Twenty,
        Year.Eighteen,
        Year.Sixteen,
      ];
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
    setYear(Year.TwentyFour);
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

  // useQuery stuff for REST API Connection

  // RACE DATA
  const {
    data: initialElectionData,
    isLoading: electionDataLoading,
    error: electionDataError,
  } = useQuery<Map<string, ElectionData>, Error>('raceData', fetchRaceData, {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const [electionData, setElectionData] = useState<Map<string, ElectionData>>(
    initialElectionData || new Map()
  );

  // COUNTY DATA
  const {
    data: initialCountyData,
    isLoading: countyDataLoading,
    error: countyDataError,
  } = useQuery<Map<string, CountyData>, Error>('countyData', fetchCountyData, {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const [countyData, setCountyData] = useState<Map<string, CountyData>>(
    initialCountyData || new Map()
  );

  // CALLED ELECTION DATA
  const {
    data: initialCalledElectionData,
    isLoading: calledElectionDataLoading,
    error: calledElectionDataError,
  } = useQuery<Map<string, CalledElection>, Error>(
    'calledElectionData',
    fetchCalledElectionData,
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
  const [calledElectionData, setCalledElectionData] = useState<
    Map<string, CalledElection>
  >(initialCalledElectionData || new Map());

  // EXIT POLL DATA
  const {
    data: initialExitPollData,
    isLoading: exitPollDataLoading,
    error: exitPollDataError,
  } = useQuery<Map<string, ExitPollData>, Error>(
    'exitPollData',
    fetchExitPollData,
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
  const [exitPollData, setExitPollData] = useState<Map<string, ExitPollData>>(
    initialExitPollData || new Map()
  );

  // WEBSOCKET CONNECTION
  useEffect(() => {
    const socket = new WebSocket(
      // 'wss://xwzw9w5wzd.execute-api.us-east-1.amazonaws.com/test/' MOCK WEBSOCKET
      'wss://xjilt868ci.execute-api.us-east-1.amazonaws.com/prod/'
    );

    // TODO
    socket.onopen = () => {
      //Any clean up we might need to do from old websocket connection
      // not sure if there's anything?
      // issue could arise if a stream was sent between old and new connection...
      // maybe we pull from REST API between first & second message or something?
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const update = JSON.parse(event.data);

      //RACE TABLE
      if (update.tableName == 'Race_Results' && update.data.length > 0) {
        const row = update.data[0];
        const key = row.officetype_district_state;

        // Create a new object with only the required fields
        const filteredRow: ElectionData = {
          Democratic_name: row.Democratic_name,
          rep_votes: row.rep_votes,
          office_type: row.office_type,
          state: row.state,
          district: row.district,
          Republican_name: row.Republican_name,
          pct_reporting: row.pct_reporting,
          dem_votes: row.dem_votes,
          dem_votes_pct: row.dem_votes_pct,
          rep_votes_pct: row.rep_votes_pct,
          swing: row.swing,
          margin_pct: row.margin_pct,
          officetype_district_state: row.officetype_district_state,
        };

        setElectionData((prevData) => {
          const newData = new Map(prevData);
          newData.set(key, filteredRow);
          console.log(newData);
          return newData;
        });
      }

      // COUNTY TABLE
      if (update.tableName == 'County_Results' && update.data.length > 0) {
        const row = update.data[0];
        const key = row.officetype_county_district_state;

        // Create a new object with only the required fields
        const filteredRow: CountyData = {
          county: row.county,
          office_type: row.office_type,
          district: row.district,
          state: row.state,
          fips: row.fips,
          Democratic_name: row.Democratic_name,
          Republican_name: row.Republican_name,
          dem_votes: row.Democratic_votes,
          rep_votes: row.Republican_votes,
          dem_votes_pct: row.Democratic_votes_percent,
          rep_votes_pct: row.Republican_votes_percent,
          swing: row.swing,
          margin_pct: row.margin_pct,
          pct_reporting: row.pct_reporting,
          officetype_county_district_state:
            row.officetype_county_district_state,
        };

        setCountyData((prevData) => {
          const newData = new Map(prevData);
          newData.set(key, filteredRow);
          console.log(newData);
          return newData;
        });
      }

      // EXIT POLL TABLE
      if (update.tableName == 'Exit_Polls' && update.data.length > 0) {
        const row = update.data[0];
        const key = row.state_officetype_answer_lastname;

        // Create a new object with only the required fields
        const filteredRow: ExitPollData = {
          state: row.state,
          office_type: row.office_type,
          question: row.question,
          answer: row.answer,
          demographic_pct: row.demographic_pct,
          answer_pct: row.answer_pct,
          lastName: row.lastName,
        };
        setExitPollData((prevData) => {
          const newData = new Map(prevData);
          newData.set(key, filteredRow);
          console.log(newData);
          return newData;
        });
      }

      // CALLED ELECTION DATA
      if (
        update.tableName == 'Logan_Called_Elections' &&
        update.data.length > 0
      ) {
        // use regex to parse key into 3 different fields
        const row = update.data[0];
        const key = row.state_district_office;
        const regex = /([A-Z]{2})(\d+)(.+)/;
        const [, state, district, office_type] = key.match(regex);
        // create new row using assembled fields
        const assembledRow: CalledElection = {
          state: state,
          district: district,
          office_type: office_type,
          is_called: row.called,
          state_district_office: key,
        };

        setCalledElectionData((prevData) => {
          const newData = new Map(prevData);
          newData.set(key, assembledRow);
          console.log(newData);
          return newData;
        });
      }
    };

    // TODO
    socket.onclose = () => {
      //Trigger function that runs RESTAPI until we get a new websocket connection
      // reference chat for wrapping this whole function in an internal function so that we can call reconnect
      console.log('WebSocket disconnected');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    return () => {
      socket.close();
    };
  }, []);

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
    countyData,
    countyDataError,
    countyDataLoading,
    exitPollData,
    exitPollDataError,
    exitPollDataLoading,
    calledElectionData,
    calledElectionDataLoading,
    calledElectionDataError,
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
