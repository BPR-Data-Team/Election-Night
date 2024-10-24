"use client";

import React from "react";
import { useSharedState } from "../../sharedContext";
import { Demographic, RaceType, Year } from "../../../types/SharedInfoType";

import "./menubar.css";
import HomeButton from "./menu-buttons/home-button";
import ExitButton from "./menu-buttons/exit-button";
import DrawButton from "./menu-buttons/draw-button";
import { useRouter } from "next/navigation";

// These can be turned into maps or better parsed from the types
const breakdownToString = (
  breakdown: RaceType,
  currentBreakdown: RaceType
): React.ReactNode => {
  let str: string = "";
  const selected: boolean = breakdown === currentBreakdown;
  switch (breakdown) {
    case RaceType.Presidential:
      str = "Pres.";
      break;
    case RaceType.Senate:
      str = "Sen.";
      break;
    case RaceType.Gubernatorial:
      str = "Gub.";
      break;
    case RaceType.House:
      str = "Hse.";
      break;
    default:
      str = "Unk.";
      break;
  }
  return (
    <span
      style={{
        color: selected ? "#ffffff" : "#dddddd",
        textShadow: selected ? "0 0 10px rgba(255,255,255,0.5)" : "none",
      }}
    >
      {str}
    </span>
  );
};

const yearToString = (year: Year, currentYear: Year): React.ReactNode => {
  let str = "";
  const selected: boolean = year === currentYear;
  switch (year) {
    case Year.TwentyFour:
      str = "2024";
      break;
    case Year.TwentyTwo:
      str = "2022";
      break;
    case Year.Twenty:
      str = "2020";
      break;
    case Year.Eighteen:
      str = "2018";
      break;
    case Year.Sixteen:
      str = "2016";
      break;
    case Year.Fourteen:
      str = "2014";
      break;
    case Year.Twelve:
      str = "2012";
      break;
    default:
      str = "Unk.";
      break;
  }
  return (
    <span
      style={{
        color: selected ? "#ffffff" : "#dddddd",
        textShadow: selected ? "0 0 10px rgba(255,255,255,0.5)" : "none",
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
        color: selected ? "#ffffff" : "#dddddd",
        textShadow: selected ? "0 0 10px rgba(255,255,255,0.5)" : "none",
      }}
    >
      {demo}
    </span>
  );
};

const Menubar: React.FC = () => {
  const state = useSharedState().state;

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

        {state.availableYears.length != 0 && (
          <>
            <div className="divider"></div>

            <div className="years">
              {state.availableYears.map((year, index) => (
                <button
                  className="year"
                  key={index}
                  onClick={() => state.yearSwitch(year)}
                >
                  {yearToString(year, state.year)}
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
      </div>
    </div>
  );
};

export default Menubar;
