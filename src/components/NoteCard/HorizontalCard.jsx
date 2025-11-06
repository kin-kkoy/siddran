import { useNavigate } from 'react-router-dom'

function HorizontalCard({ note, deleteNote }) {
  
  const navigate = useNavigate()

  return (
    <div onClick={ () => navigate(`/notes/${note.id}`)}>
        <p>--------------------------------------</p>
        <h4>{note.title}</h4>
        <p>category here maybe</p>
        <button onClick={(e) => {
          e.stopPropagation()
          deleteNote(note.id)}}
        >Delete Note</button>
        <p>--------------------------------------</p>
    </div>
  )
}

export default HorizontalCard