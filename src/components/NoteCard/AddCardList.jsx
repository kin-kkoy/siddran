import styles from './Card.module.css'

function AddCardList({ addNote }) {
  return (
    <div onClick={ () => addNote("Untitled")} className={styles.addCardList}>
        <span className={styles.addCardListIcon}>+</span>
        <h4>Add Note</h4>
    </div>
  )
}

export default AddCardList