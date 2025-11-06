import { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Sidebar from "./components/Bars/Sidebar.jsx"
import NotePage from "./pages/NotePage.jsx"
import NotesHub from "./pages/NotesHub.jsx"

function App() {

  const [notes, setNotes] = useState([])

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000' 

  // Insta GET notes
  useEffect(() => {
    async function fetchNotes() {
      try{
        const res = await fetch(`${API}/notes`)
        if(!res.ok) throw new Error(`Failed to fetch notes`)
        const data = await res.json()
        setNotes(data)
      }catch (err){
        console.error(err)
      }
    }

    fetchNotes()
  }, [])

  // add
  const handleAddNote = async (title = 'Untitled') => {
    try{
      const res = await fetch(`${API}/notes`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ title, body: '' })
      })
      if(!res.ok) throw new Error('Failed to add note')
      const newNote = await res.json()
      setNotes(previousNotes => [...previousNotes, newNote])
    }catch(err){
      console.error('FAILED TO ADD NOTE:  ', err)
    }
  }

  // delete
  const handleDeleteNote = async (id) => {
    try {
      const rest = await fetch(`${API}/notes/${id}`, { method: 'DELETE' })
      if(!res.ok) throw new Error('Failed to add note')
      setNotes(previousNotes => previousNotes.filter(n => n.id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  // update (edit) title
  const handleEditTitle = async (id, newTitle) => {
    try {
      const res = await fetch(`${API}/notes/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ title: newTitle })
      })
      if(!res.ok) throw new Error('Failed to add note')
      const updatedNote = await res.json()
      setNotes(previousNotes => previousNotes.map(note => note.id === id ? updatedNote : note))
    } catch (error) {
      console.error(error)
    }
  }
  
  // update (edit) body
  const handleEditBody = async (id, newBody) => {
    try {
      const res = await fetch(`${API}/notes/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ body: newBody })
      })
      if(!res.ok) throw new Error('Failed to add note')
      const data = await res.json()
      setNotes(previousNotes => previousNotes.map(note => note.id === id ? data : note))
    } catch (error) {
      console.error(error)
    }
  }

  //  Elements area
  const notesHubElement = (
    <NotesHub notes={notes} 
    addNote={handleAddNote}
    deleteNote={handleDeleteNote}/>
  )

  const notePageElement = (
    <NotePage notes={notes}
    editTitle={handleEditTitle}
    editBody={handleEditBody} />
  )

  // temp style so that my eyes won't cry when dev mode
  const style = {
    backgroundColor: "#121212", // dark grayish background
    color: "#ffffff",            // white text
    minHeight: "100vh",          // full height
    margin: 0,
    padding: "20px",
    fontFamily: "Arial, sans-serif",

  };


  return (
    <div style={style}>
      <BrowserRouter>
        <Routes>
          <Route path="/notes" element={notesHubElement} />
          <Route path="/notes/:id" element={notePageElement} />
          {/* <Route path="add" element={}/> */}
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
