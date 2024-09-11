"use client";

import React, { useState } from 'react';

import Head from 'next/head';
import Image from 'next/image';

import styles from "./page.module.css";
import Rightbar from "./components/rightbar"
import Banner from "./components/banner";
import Canvas from "./components/canvas";

export default function Home() {
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);
  const [drawMode, setDrawMode] = useState<boolean>(true);

  const toggleBanner = () => {
    setIsBannerVisible(!isBannerVisible);
  };

  const stringTest = (test: string) => {
    console.log(test);
  }

  // If toggleDraw is true then we need to block mouse input to everything except Rightbar 
  const toggleDraw = () => {
    setDrawMode(!drawMode);
  }

  return (
    <>
      <div className={styles.page}>
        <Banner
          position="top"
          wordmark="24cast.org"
          header=""
          message="This is a top banner!"
          isVisible={isBannerVisible}
          toggleVisibility={toggleBanner}
        />

        {drawMode && (
          <Canvas />
        )}

        {/* Needs to be topmost during content screens */}
        <Rightbar
          pageSwitch={toggleBanner}
          exit={toggleBanner}
          toggleDraw={toggleDraw}
          availableBreakdowns={["asdf"]}
          breakdownSwitch={stringTest}
          availableYears={["1"]}
          yearSwitch={stringTest}
          isVisible={isBannerVisible}
          toggleVisibility={toggleBanner}
        />

        {/* Future homepage topmost element */}
      </div>
    </>
  )
}
