import { useEffect, useState } from 'react'
import styles from './NotebookModal.module.css'
import { useNavigate } from 'react-router-dom'
import { MdChromeReaderMode } from 'react-icons/md'
import { HiOutlineX, HiPlus } from 'react-icons/hi'
import logger from '../../utils/logger'

function NotebookModal({ notebook, onClose, authFetch, API, updateNotebookTags, renameNotebook, removeNoteFromNotebook, addNotesToNotebook, notebookNotesCache, allNotes }) {
    const [notebookNotes, setNotebookNotes] = useState([])
    const [loading, setLoading] = useState(false)
    const [tags, setTags] = useState(notebook?.tags || '')
    const [name, setName] = useState(notebook?.name || '')
    const [showPicker, setShowPicker] = useState(false)
    const [selectedNoteIds, setSelectedNoteIds] = useState([])
    const navigate = useNavigate()

    const availableNotes = allNotes.filter(n => !n.notebook_id)

    useEffect(() => {
        if (notebookNotesCache.current[notebook.id]) {
            setNotebookNotes(notebookNotesCache.current[notebook.id])
            return
        }

        async function fetchNotebookNotes() {
            setLoading(true)
            try {
                const res = await authFetch(`${API}/notebooks/${notebook.id}/notes`);
                if(!res.ok) throw new Error("Failed to fetch the notes of the notebook");
                const data = await res.json()
                setNotebookNotes(data.notes)
                notebookNotesCache.current[notebook.id] = data.notes
            } catch (error) {
                logger.error(`Error fetching notebook's notes:`, error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotebookNotes()
    }, [notebook.id, authFetch, API, notebookNotesCache])

    useEffect(() => {
        setTags(notebook?.tags || '')
    }, [notebook])

    const handleNoteClick = (noteId) => {
        navigate(`/notes/${noteId}`)
        onClose()
    }

    const handleReadMode = (e, noteId) => {
        e.stopPropagation()
        navigate(`/notes/${noteId}?view=read`)
        onClose()
    }

    const handleBacking = (e) => {
        if(e.target === e.currentTarget) onClose()
    }

    const saveTags = () => {
        if (tags === (notebook.tags || '')) return
        updateNotebookTags(notebook.id, tags)
    }

    const saveName = () => {
        const trimmed = name.trim()
        if (trimmed && trimmed !== notebook.name) {
            renameNotebook(notebook.id, trimmed)
        } else {
            setName(notebook.name)
        }
    }

    const handleNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur()
        }
    }

    const handleRemoveNote = (e, noteId) => {
        e.stopPropagation()
        removeNoteFromNotebook(notebook.id, noteId)
        const updated = notebookNotes.filter(n => n.id !== noteId)
        setNotebookNotes(updated)
        notebookNotesCache.current[notebook.id] = updated
    }

    const togglePickerNote = (noteId) => {
        setSelectedNoteIds(prev =>
            prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
        )
    }

    const handleAddNotes = async () => {
        if (selectedNoteIds.length === 0) return
        const added = await addNotesToNotebook(notebook.id, selectedNoteIds)
        if (added.length > 0) {
            const updated = [...notebookNotes, ...added]
            setNotebookNotes(updated)
            notebookNotesCache.current[notebook.id] = updated
        }
        setSelectedNoteIds([])
        setShowPicker(false)
    }

    const cancelPicker = () => {
        setSelectedNoteIds([])
        setShowPicker(false)
    }

    return (
        <div className={styles.backdrop} onClick={handleBacking}>
            <div className={styles.modal}>

                <div className={styles.header}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={saveName}
                        onKeyDown={handleNameKeyDown}
                        className={styles.titleInput}
                    />
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
                    ) : (
                        <>
                            {notebookNotes.length === 0 && !showPicker && (
                                <p className={styles.empty}>No notes in this notebook yet</p>
                            )}

                            {notebookNotes.length > 0 && (
                                <div className={styles.noteList}>
                                    {notebookNotes.map( note => (
                                        <div key={note.id}
                                            className={styles.noteItem}
                                            onClick={() => handleNoteClick(note.id)}
                                        >
                                            <div className={styles.noteItemContent}>
                                                <h4>{note.title}</h4>
                                                {note.tags && <p className={styles.noteTags}>{note.tags}</p>}
                                            </div>
                                            <button
                                                className={styles.readModeBtn}
                                                onClick={(e) => handleReadMode(e, note.id)}
                                                title="Open in read mode"
                                            >
                                                <MdChromeReaderMode size={18} />
                                            </button>
                                            <button
                                                className={styles.removeNoteBtn}
                                                onClick={(e) => handleRemoveNote(e, note.id)}
                                                title="Remove from notebook"
                                            >
                                                <HiOutlineX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!showPicker ? (
                                <div className={styles.addNoteCard} onClick={() => setShowPicker(true)}>
                                    <HiPlus size={18} />
                                    <span>Add notes</span>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.pickerHeader}>
                                        <span className={styles.pickerTitle}>
                                            Select notes to add {selectedNoteIds.length > 0 && `(${selectedNoteIds.length})`}
                                        </span>
                                        <div className={styles.pickerActions}>
                                            <button onClick={cancelPicker} className={`${styles.pickerBtn} ${styles.cancelBtn}`}>
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddNotes}
                                                className={`${styles.pickerBtn} ${styles.confirmBtn}`}
                                                disabled={selectedNoteIds.length === 0}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {availableNotes.length === 0 ? (
                                        <p className={styles.pickerEmpty}>No available notes to add</p>
                                    ) : (
                                        <div className={styles.pickerList}>
                                            {availableNotes.map(note => (
                                                <div
                                                    key={note.id}
                                                    className={`${styles.pickerItem} ${selectedNoteIds.includes(note.id) ? styles.selected : ''}`}
                                                    onClick={() => togglePickerNote(note.id)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedNoteIds.includes(note.id)}
                                                        onChange={() => togglePickerNote(note.id)}
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                    <div className={styles.noteItemContent}>
                                                        <h4>{note.title}</h4>
                                                        {note.tags && <p className={styles.noteTags}>{note.tags}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}

export default NotebookModal
