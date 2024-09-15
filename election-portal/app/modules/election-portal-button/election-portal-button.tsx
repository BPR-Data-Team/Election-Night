import styles from "../election-portal-button/election-portal-button.module.css";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";

interface ElectionPortalButtonProps {
  title: String;
  image_location: StaticImageData;
  button_link: string;
  alt_text: string;
}
export default function Election_Portal_Button(
  props: ElectionPortalButtonProps
) {
  const router = useRouter();
  return (
    <button onClick={() => router.push(props.button_link)}>
      <div className={styles.button_container}>
        <div className={styles.button_col}>
          <div className={styles.button_title}>{props.title}</div>
          <div className={styles.button_image_container}>
            <Image
              className={styles.button_image}
              src={props.image_location}
              alt={props.alt_text}
            ></Image>
          </div>
        </div>
      </div>
    </button>
  );
}
