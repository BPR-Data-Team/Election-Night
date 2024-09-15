"use client";

import React from 'react';
import './rightbar.css';

type RightbarProps = { // give this alignment and height instead of position
  pageSwitch: (page: string) => void;
  exit: () => void; // should give an alternative to this: click on a non-map area
  toggleDraw: () => void;
  availableBreakdowns: string[];
  breakdownSwitch: (breakdown: string) => void; // enum?
  availableYears: string[];
  yearSwitch: (year: string) => void; // should be int => void
  isVisible: boolean;
  toggleVisibility: () => void;
};

const Rightbar: React.FC<RightbarProps> = ({    pageSwitch, exit, toggleDraw, availableBreakdowns, breakdownSwitch,
                                                availableYears, yearSwitch, isVisible, toggleVisibility }) => {
  return (
    <div className="rightbar">
      <div className="contents">
        {isVisible && (
          <>
            <div className="menu-buttons">
              <button onClick={() => pageSwitch("test")}> {/* Probably replace this with some button popup component */}
                home
              </button>
              <br></br>
              <button onClick={exit}>
                exit
              </button>
              <br>{/* better way to do this (.menu-buttons in css?))*/}</br>
              <button onClick={toggleDraw}>
                draw
              </button>
            </div>
            <div className="breakdowns">
              breakdown options go here
            </div>
            <div className="years">
              years go here
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Rightbar;
