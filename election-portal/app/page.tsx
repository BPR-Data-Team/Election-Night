import Image from "next/image";
import styles from "./page.module.css";
import Election_Portal_Button from "./modules/election-portal-button/election-portal-button";
import finance_image from "./assets/finance.png";
import trophy_image from "./assets/trophy.png";
import how_to_vote_image from "./assets/how_to_vote.png";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.row}>
        <Election_Portal_Button
          title={"Election Breakdown"}
          button_link="/presidential-breakdown"
          image_location={finance_image}
        ></Election_Portal_Button>
        <Election_Portal_Button
          title={"Road to Control"}
          button_link="/road-to-control"
          image_location={trophy_image}
        ></Election_Portal_Button>
        <Election_Portal_Button
          title={"Exit Poll Explorer"}
          button_link="/exit-poll-explorer"
          image_location={how_to_vote_image}
        ></Election_Portal_Button>
      </div>
    </div>
  );
}
