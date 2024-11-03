'use client';

import React, { useState, useEffect } from 'react';
import './countyDataDisplay.css';
import { RaceType } from '@/types/RaceType';
import { useSharedState } from '../../sharedContext';

type DataDisplayProps = {
  stateName: string;
  countyName: string;
  year: number;
  stateData: any;
  raceType: RaceType;
  sharedStateLevel: string;
  countyViewAll: boolean;
};

const CountyDataDisplay: React.FC<DataDisplayProps> = ({
  stateName,
  countyName,
  year,
  stateData,
  raceType,
  sharedStateLevel,
  countyViewAll,
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
                    <div className="countyCell"><p>{(year === 2024 || countyViewAll) && "2024"}</p></div>
                    <div className="countyCell"><p>{(year === 2020 || countyViewAll) && "2020"}</p></div>
                    <div className="countyCell"><p>{(year === 2016 || countyViewAll) && "2016"}</p></div>
                </div>

                <div className="countyRow">
                    <div className="firstCountyCell"><p className='countyName'>{stateData['Democratic_name']}</p></div>
                    <div className="countyCell">
                        {(year === 2024 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{stateData['Democratic_votes_percent']}</p>
                                <p className='votesNumber'>{stateData['Democratic_votes'].toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                    <div className="countyCell">
                        {(year === 2020 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{stateData['Democratic_votes_percent']}</p>
                                <p className='votesNumber'>{stateData['Democratic_votes'].toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                    <div className="countyCell">
                        {(year === 2016 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{stateData['Democratic_votes_percent']}</p>
                                <p className='votesNumber'>{stateData['Democratic_votes'].toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                </div>

                <div className="countyRow">
                    <div className="firstCountyCell"><p className='countyName'>{stateData['Republican_name']}</p></div>
                    <div className="countyCell">
                        {(year === 2024 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{stateData['Republican_votes_percent']}</p>
                                <p className='votesNumber'>{stateData['Republican_votes'].toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                    <div className="countyCell">
                        {(year === 2020 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{stateData['Republican_votes_percent']}</p>
                                <p className='votesNumber'>{stateData['Republican_votes'].toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                    <div className="countyCell">
                        {(year === 2016 || countyViewAll) && 
                            <div className='countyPercentCell'>
                                <p className='votesPercentage'>{stateData['Republican_votes_percent']}</p>
                                <p className='votesNumber'>{stateData['Republican_votes'].toLocaleString('en-US')}</p>
                            </div>
                        }
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default CountyDataDisplay;
