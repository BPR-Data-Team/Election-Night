"use client";
import React, { useState } from "react";
import { useSharedState } from "../sharedContext";

import Head from "next/head";
import Image from "next/image";

import styles from "./page.module.css";
import Menubar from "../modules/menubar/menubar";
import Banner from "./modules/banner";
import Canvas from "../modules/canvas/canvas";

export default function Election_Breakdown_Page() {
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(true);
  const state = useSharedState().state;
  const toggleBanner = () => {
    setIsBannerVisible(!isBannerVisible);
  };

  const stringTest = (test: string) => {
    console.log(test);
  };

  const numTest = (test: number) => {
    console.log(test);
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

          {state.drawMode && <Canvas />}

          {/* Needs to be topmost during content screens */}
          <Menubar />

          {/* Future homepage topmost element */}
        </div>
      </div>
    </>
  );
}
