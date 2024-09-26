"use client";

import React from 'react';
import './menubar.css';
import HomeButton from './menu-buttons/home-button';
import ExitButton from './menu-buttons/exit-button';
import DrawButton from './menu-buttons/draw-button';
import { useRouter } from "next/navigation";

type MenubarProps = {
  page: string;
  setCurrentPage: (page: string) => void;
  exit: () => void;
  drawMode: boolean;
  toggleDraw: () => void;
  availableBreakdowns: string[];
  breakdownSwitch: (breakdown: string) => void;
  availableYears: string[];
  yearSwitch: (year: number) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
};

const Menubar: React.FC<MenubarProps> = 
  ({  page, setCurrentPage, exit, drawMode, toggleDraw, availableBreakdowns, breakdownSwitch,
      availableYears, yearSwitch, isVisible, toggleVisibility }) => {

  return (
    <div className="rightbar">
      <div className="contents">
        {isVisible && (
          <>
            <div className="menu-buttons">
              <HomeButton currentPage={page} setCurrentPage={setCurrentPage} />
              <br></br>
              <ExitButton currentPage={page} setCurrentPage={setCurrentPage}/>
              <br>{/* better way to do this (.menu-buttons in css?))*/}</br>
              <DrawButton drawMode={drawMode} toggleDraw={toggleDraw}/>
            </div>

            <div className="divider"></div>

            <div className="breakdowns">
              {availableBreakdowns.map((breakdown, index) => (
                <button className="breakdown" key={index} onClick={() => breakdownSwitch(breakdown)}>
                  {breakdown}
                </button>
              ))}
            </div>

            <div className="divider"></div>

            <div className="years">
              {availableYears.map((year, index) => (
                <button className="year" key={index} onClick={() => yearSwitch(year)}>
                  {year}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Menubar;
