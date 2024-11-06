'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
import {
  ExitPollAnswer,
  ExitPollData,
  HistoricalCountyData,
  HistoricalElectionData,
} from '../../types/data';
import styles from './page.module.css';
import Menubar from '../modules/menubar/menubar';
import { useSharedState } from '../sharedContext';
import Canvas from '../modules/canvas/canvas';
import { getDataVersion, RaceType } from '@/types/RaceType';
import { Year } from '@/types/Year';
import { Demographic } from '@/types/Demographic';
import EXMap from './modules/EXMap';
import Banner from '../election-breakdown/modules/banner';
import StatsTable from './modules/statistics-table';
import {
  getStateAbbreviation,
  getStateFromAbbreviation,
  State,
} from '@/types/State';
import StateMap from '../election-breakdown/modules/stateMap';

const senate2020Data = [
  { state: 'OR', margin_pct_1: 1 },
  { state: 'ID', margin_pct_1: -1 },
  { state: 'MT', margin_pct_1: -1 },
  { state: 'WY', margin_pct_1: -1 },
  { state: 'SD', margin_pct_1: -1 },
  { state: 'NE', margin_pct_1: -1 },
  { state: 'IA', margin_pct_1: -1 },
  { state: 'KS', margin_pct_1: -1 },
  { state: 'OK', margin_pct_1: -1 },
  { state: 'TX', margin_pct_1: -1 },
  { state: 'AR', margin_pct_1: -1 },
  { state: 'LA', margin_pct_1: -1 },
  { state: 'AL', margin_pct_1: -1 },
  { state: 'MS', margin_pct_1: -1 },
  { state: 'TN', margin_pct_1: -1 },
  { state: 'KY', margin_pct_1: -1 },
  { state: 'WV', margin_pct_1: -1 },
  { state: 'NC', margin_pct_1: -1 },
  { state: 'SC', margin_pct_1: -1 },
  { state: 'ME', margin_pct_1: -1 },
  { state: 'AK', margin_pct_1: -1 },
  { state: 'CO', margin_pct_1: 1 },
  { state: 'AZ', margin_pct_1: 1 },
  { state: 'NM', margin_pct_1: 1 },
  { state: 'IL', margin_pct_1: 1 },
  { state: 'MN', margin_pct_1: 1 },
  { state: 'MI', margin_pct_1: 1 },
  { state: 'GA', margin_pct_1: 1 },
  { state: 'VA', margin_pct_1: 1 },
  { state: 'NH', margin_pct_1: 1 },
  { state: 'MA', margin_pct_1: 1 },
  { state: 'NJ', margin_pct_1: 1 },
  { state: 'RI', margin_pct_1: 1 },
  { state: 'DE', margin_pct_1: 1 },
];
const senate2020ToHistorical = (data2020: any[]) => {
  return data2020.map((elem) => {
    return {
      office_type: 'Senate',
      district: '',
      democratic_percent_1: -1,
      republican_percent_1: -1,
      democratic_percent_2: -1,
      republican_percent_2: -1,
      democratic_votes_1: -1,
      republican_votes_1: -1,
      democratic_votes_2: -1,
      republican_votes_2: -1,
      margin_votes_1: -1,
      margin_pct_2: -1,
      absentee_pct_1: -1,
      absentee_margin_pct_1: -1,
      ...elem,
    };
  });
};

