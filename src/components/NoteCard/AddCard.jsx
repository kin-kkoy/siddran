import React from 'react'
import styles from './Card.module.css'

function AddCard({ addNote }) {

  return (
    <div onClick={() => addNote("Untitled")} className={styles.card}>
        <img src='the big thumbnail here' alt='the big thumbnail here' />
        <h2>Add Note</h2>
    </div>
  )
}

export default AddCard