import type React from "react"
import styles from "@/styles/modules/LoadingAnimation.module.css"

const LoadingAnimation: React.FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.paddle}></div>
      <div className={styles.ball}></div>
      <div className={styles.paddle}></div>
    </div>
  )
}

export default LoadingAnimation;
