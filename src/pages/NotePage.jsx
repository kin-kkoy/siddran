import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './NotePage.module.css'

function NotesPage({ notes, editTitle, editBody }) {
  
  const { id } = useParams()
  const navigate = useNavigate()
  const note = notes && notes.length ? notes.find(n => n.id === Number(id)) : null

  if(!note) return <div>Loading note...</div>

  const [newTitle, setNewTitle] = useState(note?.title || "")
  const [newBody, setNewBody] = useState(note?.body || "")
  const titleInputReference = useRef(null); // `useRef` is basically just React's way of doing: `document.querySelectorAll()` or `.getElementByID()`

  // re-renders if note changes (parent changes)
  useEffect(() => {
    if(note){
      setNewTitle(note.title)
      setNewBody(note.body)
    }
  }, [note])

  // this is for auto-selecting title when first created and visited
  useEffect(() => {
    if(newTitle === "Untitled" && titleInputReference.current){
      titleInputReference.current.select()
    }
  }, [newTitle, id])

  // the api calls to save title/body
  const saveTitle = async () => {
    if(!newTitle.trim()){
      alert('Title cannot be empty')
      setNewTitle(note.title) // revert back to original title
      return;
    }
    await editTitle(note.id, newTitle)
  }
  const saveBody = async () => {
    await editBody(note.id, newBody)
  }

  return (
    <div className={styles.container}>

      <button onClick={() => navigate(`/notes`)} className={styles.backBtn}>← Back to Notes</button>

      <div className={styles.debugSection}>
        <p>---------- Debug Purposes only-----------</p>
        <p> === DON'T FORGET TO REMOVE THIS IN CODE AND IN THE CSS</p>
        <h1>Title: {note.title}</h1>
        <p>Body: {note.body}</p>
        <p>-----------------------------------------</p>
      </div>

      <input
        ref={titleInputReference}
        className={styles.titleInput}
        type='text'
        value={newTitle}
        onChange={ e => setNewTitle(e.target.value)}
        onBlur={saveTitle}
      />
      <textarea
      className={styles.bodyTextarea}
        value={newBody}
        onChange={ e => setNewBody(e.target.value)}
          // maybe add focus here but for now keep as is
        onBlur={saveBody}
        placeholder='Start typing here...'
      />

    </div>

  )
}

export default NotesPage