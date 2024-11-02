'use client';

import React, { useState, useEffect } from 'react';
import './countyDataDisplay.css';
import { RaceType } from '@/types/RaceType';
import { useSharedState } from '../../sharedContext';

// type DataProps = {
// };

type DataDisplayProps = {
  stateName: string;
  countyName: string;
  year: number;
  stateData: any;
  raceType: RaceType;
  sharedStateLevel: string;
};

const CountyDataDisplay: React.FC<DataDisplayProps> = ({
  stateName,
  countyName,
  year,
  stateData,
  raceType,
  sharedStateLevel,
}) => {
  const [demVotePercentage, setDemVotePercentage] = useState<string>('N/A');
  const [repVotePercentage, setRepVotePercentage] = useState<string>('N/A');
  const [pctReporting, setPctReporting] = useState<string>('N/A');

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
  }, [stateName, year, stateData, raceType, countyName]);

  return (
    <div>
      <div className="countyDataDisplay">
        <div className="countyStateYearDiv">
          <h1 className="countyStateYearHeader">
            <p className="countyName">
              {'Lake and Peninsula'}
            </p>{' '}
          </h1>
        </div>

        <div className="spaceDiv"></div>

        <div className="countyInfoDiv">
            <div className="countyTable">

                <div className="countyRow">
                    <div className="firstCountyCell"></div>
                    <div className="countyCell"><p>2024</p></div>
                    <div className="countyCell"><p></p></div>
                    <div className="countyCell"><p></p></div>
                </div>

                <div className="countyRow">
                    <div className="firstCountyCell"><p className='countyName'>{stateData['Democratic_name']}</p></div>
                    <div className="countyCell"><p>{stateData['Democratic_votes_percent']}</p><p>{stateData['Democratic_votes']}</p></div>
                    <div className="countyCell"><p></p></div>
                    <div className="countyCell"><p></p></div>
                </div>

                <div className="countyRow">
                    <div className="firstCountyCell"><p className='countyName'>{stateData['Republican_name']}</p></div>
                    <div className="countyCell"><p>{stateData['Republican_votes_percent']}</p><p>{stateData['Republican_votes']}</p></div>
                    <div className="countyCell"><p></p></div>
                    <div className="countyCell"><p></p></div>
                </div>
                
            </div>
          
        </div>
      </div>
    </div>
  );
};

export default CountyDataDisplay;
