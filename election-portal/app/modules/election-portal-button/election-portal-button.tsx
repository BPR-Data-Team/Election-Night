import styles from "../election-portal-button/election-portal-button.module.css";
import { useRouter } from "next/navigation";
import {IconType} from "react-icons";

interface ElectionPortalButtonProps {
  title: String;
  image_icon: IconType;
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
          <h2 className={styles.button_title}>{props.title}</h2>
          <div className={styles.button_image_container}>
            <props.image_icon aria-label={props.alt_text} className={styles.button_image} />
          </div>
        </div>
      </div>
    </button>
  );
}
