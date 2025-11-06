// import thumbnail from '../../assets/unnamed.jpg'
// import styles from './Card.module.css'

// function Card() {
//   return (
//     <div className={styles.card}>
//         <img className={styles.cardImg} src={thumbnail} alt="Note Thumbnail"></img>
//         <h2 className={styles.cardTitle}>Note 1</h2>
//         <p className={styles.cardDesc}>Description goes here</p>
//     </div>
//   );
// }

// export default Card


import styles from './Card.module.css'
import { useNavigate } from 'react-router-dom'

function Card({ note, deleteNote }) {
  const navigate = useNavigate()


  // For now, style of card is placed shere


  return (
    <div onClick={ () => navigate(`/notes/${note.id}`) } className={styles.card}>
      <h2>{note.title}</h2>
      <button onClick={ e => { 
        e.stopPropagation()
        deleteNote(note.id) }}>Delete Note</button>
      <p>placeholder for now, maybe a category here? Just keep this for now.</p>
    </div>
  )
}

export default Card