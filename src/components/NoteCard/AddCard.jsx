import styles from './Card.module.css'

function AddCard({ addNote }) {

  return (
    <div onClick={() => addNote("Untitled")} className={styles.addCard}>
        <span className={styles.addCardIcon}>+</span>
        <h2>Add Note</h2>
    </div>
  )
}

export default AddCard