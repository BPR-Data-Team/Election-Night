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
import { RaceType } from '@/types/RaceType';
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
  { 'hc-key': 'us-or', state: 'OR', value: 1 },
  { 'hc-key': 'us-id', state: 'ID', value: -1 },
  { 'hc-key': 'us-mt', state: 'MT', value: -1 },
  { 'hc-key': 'us-wy', state: 'WY', value: -1 },
  { 'hc-key': 'us-sd', state: 'SD', value: -1 },
  { 'hc-key': 'us-ne', state: 'NE', value: -1 },
  { 'hc-key': 'us-ia', state: 'IA', value: -1 },
  { 'hc-key': 'us-ks', state: 'KS', value: -1 },
  { 'hc-key': 'us-ok', state: 'OK', value: -1 },
  { 'hc-key': 'us-tx', state: 'TX', value: -1 },
  { 'hc-key': 'us-ar', state: 'AR', value: -1 },
  { 'hc-key': 'us-la', state: 'LA', value: -1 },
  { 'hc-key': 'us-al', state: 'AL', value: -1 },
  { 'hc-key': 'us-ms', state: 'MS', value: -1 },
  { 'hc-key': 'us-tn', state: 'TN', value: -1 },
  { 'hc-key': 'us-ky', state: 'KY', value: -1 },
  { 'hc-key': 'us-wv', state: 'WV', value: -1 },
  { 'hc-key': 'us-nc', state: 'NC', value: -1 },
  { 'hc-key': 'us-sc', state: 'SC', value: -1 },
  { 'hc-key': 'us-me', state: 'ME', value: -1 },
  { 'hc-key': 'us-ak', state: 'AK', value: -1 },
  { 'hc-key': 'us-co', state: 'CO', value: 1 },
  { 'hc-key': 'us-az', state: 'AZ', value: 1 },
  { 'hc-key': 'us-nm', state: 'NM', value: 1 },
  { 'hc-key': 'us-il', state: 'IL', value: 1 },
  { 'hc-key': 'us-mn', state: 'MN', value: 1 },
  { 'hc-key': 'us-mi', state: 'MI', value: 1 },
  { 'hc-key': 'us-ga', state: 'GA', value: 1 },
  { 'hc-key': 'us-va', state: 'VA', value: 1 },
  { 'hc-key': 'us-nh', state: 'NH', value: 1 },
  { 'hc-key': 'us-ma', state: 'MA', value: 1 },
  { 'hc-key': 'us-nj', state: 'NJ', value: 1 },
  { 'hc-key': 'us-ri', state: 'RI', value: 1 },
  { 'hc-key': 'us-de', state: 'DE', value: 1 },
];

export default function Exit_Poll_Explorer_Page() {
  const [exitPollData, setExitPollData] = useState<ExitPollData[] | null>(null);
  const [tableData, setTableData] = useState<ExitPollAnswer[]>([]);

  const [historicalElectionsData, setHistoricalElectionsData] =
    useState<any>(null);
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
        } else if (
          sharedState.demographic == Demographic.Region &&
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
          sharedState.demographic == Demographic.Region &&
          sharedState.breakdown == RaceType.Senate
        ) {
          return (
            stateName === State.Alabama ||
            stateName === State.Arizona ||
            stateName === State.Colorado ||
            stateName === State.Georgia ||
            stateName === State.Iowa ||
            stateName === State.Kentucky ||
            stateName === State.Michigan ||
            stateName === State.Minnesota ||
            stateName === State.Maine ||
            stateName === State.NewHampshire ||
            stateName === State.NorthCarolina ||
            stateName === State.Oregon ||
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
    if (
      sharedState.year === Year.Twenty &&
      sharedState.breakdown === RaceType.Senate
    ) {
      setHistoricalElectionsData(senate2020Data);
    } else {
      setHistoricalData();
    }
  }, [sharedState.year, sharedState.breakdown, sharedState.demographic]);

  useEffect(() => {
    filterHistoricalData();
  }, [
    historicalElectionsData,
    sharedState.breakdown,
    sharedState.year,
    sharedState.demographic,
  ]);

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
        Demographic.Region,
      ]);
      sharedState.demographicSwitch(Demographic.Age);
      initialized.current = true;
    }
  }, [sharedState]);

  useEffect(() => {
    sharedState.setAvailableYears([Year.TwentyFour, Year.Twenty]);
  }, [sharedState.breakdown]);

  // Second useEffect for exit poll data loading
  useEffect(() => {
    // console.log('Loading exit poll data...'); // For debugging

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
  }, []); // Empty dependency array

  const fetch2020Data = () => {};
  const fetch2024Data = () => {};

  useEffect(() => {
    if (sharedState.year == Year.Twenty) {
      fetch2020Data();
    } else if (sharedState.year == Year.TwentyFour) {
      fetch2024Data();
    }
  }, [sharedState.year]);

  useEffect(() => {
    const dataMap = new Map();

    exitPollData?.forEach((datum) => {
      if (
        datum.state === getStateAbbreviation(sharedState.view) &&
        datum.office_type === 'President' &&
        datum.question === sharedState.demographic
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
  }, [sharedState.demographic, sharedState.view, exitPollData]);

  if (!exitPollData || !historicalCountyData || !historicalElectionsData)
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
            {displayNational && (
              <div
                className={styles.EXMapContainer}
                id="EXMapContainer"
                style={{
                  ...(sharedState.level == 'national'
                    ? { opacity: 1 }
                    : { opacity: 0 }),
                }}
              >
                <EXMap
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
                  setCountyName={sharedState.setCountyName}
                />
              </div>
            )}
          </div>
          {tableData.length != 0 && <StatsTable data={tableData} />}
        </div>
        <Menubar />
      </div>
    </div>
  );
}
