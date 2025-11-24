import { useState, useEffect } from "react";

// Custom hook for the notes/notebooks
export const useNotes = (authFetch, API, isAuthed) => {

    const [notes, setNotes] = useState([])
    const [notebooks, setNotebooks] = useState([])


    // ----------- Fetch data ================================================================
    useEffect(() => {
        if(!isAuthed) return

        const fetchData = async () => {
            try {
                // We fetch notes
                const notesResponse = await authFetch(`${API}/notes`)
                if(notesResponse.ok) setNotes(await notesResponse.json())
                
                // and then fetch notebooks
                const ntbkResponse = await authFetch(`${API}/notebooks`)
                if(ntbkResponse) setNotebooks(await ntbkResponse.json())

            } catch (error) {
                console.error(`Error fetching for data:`, error)
            }
        }

        fetchData()

    }, [isAuthed, authFetch, API])


    // ----------- Notes Operations like: Creating, deleting, etc. ===========================
    const addNote = async (title = 'Untitled') => {
        try {
            const res = await authFetch(`${API}/notes`, {
                method: "POST",
                body: JSON.stringify({ title, body: '' })
            })
            if(!res.ok) throw new Error(`Failed to add note`)
            
            const newNote = await res.json()
            setNotes(currentNotes => [...currentNotes, newNote])

        } catch (error) {
            console.error(error)
        }
    }

    const deleteNote = async (id) => {
        try {
            const res = await authFetch(`${API}/notes/${id}`, { method: "DELETE" })
            if(!res.ok) throw new Error(`Failed to delete note`)
            setNotes(allNotes => allNotes.filter( note => note.id !== id))

        } catch (error) {
            console.error(error)
        }
    }

    const editTitle = async (id, newTitle) => {
        // For this, we'll go the optimistic way: The notes will always be updated so just set the frontend side to already have the updated title. In the background we'll do the api call to actually update

        setNotes(allNotes => allNotes.map( note => note.id === id ? {...note, title: newTitle} : note))

        try {
            await authFetch(`${API}/notes/${id}`, {
                method: "PUT",
                body: JSON.stringify({ title: newTitle })
            })
        } catch (error) {
            console.error(error)
        }
    }

    const editBody = async (id, newBody) => {
        // Not optimistic here kay i think it's better because the body is quite big

        try {
            const res = await authFetch(`${API}/notes/${id}`, {
                method: "PUT",
                body: JSON.stringify({ body: newBody })
            })
            if(!res.ok) throw new Error("Failed to update body/description/contents");
            const data = await res.json()
            setNotes(allNotes => allNotes.map( note => note.id === id ? data : note))
        
        } catch (error) {
            console.error(error)
        }
    }


    // ----------- Notes Operations like: Creating, deleting, etc. ===========================
    const createNotebook = async (name, noteIds) => {
        try {
            // create notebook
            const res = await authFetch(`${API}/notebooks`, {
                method: "POST",
                body: JSON.stringify({ name, noteIds })
            })
            if(!res.ok) throw new Error("Failed to create notebook");
            
            // get the newly created notebook and the updated list of notes
            const { notebook, updatedNotes } = await res.json()

            // update notes to be the newly updated list
            setNotes(currentNotes => currentNotes.map( note => {
                const updatedVersion = updatedNotes.find(currNote => currNote.id === note.id)
                return updatedVersion || note
            }))

            // add notebook
            setNotebooks(currNotebooks => [notebook, ...currNotebooks])
            alert(`Notebook created successfully`)

        } catch (error) {
            console.error(error)
        }
    }

    const deleteNotebook = async (id) => {
        try {
            const res = await authFetch(`${API}/notebooks/${id}`, { method: "DELETE" })
            if(!res.ok) throw new Error("Failed to delete notebook");
            
            setNotebooks(currentNotebooks => currentNotebooks.filter(note => note.id !== id))

            // Refresh the notes to update their notebook_id and appear on the lists of notes
            const noteRes = await authFetch(`${API}/notes`) // just call GET again
            if(noteRes.ok) setNotes(await noteRes.json())
            
        } catch (error) {
            console.error(error)
        }
    }


    return {
        notes,
        notebooks,
        addNote,
        deleteNote,
        editTitle,
        editBody,
        createNotebook,
        deleteNotebook
    }
}