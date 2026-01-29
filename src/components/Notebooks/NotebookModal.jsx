import { useEffect, useState } from 'react'
import styles from './NotebookModal.module.css'
import { useNavigate } from 'react-router-dom'

function NotebookModal({ notebook, onClose, authFetch, API, updateNotebookTags}) {
    const [notebookNotes, setNotebookNotes] = useState([])
    const [loading, setLoading] = useState(false)
    const [tags, setTags] = useState(notebook?.tags || '')
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchNotebookNotes() {
            try {
                const res = await authFetch(`${API}/notebooks/${notebook.id}/notes`)
                if(!res.ok) throw new Error("Failed to fetch the notes of the notebook");
                const data = await res.json()
                setNotebookNotes(data)
            } catch (error) {
                console.error(`Error fetching notebook's notes:`, error)
            }finally{
                setLoading(false)
            }
        }

        fetchNotebookNotes()
    }, [notebook.id, authFetch, API])

    useEffect(() => {
        setTags(notebook?.tags || '')
    }, [notebook])

    const handleNoteClick = (noteId) => {
        navigate(`/notes/${noteId}`)
        onClose()
    }

    const handleBacking = (e) => {
        if(e.target === e.currentTarget) onClose()
    }

    const saveTags = () => {
        updateNotebookTags(notebook.id, tags)
    }

    return (
        <div className={styles.backdrop} onClick={handleBacking}>
            <div className={styles.modal}>

                <div className={styles.header}>
                    <h2>{notebook.name}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>

                <div className={styles.tagsSection}>
                    <label htmlFor="notebook-tags" className={styles.tagsLabel}>Tags</label>
                    <input
                        id="notebook-tags"
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        onBlur={saveTags}
                        placeholder="Add tags (e.g., work, personal, archive...)"
                        className={styles.tagsInput}
                    />
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <p className={styles.loading}>Loading notes....</p>
                    ) : notebookNotes.length === 0 ? (
                        <p className={styles.empty}>No notes in this notebook yet</p>
                    ) : (
                        <div className={styles.noteList}>
                            {notebookNotes.map( note => (
                                <div key={note.id}
                                    className={styles.noteItem}
                                    onClick={() => handleNoteClick(note.id)}
                                >
                                    <h4>{note.title}</h4>
                                    <p>{note.body ? note.body.substring(0, 100) + '...' : 'No content'}</p>
                                    <span className={styles.date}>
                                        {new Date(note.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default NotebookModal
