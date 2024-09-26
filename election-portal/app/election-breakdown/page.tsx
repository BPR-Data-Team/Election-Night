"use client";
import React, { useState } from "react";

import Head from "next/head";
import Image from "next/image";

import styles from "./page.module.css";
import Menubar from "../modules/menubar/menubar";
import Banner from "./modules/banner";
import Canvas from "../modules/canvas/canvas";

export default function Election_Breakdown_Page() {
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);
  const [drawMode, setDrawMode] = useState<boolean>(false);

  const toggleBanner = () => {
    setIsBannerVisible(!isBannerVisible);
  };

  const stringTest = (test: string) => {
    console.log(test);
  };

  // If toggleDraw is true then we need to block mouse input to everything except Rightbar
  const toggleDraw = () => {
    setDrawMode(!drawMode);
  };

  return (
    <>
      <div className={styles.page}>
        <div className="overflow-catch">
          {/* Left title banner */}
          <Banner
            align="left"
            height={6}
            wordmark="24cast.org"
            header=""
            message="This is a top banner!"
            isVisible={isBannerVisible}
            toggleVisibility={toggleBanner}
          />

          {drawMode && <Canvas />}

          {/* Needs to be topmost during content screens */}
          <Menubar
            page={"test"}
            setCurrentPage={stringTest}
            exit={toggleBanner}
            drawMode={drawMode}
            toggleDraw={toggleDraw}
            availableBreakdowns={["asdf", "asdf2", "asdf3", "asdf4"]}
            breakdownSwitch={stringTest}
            availableYears={["1", "2", "3"]}
            yearSwitch={stringTest}
            isVisible={isBannerVisible}
            toggleVisibility={toggleBanner}
          />

          {/* Future homepage topmost element */}
        </div>
      </div>
    </>
  );
}
