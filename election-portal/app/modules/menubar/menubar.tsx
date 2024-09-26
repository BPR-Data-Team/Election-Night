"use client";

import React from 'react';
import './menubar.css';
import HomeButton from './menu-buttons/home-button';

type MenubarProps = {
  page: string;
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

const Menubar: React.FC<MenubarProps> = ({    page, pageSwitch, exit, toggleDraw, availableBreakdowns, breakdownSwitch,
                                                availableYears, yearSwitch, isVisible, toggleVisibility }) => {
  return (
    <div className="rightbar">
      <div className="contents">
        {isVisible && (
          <>
            <div className="menu-buttons">
              <HomeButton currentPage={page} setCurrentPage={pageSwitch} />
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

export default Menubar;
