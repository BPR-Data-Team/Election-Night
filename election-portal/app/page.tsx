"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Election_Portal_Button from "./modules/election-portal-button/election-portal-button";
import finance_image from "./assets/finance.png";
import trophy_image from "./assets/trophy.png";
import how_to_vote_image from "./assets/how_to_vote.png";
import LogoBanner from "./modules/24cast-banner/banner";

//TODO: Banner component
//TODO: Responsive design
export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.banner_container}>
        <LogoBanner opacity={30} page_name={"Election Portal"}></LogoBanner>
      </div>
      <div className={styles.row}>
        <Election_Portal_Button
          title={"Election Breakdown"}
          button_link="/election-breakdown"
          image_location={finance_image}
          alt_text="This is a picture of a finance graph for aesthetic purposes"
        ></Election_Portal_Button>
        <Election_Portal_Button
          title={"Road to Control"}
          button_link="/road-to-control"
          image_location={trophy_image}
          alt_text="This is a picture of a trophy"
        ></Election_Portal_Button>
        <Election_Portal_Button
          title={"Exit Poll Explorer"}
          button_link="/exit-poll-explorer"
          image_location={how_to_vote_image}
          alt_text="This is a picture of a ballot box aesthetic purposes"
        ></Election_Portal_Button>
      </div>
    </div>
  );
}
