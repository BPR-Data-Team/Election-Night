'use client';

import React, { useState, useEffect } from 'react';
import './dataDisplay.css';

import { getDataVersion, RaceType } from '@/types/RaceType';
import { Year } from '@/types/Year';

import { useSharedState } from '../../sharedContext';
import { getStateAbbreviation } from '../../../types/State';

import CountyDataDisplay from "./countyDataDisplay"



const mockCountyData = {
  Democratic_name: 'Stein',
  Republican_name: 'Robinson',
  Democratic_votes_percent: '43%',
  Republican_votes_percent: '57%',
  Democratic_votes: 2357106,
  Republican_votes: 2357106,
}

type DataDisplayProps = {
  stateName: string;
  countyName: string;
  year: number;
  stateData: any;
  historicalCountyData: any;
  historicalElectionsData: any;
  raceType: RaceType;
  sharedStateLevel: string;
  countyViewAll: boolean;
};

interface ElectionData {
  Democratic_name: string;
  Republican_name: string;
  Democratic_votes_percent: string;
  Republican_votes_percent: string;
  Democratic_votes: number;
  Republican_votes: number;
}

const DataDisplay: React.FC<DataDisplayProps> = ({
  stateName,
  countyName,
  year,
  stateData,
  historicalCountyData,
  historicalElectionsData,
  raceType,
  sharedStateLevel,
  countyViewAll,
}) => {
  const [demVotePercentage, setDemVotePercentage] = useState<string>('N/A');
  const [repVotePercentage, setRepVotePercentage] = useState<string>('N/A');
  const [pctReporting, setPctReporting] = useState<string>('N/A');

  const [levelTitle, setLevelTitle] = useState<string>('');

  const [displayData, setDisplayData] = useState<any>(null);

  useEffect(() => {
    
    if (sharedStateLevel == 'state') {
      setLevelTitle('Statewide');
    } else if (sharedStateLevel == 'county') {
      setLevelTitle(countyName);
    } else {
      setLevelTitle(stateName);
    }
  }, [sharedStateLevel, countyName, stateName]);

  // const initializeData = () => {
  //   let fetchedData: ElectionData[] = [];
  //   historicalCountyData?.forEach((datum) => {
  //     if (
  //       datum.state === getStateAbbreviation(sharedState.view) &&
  //       datum.office_type === getDataVersion(sharedState.breakdown)
  //     ) {
  //       switch (sharedState.breakdown) {
  //         case RaceType.Senate:
  //           switch (sharedState.year) {
  //             case Year.Eighteen:
  //               fetchedData.push({
  //                 Democratic_name: string;
  //                 Republican_name: string;
  //                 Democratic_votes_percent: string;
  //                 Republican_votes_percent: string;
  //                 Democratic_votes: number;
  //                 Republican_votes: number;
  //               });
  //               break;
  //             case Year.Twelve:
  //               fetchedData.push({
  //                 NAME: datum.county,
  //                 value: datum.margin_pct_2,
  //               });
  //               break;
  //           }
  //         case RaceType.Gubernatorial:
  //           switch (sharedState.year) {
  //             case Year.Twenty:
  //               fetchedData.push({
  //                 NAME: datum.county,
  //                 value: datum.margin_pct_1,
  //               });
  //               break;
  //             case Year.Sixteen:
  //               fetchedData.push({
  //                 NAME: datum.county,
  //                 value: datum.margin_pct_2,
  //               });
  //               break;
  //           }
  //         case RaceType.Presidential:
  //           switch (sharedState.year) {
  //             case Year.Twenty:
  //               fetchedData.push({
  //                 NAME: datum.county,
  //                 value: datum.margin_pct_1,
  //               });
  //               break;
  //             case Year.Sixteen:
  //               fetchedData.push({
  //                 NAME: datum.county,
  //                 value: datum.margin_pct_2,
  //               });
  //               break;
  //           }
  //       }
  //     }
  //   });
  //   setDisplayData(fetchedData);
  // }

  const sharedState = useSharedState().state;

  const setBothVotePercentages = () => {
    setDemVotePercentage(
      stateData['dem_votes'] && stateData['rep_votes']
        ? Math.round(
            (stateData['dem_votes'] /
              (stateData['dem_votes'] + stateData['rep_votes'])) *
              100
          ) + '%'
        : 'N/A'
    );
    setRepVotePercentage(
      stateData['dem_votes'] && stateData['rep_votes']
        ? Math.round(
            (stateData['rep_votes'] /
              (stateData['dem_votes'] + stateData['rep_votes'])) *
              100
          ) + '%'
        : 'N/A'
    );
  };

  useEffect(() => {
    setBothVotePercentages();
    setPctReporting(
      Math.round(stateData['pct_reporting'])
        ? stateData['pct_reporting']
        : 'N/A'
    );
  }, [stateName, year, stateData, raceType]);



  return (
    <div>
      {(sharedStateLevel === 'county' && countyViewAll === true) ?
        <CountyDataDisplay
        stateName={sharedState.view}
        countyName={countyName}
        year={sharedState.year}
        stateData={mockCountyData}
        raceType={sharedState.breakdown}
        sharedStateLevel={sharedState.level}
        countyViewAll={countyViewAll}
      /> : 
      <div className="dataDisplay">
      <div className="stateYearDiv">
        <h1 className="stateYearHeader">
          <p className="stateName">
            {levelTitle}
          </p>{' '}
          | {year}
        </h1>
      </div>

      <div className="spaceDiv"></div>

      <div className="infoDiv">
        <div className="peopleDiv">
          <div className="personStack">
            <div className="personImageDiv">
              <img
                className="demPerson"
                src="https://upload.wikimedia.org/wikipedia/commons/7/71/Black.png"
                alt="Dem Candidate"
              />
            </div>
            <div className="infoDivTextDiv">
              <h2 className="personName">
                {stateData['dem_name'] ? stateData['dem_name'] : 'N/A'}
              </h2>
              <h2 className="personPercentage">{demVotePercentage}</h2>
              <h2 className="personVotes">
                {stateData['dem_votes']
                  ? stateData['dem_votes'].toLocaleString('en-US')
                  : 'N/A'}
              </h2>
            </div>
          </div>

          <div className="personStack">
            <div className="personImageDiv">
              <img
                className="repPerson"
                src="https://upload.wikimedia.org/wikipedia/commons/7/71/Black.png"
                alt="Rep Candidate"
              />
            </div>
            <div className="infoDivTextDiv">
              <h2 className="personName">
                {stateData['rep_name'] ? stateData['rep_name'] : 'N/A'}
              </h2>
              <h2 className="personPercentage">{repVotePercentage}</h2>
              <h2 className="personVotes">
                {stateData['rep_votes']
                  ? stateData['rep_votes'].toLocaleString('en-US')
                  : 'N/A'}
              </h2>
            </div>
          </div>
        </div>

        <div className="pctReportingDiv">
          <p className="pct_reporting">
            {pctReporting ? pctReporting + '% Reporting' : 'N/A'}
          </p>
        </div>
      </div>
    </div>
    }
      
    </div>
  );
};

export default DataDisplay;
