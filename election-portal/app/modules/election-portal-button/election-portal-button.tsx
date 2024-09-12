import styles from "../election-portal-button/election-portal-button.module.css";
import Image, { StaticImageData } from "next/image";

interface ElectionPortalButtonProps {
  title: String;
  image_location: StaticImageData;
  button_link: string;
}
export default function Election_Portal_Button(
  props: ElectionPortalButtonProps
) {
  return (
    <div className={styles.button_container}>
      <div className={styles.button_col}>
        <div className={styles.button_title}>{props.title}</div>
        <div className={styles.button_image_container}>
          <Image
            className={styles.button_image}
            src={props.image_location}
            alt="This is a picture of a finance graph for aesthetic purposes"
          ></Image>
        </div>
      </div>
    </div>
  );
}
