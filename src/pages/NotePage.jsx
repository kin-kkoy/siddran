import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function NotesPage({ notes, editTitle, editBody }) {
  
  const { id } = useParams()
  const navigate = useNavigate()
  const note = notes && notes.length ? notes.find(n => n.id === Number(id)) : null

  if(!note) return <div>Loading note...</div>

  const [newTitle, setNewTitle] = useState(note?.title || "")
  const [newBody, setNewBody] = useState(note?.body || "")

  // re-renders if note changes (parent changes)
  useEffect(() => {
    if(note){
      setNewTitle(note.title)
      setNewBody(note.body)
    }
  }, [note])

  // the api calls to save title/body
  const saveTitle = async () => {
    await editTitle(note.id, newTitle)
  }
  const saveBody = async () => {
    await editBody(note.id, newBody)
  }

  return (
    <div>

      <button onClick={() => navigate(`/notes`)}>temporary button, remove once sidebar implemented</button>

      <p>---------- Debug Purposes only-----------</p>
      <h1>{note.title}</h1>
      <p>{note.body}</p>
      <p>-----------------------------------------</p>

      <input
        type='text'
        value={newTitle}
        onChange={ e => setNewTitle(e.target.value)}
        onBlur={saveTitle}
      />
      <br/>
      <textarea
        value={newBody}
        onChange={ e => setNewBody(e.target.value)}
          // maybe add focus here but for now keep as is
        onBlur={saveBody}
      />

    </div>

  )
}

export default NotesPage