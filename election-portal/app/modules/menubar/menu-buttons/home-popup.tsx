import React from 'react';
import styles from "./home-popup.module.css";

interface HomePopupProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

const HomePopup: React.FC<HomePopupProps> = (props: HomePopupProps) => {
    return (
        <div className={styles.container}> 
            <div className={styles.popup}>
                <button 
                    className={styles.button} 
                    onClick={() => props.setCurrentPage("/election-breakdown")}
                >
                    Election Breakdown
                </button>
                <button 
                    className={styles.button} 
                    onClick={() => props.setCurrentPage("/road-to-control")}
                >
                    Road to Control
                </button>
                <button 
                    className={styles.button} 
                    onClick={() => props.setCurrentPage("/exit-poll-explorer")}
                >
                    Exit Poll Explorer
                </button>
            </div>
        </div>
    );
};

export default HomePopup;