export default function Exit_Poll_Explorer_Page() {
  const [exitPollData, setExitPollData] = useState<
    ExitPollData[] | null | undefined
  >(null);

  const [allExitPolls, setAllExitPolls] = useState<any>(null);
  const [tableData, setTableData] = useState<ExitPollAnswer[]>([]);

  const [historicalElectionsData, setHistoricalElectionsData] = useState<
    HistoricalElectionData[] | null
  >(null);
  const [filteredHistoricalElectionsData, setFilteredHistoricalElectionsData] =
    useState<HistoricalElectionData[] | null>(null);
  const [historicalCountyData, setHistoricalCountyData] = useState<
    HistoricalCountyData[] | null
  >(null);
  const sharedState = useSharedState().state;
  const [displayNational, setDisplayNational] = useState(true);

  const [tableNames, setTableNames] = useState(['', '']);

  // When sharedState.level changes wait 250ms before changing display state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sharedState.level == 'national') {
        setDisplayNational(true);
      } else {
        setDisplayNational(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [sharedState.level, displayNational]);

  // State Mode While National
  const SMWN = sharedState.view != State.National && displayNational;

  useEffect(() => {
    const wrapperDiv = document?.getElementById('mapWrapper');
    const EXMapDiv = document?.getElementById('EXContainer');
    wrapperDiv?.addEventListener('click', function (event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });
    EXMapDiv?.addEventListener('click', function (event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });
  }, [sharedState]);

  const setHistoricalData = () => {
    if (
      sharedState.year === Year.Twenty &&
      sharedState.breakdown === RaceType.Senate
    ) {
      setHistoricalElectionsData(senate2020ToHistorical(senate2020Data));
      return;
    }
    const storedElectionsData = sessionStorage.getItem(
      'historicalElectionsData'
    );
    const storedCountyData = sessionStorage.getItem('historicalCountyData');

    // Load Historical Elections Data
    if (storedElectionsData) {
      setHistoricalElectionsData(
        JSON.parse(storedElectionsData) as HistoricalElectionData[]
      );
    } else {
      fetch('/cleaned_data/historical_elections.csv')
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedElectionData: HistoricalElectionData[] =
                results.data.map((row: any, index: number) => {
                  return {
                    index: parseInt(row.index),
                    office_type: row.office_type,
                    state: row.state,
                    district: row.district,
                    margin_pct_1: parseFloat(row.margin_pct_1),
                    margin_votes_1: parseInt(row.margin_votes_1),
                    margin_pct_2: parseFloat(row.margin_pct_2),
                    absentee_pct_1: parseFloat(row.absentee_pct_1),
                    democratic_percent_1: parseFloat(row.democratic_percent_1),
                    republican_percent_1: parseFloat(row.republican_percent_1),
                    democratic_percent_2: parseFloat(row.democratic_percent_2),
                    republican_percent_2: parseFloat(row.republican_percent_2),
                    democratic_votes_1: parseInt(row.democratic_votes_1),
                    republican_votes_1: parseInt(row.republican_votes_1),
                    democratic_votes_2: parseInt(row.democratic_votes_2),
                    republican_votes_2: parseInt(row.republican_votes_2),
                    absentee_margin_pct_1: parseFloat(
                      row.absentee_margin_pct_1
                    ),
                  };
                });
              setHistoricalElectionsData(parsedElectionData);
              sessionStorage.setItem(
                'historicalElectionsData',
                JSON.stringify(parsedElectionData)
              );
            },
          });
        })
        .catch((error) =>
          console.error('Error loading historical elections data:', error)
        );
    }

    // Load Historical County Data
    if (storedCountyData) {
      setHistoricalCountyData(
        JSON.parse(storedCountyData) as HistoricalCountyData[]
      );
    } else {
      fetch('/cleaned_data/historical_county.csv')
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedCountyData: HistoricalCountyData[] = results.data.map(
                (row: any, index: number) => {
                  return {
                    county: row.county,
                    office_type: row.office_type,
                    district: row.district,
                    state: row.state,
                    fips: row.fips,
                    margin_votes_1: parseInt(row.margin_votes_1),
                    margin_pct_1: parseFloat(row.margin_pct_1),
                    absentee_pct_1: parseFloat(row.absentee_pct_1),
                    absentee_margin_pct_1: parseFloat(
                      row.absentee_margin_pct_1
                    ),
                    margin_pct_2: parseFloat(row.margin_pct_2),
                    margin_votes_2: parseInt(row.margin_votes_2),
                    democratic_percent_1: parseFloat(row.democratic_percent_1),
                    republican_percent_1: parseFloat(row.republican_percent_1),
                    democratic_percent_2: parseFloat(row.democratic_percent_2),
                    republican_percent_2: parseFloat(row.republican_percent_2),
                    democratic_votes_1: parseInt(row.democratic_votes_1),
                    republican_votes_1: parseInt(row.republican_votes_1),
                    democratic_votes_2: parseInt(row.democratic_votes_2),
                    republican_votes_2: parseInt(row.republican_votes_2),
                  };
                }
              );
              setHistoricalCountyData(parsedCountyData);
              sessionStorage.setItem(
                'historicalCountyData',
                JSON.stringify(parsedCountyData)
              );
            },
          });
        })
        .catch((error) =>
          console.error('Error loading historical county data:', error)
        );
    }
  };

  const filterHistoricalData = () => {
    const statesWithExitPolls = (datum: HistoricalElectionData) => {
      if (datum.state) {
        const stateName = getStateFromAbbreviation(datum.state);
        if (
          sharedState.demographic == Demographic.Age &&
          sharedState.breakdown == RaceType.Presidential
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.California ||
            stateName === State.Colorado ||
            stateName === State.Florida ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Maine ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Montana ||
            stateName === State.Nevada ||
            stateName === State.NewHampshire ||
            stateName === State.NewYork ||
            stateName === State.NorthCarolina ||
            stateName === State.Ohio ||
            stateName === State.Oregon ||
            stateName === State.Pennsylvania ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia ||
            stateName === State.Washington ||
            stateName === State.Wisconsin
          );
        } else if (
          sharedState.demographic == Demographic.Age &&
          sharedState.breakdown == RaceType.Senate
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.Colorado ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Maine ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Montana ||
            stateName === State.NewHampshire ||
            stateName === State.NorthCarolina ||
            stateName === State.Oregon ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia
          );
        } else if (
          sharedState.demographic == Demographic.AreaType &&
          sharedState.breakdown == RaceType.Presidential
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.Colorado ||
            stateName === State.Florida ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Nevada ||
            stateName === State.NewHampshire ||
            stateName === State.NorthCarolina ||
            stateName === State.Ohio ||
            stateName === State.Oregon ||
            stateName === State.Pennsylvania ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia ||
            stateName === State.Washington ||
            stateName === State.Wisconsin
          );
        } else if (
          sharedState.demographic == Demographic.AreaType &&
          sharedState.breakdown == RaceType.Senate
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.Colorado ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Maine ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.NewHampshire ||
            stateName === State.NorthCarolina ||
            stateName === State.Oregon ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia
          );
        } else if (
          sharedState.demographic == Demographic.Education &&
          sharedState.breakdown == RaceType.Presidential
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.California ||
            stateName === State.Colorado ||
            stateName === State.Florida ||
            stateName === State.Georgia ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Nevada ||
            stateName === State.NewYork ||
            stateName === State.NorthCarolina ||
            stateName === State.Ohio ||
            stateName === State.Pennsylvania ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia ||
            stateName === State.Wisconsin
          );
        } else if (
          sharedState.demographic == Demographic.Education &&
          sharedState.breakdown == RaceType.Senate
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.Colorado ||
            stateName === State.Georgia ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.NorthCarolina ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia
          );
        } else if (
          sharedState.demographic == Demographic.Gender &&
          sharedState.breakdown == RaceType.Presidential
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.California ||
            stateName === State.Colorado ||
            stateName === State.Florida ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Maine ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Montana ||
            stateName === State.Nevada ||
            stateName === State.NewHampshire ||
            stateName === State.NewYork ||
            stateName === State.NorthCarolina ||
            stateName === State.Ohio ||
            stateName === State.Oregon ||
            stateName === State.Pennsylvania ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia ||
            stateName === State.Washington ||
            stateName === State.Wisconsin
          );
        } else if (
          sharedState.demographic == Demographic.Gender &&
          sharedState.breakdown == RaceType.Senate
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.Colorado ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Maine ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Montana ||
            stateName === State.NewHampshire ||
            stateName === State.NorthCarolina ||
            stateName === State.Oregon ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia
          );
        } else if (
          sharedState.demographic == Demographic.Income &&
          sharedState.breakdown == RaceType.Presidential
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.California ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Nevada ||
            stateName === State.NewHampshire ||
            stateName === State.NorthCarolina ||
            stateName === State.Oregon ||
            stateName === State.Pennsylvania ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia ||
            stateName === State.Wisconsin
          );
        } else if (
          sharedState.demographic == Demographic.Income &&
          sharedState.breakdown == RaceType.Senate
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.NewHampshire ||
            stateName === State.NorthCarolina ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia
          );
        } else if (
          sharedState.demographic == Demographic.Race &&
          sharedState.breakdown == RaceType.Presidential
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.California ||
            stateName === State.Colorado ||
            stateName === State.Florida ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Maine ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Montana ||
            stateName === State.Nevada ||
            stateName === State.NewHampshire ||
            stateName === State.NewYork ||
            stateName === State.NorthCarolina ||
            stateName === State.Ohio ||
            stateName === State.Pennsylvania ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia ||
            stateName === State.Washington ||
            stateName === State.Wisconsin
          );
        } else if (
          sharedState.demographic == Demographic.Race &&
          sharedState.breakdown == RaceType.Senate
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.Colorado ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Maine ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Montana ||
            stateName === State.NewHampshire ||
            stateName === State.NorthCarolina ||
            stateName === State.SouthCarolina ||
            stateName === State.Texas ||
            stateName === State.Virginia
          );
        } else {
          return;
        }
      }
    };
    if (historicalElectionsData) {
      setFilteredHistoricalElectionsData(
        historicalElectionsData?.filter(statesWithExitPolls)
      );
    }
  };

  useEffect(() => {
    setHistoricalData();
  }, [sharedState.year, sharedState.breakdown, sharedState.demographic]);

  useEffect(() => {
    filterHistoricalData();
  }, [
    historicalElectionsData,
    sharedState.breakdown,
    sharedState.year,
    sharedState.demographic,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistoricalData();
      filterHistoricalData();
    }, 3000);

    return () => {
      
      setHistoricalData();
      filterHistoricalData();
      clearTimeout(timer)
    };
  }, []);

  // attempt to fix the menubar rendering issue
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Ensure sharedState exists before accessing it
      //console.log('Setting available menubar options');
      sharedState.setAvailableBreakdowns([
        RaceType.Presidential,
        RaceType.Senate,
      ]);
      sharedState.breakdownSwitch(RaceType.Presidential);
      sharedState.yearSwitch(Year.TwentyFour);
      sharedState.setAvailibleDemographics([
        Demographic.Age,
        Demographic.Gender,
        Demographic.Race,
        Demographic.Education,
        Demographic.Income,
        Demographic.AreaType,
      ]);
      sharedState.demographicSwitch(Demographic.Age);
      initialized.current = true;
    }
  }, [sharedState]);

  useEffect(() => {
    sharedState.setAvailableYears([Year.TwentyFour, Year.Twenty]);
  }, [sharedState.breakdown]);

  const fetchPollData = () => {
    switch (sharedState.year) {
      case Year.TwentyFour:
        fetch2024PollData();
        break;
      case Year.Twenty:
      default:
        fetch2020PollData();
        break;
    }
  };
  // Second useEffect for exit poll data loading
  useEffect(() => {
    fetchPollData();
  }, [sharedState.yearSwitch]);

  const fetch2020PollData = () => {
    const storedExitPollData = sessionStorage.getItem('exitPollData');

    if (storedExitPollData) {
      setExitPollData(JSON.parse(storedExitPollData) as ExitPollData[]);
    } else {
      // Fetch the CSV data and log the response
      fetch('/cleaned_data/CNN_exit_polls_2020.csv')
        .then((response) => {
          return response.text();
        })
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              const parsedData: ExitPollData[] = results.data.map(
                (row: any, index: number) => {
                  return {
                    state: row.state,
                    office_type: row.office_type,
                    question: row.question,
                    answer: row.answer,
                    demographic_pct: parseFloat(row.demographic_pct),
                    answer_pct: parseFloat(row.answer_pct),
                    lastName: row.lastName,
                  };
                }
              );
              setExitPollData(parsedData);
              sessionStorage.setItem(
                'exitPollData',
                JSON.stringify(parsedData)
              );
            },
          });
        })
        .catch((error) =>
          console.error('Error loading exit poll data:', error)
        );
    }
  };

  const fetch2024PollData = () => {
    const fetchedData = sharedState.exitPollData?.get(
      getStateAbbreviation(sharedState.view) +
        getDataVersion(sharedState.breakdown) +
        sharedState.demographic
    );
    setExitPollData(fetchedData);
  };


  const fetch2024MapData = () => {};

  const loadTableData = (race: string) => {
    const dataMap = new Map();
    const nameFrequencyMap: Map<string, number> = new Map();

    exitPollData?.forEach((datum: ExitPollData) => {
      if (
        datum.state === getStateAbbreviation(sharedState.view) &&
        datum.office_type === race &&
        datum.question === sharedState.demographic
      ) {
        if (nameFrequencyMap.has(datum.lastName)) {
          nameFrequencyMap.set(
            datum.lastName,
            nameFrequencyMap.get(datum.lastName)! + datum.answer_pct
          );
        } else {
          nameFrequencyMap.set(datum.lastName, datum.answer_pct);
        }
      }});
      const sortedNames = Array.from(nameFrequencyMap.entries()).sort(
        (a, b) => b[1] - a[1]
      );
      const [commonname1, commonname2] = sortedNames.slice(0, 2).map((entry) => entry[0]);

      exitPollData?.forEach((datum: ExitPollData) => {
        if (
          datum.state === getStateAbbreviation(sharedState.view) &&
          datum.office_type === race &&
          datum.question === sharedState.demographic
        ) {
          const existingEntry = dataMap.get(datum.answer) || {
            answer: datum.answer,
            percentVote: datum.demographic_pct,
          };

          if (datum.lastName === commonname1) {
            existingEntry.percentFirst = datum.answer_pct;
          } else if (datum.lastName === commonname2) {
            existingEntry.percentSecond = datum.answer_pct;
          }

          dataMap.set(datum.answer, existingEntry);
        }
      });

    const dataForTable = Array.from(dataMap.values());
    setTableData(dataForTable);
    setTableNames([commonname1, commonname2]);
  };

  useEffect(() => {
    let race = "";
    if (sharedState.breakdown === RaceType.Presidential) {
      race = "President";
    } else if (sharedState.breakdown === RaceType.Senate) {
      race = "Senate";
    } else if (sharedState.breakdown === RaceType.Gubernatorial) {
      race = "Governor";
    }
    loadTableData(race);
  }, [sharedState.demographic, sharedState.view, exitPollData]);

  if (!historicalCountyData || !historicalElectionsData)
    return <p>Loading Data...</p>;

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        {sharedState.drawMode ? <Canvas /> : null}
        <Banner
          align="left"
          height={2}
          wordmark={'24cast.org'}
          header=""
          message={'Exit Poll Explorer'}
        />
        <Banner
          align="left"
          height={7}
          wordmark={`${sharedState.view} | `}
          header={sharedState.demographic}
          message={sharedState.year.toString()}
        />
        <div className={styles.mapAndTable}>
          <div className={styles.mapWrapper} id="mapWrapper">
              <div
                className={styles.EXMapContainer}
                id="EXMapContainer"
              >
                <EXMap
                  historicalElectionsData={filteredHistoricalElectionsData}
                />
              </div>
          </div>
          {tableData.length != 0 && <StatsTable data={tableData} names={tableNames} />}
        </div>
        <Menubar />
      </div>
    </div>
  );
}
