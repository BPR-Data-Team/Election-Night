'use client';
import React, { useEffect, useState } from 'react';
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
import { RaceType } from '@/types/RaceType';
import { Year } from '@/types/Year';
import { Demographic } from '@/types/Demographic';
import EBMap from '../election-breakdown/modules/EBMap';
import Banner from '../election-breakdown/modules/banner';
import StatsTable from './modules/statistics-table';
import {
  getStateAbbreviation,
  getStateFromAbbreviation,
  State,
} from '@/types/State';
import StateMap from '../election-breakdown/modules/stateMap';

export default function Exit_Poll_Explorer_Page() {
  const [exitPollData, setExitPollData] = useState<ExitPollData[] | null>(null);
  const [tableData, setTableData] = useState<ExitPollAnswer[]>([]);
  const state = useSharedState().state;

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
    const EBMapDiv = document?.getElementById('EBContainer');
    wrapperDiv?.addEventListener('click', function (event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });
    EBMapDiv?.addEventListener('click', function (event) {
      if (event.target === event.currentTarget) {
        sharedState.setView(State.National);
      }
    });
  }, [sharedState]);

  const setHistoricalData = () => {
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
  }, []);

  useEffect(() => {
    filterHistoricalData();
  }, [historicalElectionsData]);

  useEffect(() => {
    // Sets the menubar options
    state.setAvailableBreakdowns([]);
    state.breakdownSwitch(RaceType.Presidential);
    state.setAvailableYears([Year.Twenty, Year.TwentyFour]);
    state.yearSwitch(Year.TwentyFour);
    state.setAvailibleDemographics([
      Demographic.Age,
      Demographic.Gender,
      Demographic.Race,
      Demographic.Education,
      Demographic.Income,
      Demographic.AreaType,
      Demographic.Region,
    ]);

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
  }, []);

  const fetch2020Data = () => {};
  const fetch2024Data = () => {};

  useEffect(() => {
    if (state.year == Year.Twenty) {
      fetch2020Data();
    } else if (state.year == Year.TwentyFour) {
      fetch2024Data();
    }
  }, [state.year]);

  useEffect(() => {
    const dataMap = new Map();

    exitPollData?.forEach((datum) => {
      if (
        datum.state === getStateAbbreviation(state.view) &&
        datum.office_type === 'President' &&
        datum.question === state.demographic
      ) {
        const existingEntry = dataMap.get(datum.answer) || {
          answer: datum.answer,
          percentVote: datum.demographic_pct,
        };

        if (datum.lastName === 'Biden') {
          existingEntry.percentBiden = datum.answer_pct;
        } else if (datum.lastName === 'Trump') {
          existingEntry.percentTrump = datum.answer_pct;
        }

        dataMap.set(datum.answer, existingEntry);
      }
    });

    const data = Array.from(dataMap.values());
    setTableData(data);
  }, [state.demographic, state.view, exitPollData]);
  console.log('exitPollData', exitPollData);
  console.log('historicalCountyData', historicalCountyData);
  console.log('historicalElectionsData', historicalElectionsData);
  if (!exitPollData || !historicalCountyData || !historicalElectionsData)
    return <p>Loading Data...</p>;

  return (
    <div className={styles.page}>
      <Menubar />
      <div className={styles.main}>
        {state.drawMode ? <Canvas /> : null}
        <Banner
          align="left"
          height={2}
          wordmark={'24cast.org'}
          header=""
          message={'Exit Poll Explainer'}
        />
        <Banner
          align="left"
          height={7}
          wordmark={`${state.view} | `}
          header={state.demographic}
          message={state.year.toString()}
        />
        <div className={styles.mapAndTable}>
          <div className={styles.mapWrapper} id="mapWrapper">
            {displayNational && (
              <div
                className={styles.EBMapContainer}
                id="EBContainer"
                style={{
                  ...(sharedState.level == 'national'
                    ? { opacity: 1 }
                    : { opacity: 0 }),
                }}
              >
                <EBMap
                  historicalElectionsData={filteredHistoricalElectionsData}
                />
              </div>
            )}
            {!displayNational && (
              <div
                className={styles.StateMapContainer}
                style={{
                  ...(sharedState.level != 'national'
                    ? { opacity: 1 }
                    : { opacity: 0 }),
                }}
              >
                <StateMap
                  year={sharedState.year}
                  raceType={sharedState.breakdown}
                  stateName={sharedState.view}
                  countyData={historicalCountyData}
                />
              </div>
            )}
          </div>
          {tableData.length != 0 && <StatsTable data={tableData} />}
        </div>
      </div>
    </div>
  );
}
