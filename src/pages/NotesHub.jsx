import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/NoteCard/Card'
import HorizontalCard from '../components/NoteCard/HorizontalCard'
import AddCard from '../components/NoteCard/AddCard'
import AddCardList from '../components/NoteCard/AddCardList'

// obtains the notes and 
function NotesHub({ notes, addNote, deleteNote }) {

  const [viewMode, setViewMode] = useState("list")

  const navigate = useNavigate()

  const changeView = () => viewMode === "list" ? setViewMode("grid") : setViewMode("list")


  return (
    <div>
        <h1>NotesHub</h1>
        <button onClick={changeView}>Toggle View</button>
        <p>Mode: {viewMode}  |  Debug purposes</p>

        

        {/* Add note area */}
        {viewMode === "list" ? 
          <AddCardList addNote={addNote}/>
          :
          <AddCard addNote={addNote}/>
        }

        
        
        {/* notes list area */}
        <div>
          {viewMode === "list"
            ? notes.map( note => <HorizontalCard key={note.id} note={note} deleteNote={deleteNote} /> )
            : notes.map( note => <Card key={note.id} note={note} deleteNote={deleteNote} /> )
          }
        </div>


    </div>
  )
}

export default NotesHub