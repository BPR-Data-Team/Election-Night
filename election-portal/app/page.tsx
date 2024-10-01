"use client";
import styles from "./page.module.css";
import Election_Portal_Button from "./modules/election-portal-button/election-portal-button";
import { MdHowToVote, MdOutlineEmojiEvents, MdOutlineInsertChart } from "react-icons/md";


//TODO: Banner component
//TODO: Responsive design
export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.row}>
        <Election_Portal_Button
          title={"Election Breakdown"}
          button_link="/election-breakdown"
          image_icon={MdOutlineInsertChart}
          alt_text="This is a picture of a finance graph for aesthetic purposes"
        ></Election_Portal_Button>
        <Election_Portal_Button
          title={"Road to Control"}
          button_link="/road-to-control"
          image_icon={MdOutlineEmojiEvents}
          alt_text="This is a picture of a trophy"
        ></Election_Portal_Button>
        <Election_Portal_Button
          title={"Exit Poll Explorer"}
          button_link="/exit-poll-explorer"
          image_icon={MdHowToVote}
          alt_text="This is a picture of a ballot box aesthetic purposes"
        ></Election_Portal_Button>
      </div>
    </div>
  );
}
