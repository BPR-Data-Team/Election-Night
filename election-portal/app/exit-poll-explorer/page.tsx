'use client';
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { ExitPollAnswer, ExitPollData } from '../../types/data';
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
import { getStateAbbreviation } from '@/types/State';

export default function Exit_Poll_Explorer_Page() {
  const [exitPollData, setExitPollData] = useState<ExitPollData[] | null>(null);
  const [tableData, setTableData] = useState<ExitPollAnswer[]>([]);
  const state = useSharedState().state;

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

  if (!exitPollData) return <p>Loading Exit Poll Data...</p>;

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
            <div className={styles.EBMapContainer} id="EBContainer">
              <EBMap />
            </div>
          </div>
          {tableData.length != 0 && <StatsTable data={tableData} />}
        </div>
      </div>
    </div>
  );
}
