'use client';

import React, { Dispatch, SetStateAction } from 'react';
import './rightbar.css';
import { Year } from '@/types/Year';
import { RaceType } from '@/types/RaceType';

type RightbarProps = {
  // give this alignment and height instead of position
  pageSwitch: () => void;
  exit: () => void; // should give an alternative to this: click on a non-map area
  toggleDraw: () => void;
  availableBreakdowns: RaceType[];
  breakdownSwitch: (raceType: RaceType) => void;
  availableYears: Year[];
  yearSwitch: (year: Year) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  isDrawing: boolean;
};

const Rightbar: React.FC<RightbarProps> = ({
  pageSwitch,
  exit,
  toggleDraw,
  availableBreakdowns,
  breakdownSwitch,
  availableYears,
  yearSwitch,
  isVisible,
  toggleVisibility,
  isDrawing,
}) => {
  if (!isVisible) {
    return null;
  }
  return (
    <div className="rightbar">
      <div className="contents">
        <>
          <div className="menu-buttons">
            <button onClick={toggleVisibility}>close sidebar</button>
            <button onClick={pageSwitch}>home</button>
            <br></br>
            <button onClick={exit}>exit</button>
            {/* better way to do this (.menu-buttons in css?))*/}
            <button onClick={toggleDraw}>draw</button>
          </div>
          <div className="breakdowns">
            {availableBreakdowns.map((breakdown, idx) => {
              return (
                <button key={idx} onClick={() => breakdownSwitch(breakdown)}>
                  {breakdown}
                </button>
              );
            })}
          </div>
          <ul className="years">
            {availableYears.map((year, idx) => {
              return (
                <li key={idx} className="year-button">
                  <button
                    onClick={() => {
                      yearSwitch(year);
                    }}
                  >
                    {year}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      </div>
    </div>
  );
};

export default Rightbar;
