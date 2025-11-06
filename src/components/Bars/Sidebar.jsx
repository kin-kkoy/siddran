import { useState } from "react"


// CHANGE EVERYTHING THERE!! WHAT SHOULD HAPPEN:
//  - Initially will not show (in home page) but when either notes/todo/mod(game)
//      is added, will appear and will change depending on whether notes/todo/mod(game)
//  - Notes: will have a buttons for: home page, todo, mod(game). Then below those
//      buttons will be an add note/folder button and then the list of notes (buttons)
//  - Todo: to implement but same concept
//  - Game: (Don't bother yet and think about this feature much more thoroughly)


function Sidebar({notes, selectedNote, handleSelectedNote, handleAddNote}) {

    const [noteTitle, setNoteTitle] = useState("")

    const addNote = () => {
        // I'll put the guard logic here
        if(noteTitle === "") return alert(`Empty title not allowed`)

        handleAddNote(noteTitle);
        setNoteTitle("")
    };


    // Don't mind these 2 yet, to be implemented soon since these are just extras
    // Sort note
    const sortNote = choice => {
        // TODO: Ideally, the sorting happens in the backend, and frontend simply fetches and displays.
        alert(`This is temporary, sorting should be implemented`)
    }
    
    // Display note toggle (card/list view)
    const displayToggle = choice => {
        // TODO: Clicking this button toggles between card/list view
        alert(`This is temporary, toggling will be implemented`)
    }


    return (
        <div className="sidebar">
            <input type="text" value={noteTitle} onChange={ e => setNoteTitle(e.target.value)} />
            <br/>
            <button onClick={addNote}>+ Create Note</button>
            
            {/* <button onClick={sortNote}>A-Z</button>
            <button onClick={displayToggle}>Time</button> */}

            {/* Tasks rendered here, style is AI generated lol too lazy to actually design it */}
            <ul>
                {notes.map( note => {
                    return(
                        <li
                            key={note.id}
                            onClick={() => handleSelectedNote(note)}
                            style={{
                                cursor: "pointer", // makes it look clickable
                                color: "blue",     // just for visual feedback
                            }}
                        >
                            {note.title}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Sidebar