import React from "react";
import StatusBar from "./modules/StatusBar";
import styles from "./page.module.css";
export default function Road_To_Control_Page() {

  return (
    <div className={styles.statusBar}>
      <StatusBar />  {/* This should render the StatusBar */}
    </div>
  );
}
