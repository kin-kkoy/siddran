import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom' // ← Add this import
import { Link, useNavigate, useParams } from 'react-router-dom'
import styles from './NotePage.module.css'
import { IoMdArrowRoundBack } from "react-icons/io";

function NotePage({ notes, editTitle, editBody }) {
  
  const { id } = useParams()
  const navigate = useNavigate()
  const note = notes && notes.length ? notes.find(n => n.id === Number(id)) : null

  if(!note) return <div>Loading note...</div>

  const [newTitle, setNewTitle] = useState(note?.title || "")
  const [newBody, setNewBody] = useState(note?.body || "")
  const titleInputReference = useRef(null); // `useRef` is basically just React's way of doing: `document.querySelectorAll()` or `.getElementByID()`
  const bodyRef = useRef(null);

  // re-renders if note changes (parent changes)
  useEffect(() => {
    if(note){
      setNewTitle(note.title)
      setNewBody(note.body)
    }
  }, [note])

  // this is for auto-selecting title when first created and visited
  useLayoutEffect(() => {
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
    editTitle(note.id, newTitle)
  }
  const saveBody = async () => {
     editBody(note.id, newBody)
  }

  // QoL: after pressing enter on title, move to body asap
  const handleKeyDown = e => {
    if(e.key === "Enter" || e.key === "Tab"){
      e.preventDefault();
      bodyRef.current?.focus();
    }
  }

  // for back button
  const handleGoBackBtn = () =>{
    navigate('/notes')
  }

  return (
    <div className={styles.container}>

      <button onClick={handleGoBackBtn} className={styles.backBtn}><IoMdArrowRoundBack /> Back to Notes</button>

      {/* Show warning if title is Untitled */}
      {newTitle === "Untitled" && (
        <div className={styles.titleWarning}>
          💡 Tip: Give your note a title to easily find it later
        </div>
      )}

      <input
        ref={titleInputReference}
        className={styles.titleInput}
        type='text'
        value={newTitle}
        onChange={ e => setNewTitle(e.target.value)}
        onBlur={saveTitle}
        onKeyDown={handleKeyDown}
      />
      <textarea
        ref={bodyRef}
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

export default NotePage