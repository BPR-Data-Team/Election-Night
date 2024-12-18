'use client';

import React, { useEffect } from 'react';
import { useSharedState } from '../../sharedContext';
import { Demographic, RaceType, Year } from '../../../types/SharedInfoType';
import './menubar.css';
import HomeButton from './menu-buttons/home-button';
import ExitButton from './menu-buttons/exit-button';
import DrawButton from './menu-buttons/draw-button';
import { usePathname } from 'next/navigation';
import { truncate } from 'fs';
import { FaBullseye } from 'react-icons/fa';
import PageviewIcon from '@mui/icons-material/Pageview';
import ReplayIcon from '@mui/icons-material/Replay';
import Button from '@mui/material/Button';
// These can be turned into maps or better parsed from the types
const breakdownToString = (
  breakdown: RaceType,
  currentBreakdown: RaceType
): React.ReactNode => {
  let str: string = '';
  const selected: boolean = breakdown === currentBreakdown;
  switch (breakdown) {
    case RaceType.Presidential:
      str = 'Pres.';
      break;
    case RaceType.Senate:
      str = 'Sen.';
      break;
    case RaceType.Gubernatorial:
      str = 'Gub.';
      break;
    case RaceType.House:
      str = 'Hse.';
      break;
    default:
      str = 'Unk.';
      break;
  }
  return (
    <span
      style={{
        color: selected ? '#ffffff' : '#dddddd',
        textShadow: selected ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
      }}
    >
      {str}
    </span>
  );
};

const yearToString = (
  year: Year,
  currentYear: Year,
  countyViewAll: boolean | null
): React.ReactNode => {
  let str = '';
  let selected: boolean = year === currentYear;
  if (countyViewAll != null) {
    selected = false;
  }

  switch (year) {
    case Year.TwentyFour:
      str = '2024';
      break;
    case Year.TwentyTwo:
      str = '2022';
      break;
    case Year.Twenty:
      str = '2020';
      break;
    case Year.Eighteen:
      str = '2018';
      break;
    case Year.Sixteen:
      str = '2016';
      break;
    case Year.Fourteen:
      str = '2014';
      break;
    case Year.Twelve:
      str = '2012';
      break;
    default:
      str = 'Unk.';
      break;
  }
  return (
    <span
      style={{
        color: selected ? '#ffffff' : '#dddddd',
        textShadow: selected ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
      }}
    >
      {str}
    </span>
  );
};

const demographicToString = (
  demo: Demographic,
  currentDemographic: Demographic
): React.ReactNode => {
  const selected: boolean = demo === currentDemographic;
  return (
    <span
      style={{
        color: selected ? '#ffffff' : '#dddddd',
        textShadow: selected ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
      }}
    >
      {demo}
    </span>
  );
};

interface MenubarProps {
  countyViewAll?: boolean;
  setCountyViewAll?: any;
  handleReset?: () => void;
}

const Menubar: React.FC<MenubarProps> = ({
  countyViewAll,
  setCountyViewAll,
  handleReset,
}) => {
  const state = useSharedState().state;
  const pathname = usePathname();
  //console.log('Menubar is rendering with state:', state);

  const handleYearClick = (year: Year) => {
    state.yearSwitch(year);
    if (setCountyViewAll != undefined) {
      setCountyViewAll(false);
    }
  };
  
  return (
    <div className="rightbar">
      <div className="contents">
        <div className="menu-buttons">
          <HomeButton
            currentPage={state.page}
            setCurrentPage={state.setCurrentPage}
          />
          <br></br>
          <ExitButton currentLevel={state.level} exitLevel={state.exitLevel} />
          <br>{/* better way to do this (.menu-buttons in css?))*/}</br>
          <DrawButton />
        </div>

        {state.availableBreakdowns.length != 0 && (
          <>
            {(state.page != '/road-to-control' && pathname != '/road-to-control') && (
              <>
                <div className="divider"></div>
                <div className="breakdowns">
                  {state.availableBreakdowns.map((breakdown, index) => (
                    <button
                      className="breakdown"
                      key={index}
                      onClick={() => state.breakdownSwitch(breakdown)}
                    >
                      {breakdownToString(breakdown, state.breakdown)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {state.availableYears.length != 0 && (
          <>
            <div className="divider"></div>

            <div className="years">
              {state.availableYears.map((year, index) => (
                <button
                  className="year"
                  key={index}
                  onClick={() => handleYearClick(year)}
                >
                  {countyViewAll
                    ? yearToString(year, state.year, countyViewAll)
                    : yearToString(year, state.year, null)}
                </button>
              ))}
            </div>
          </>
        )}

        {state.availableDemographics.length != 0 && (
          <>
            <div className="divider"></div>

            <div className="demographics">
              {state.availableDemographics.map((demo, index) => (
                <button
                  className="demographic"
                  key={index}
                  onClick={() => state.demographicSwitch(demo)}
                >
                  {demographicToString(demo, state.demographic)}
                </button>
              ))}
            </div>
          </>
        )}

        {countyViewAll != undefined && setCountyViewAll != undefined ? (
          <>
            <button
              className="viewAll"
              onClick={() => {
                setCountyViewAll(true);
              }}
            >
              <span
                style={{
                  color: countyViewAll ? '#ffffff' : '#dddddd',
                  textShadow: countyViewAll
                    ? '0 0 10px rgba(255,255,255,0.5)'
                    : 'none',
                }}
              >
                All
              </span>
            </button>
          </>
        ) : null}
        {pathname === '/road-to-control' ? (
          <>
          <div className="divider"></div>
          <div className="reset-buttons">
            <Button 
              startIcon={<ReplayIcon style={{ fontSize: '3rem', color: 'rgba(255, 255, 255, 0.7)' }} />} 
              className="reset" 
              onClick={handleReset}
            >
            </Button>
          </div>
          <div className="projection">
            <Button 
              startIcon={<PageviewIcon style={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.7)' }} />} 
              className="reset" 
              onClick={() => handleYearClick(Year.Thousand)}
            >
            </Button>
          </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Menubar;
