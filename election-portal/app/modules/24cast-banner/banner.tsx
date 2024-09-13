import styles from "./banner.module.css";

interface LogoBannerProps {
  page_name: String;
  opacity: Number;
}
export default function LogoBanner(props: LogoBannerProps) {
  return (
    <div className={styles.banner_container}>
      <div className={styles.title_text}>
        24cast.org | <span className={styles.page_text}>{props.page_name}</span>
      </div>
    </div>
  );
}
