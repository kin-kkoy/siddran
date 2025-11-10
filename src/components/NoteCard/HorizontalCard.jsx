import { useNavigate } from 'react-router-dom'
import styles from './Card.module.css'

function HorizontalCard({ note, deleteNote }) {
  
  const navigate = useNavigate()

  return (

    <div onClick={ () => navigate(`/notes/${note.id}`)} className={styles.horizontalCard}>

      <div className={styles.horizontalCardContent}>
        <h4>{note.title}</h4>
        <p>category here maybe</p>
      </div>
      <button onClick={(e) => {
        e.stopPropagation()
        deleteNote(note.id)
      }}>Delete</button>

    </div>
  )
}

export default HorizontalCard