import { useState, useEffect, useRef } from 'react'
import Card from '../../components/Notes/Card'
import HorizontalCard from '../../components/Notes/HorizontalCard'
import AddCard from '../../components/Notes/AddCard'
import AddCardList from '../../components/Notes/AddCardList'
import styles from './NotesHub.module.css'
import HorizontalNotebookCard from '../../components/Notebooks/HorizontalNotebookCard'
import NotebookCard from '../../components/Notebooks/NotebookCard'
import NotebookModal from '../../components/Notebooks/NotebookModal'
import CreateNotebookModal from '../../components/Notebooks/CreateNotebookModal'
import ConfirmModal from '../../components/Common/ConfirmModal'
import { HiOutlineTrash } from 'react-icons/hi'
import { LuNotebookPen } from 'react-icons/lu'
import { toast } from '../../utils/toast'

// obtains the notes and
function NotesHub({ notes, notebooks, notesPagination, notebooksPagination, loadMoreNotes, loadMoreNotebooks, loadingMore, addNote, deleteNote, toggleFavorite, updateColor, createNotebook, deleteNotebook, toggleFavoriteNotebook, updateNotebookColor, updateNotebookTags, renameNotebook, removeNoteFromNotebook, addNotesToNotebook, authFetch, API }) {

  // Persist view mode in localStorage
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('notesViewMode') || 'list'
  })
  // Selection mode can be: null, 'delete', or 'create'
  const [selectionMode, setSelectionMode] = useState(null)
  const [selectedNotes, setSelectedNotes] = useState([])
  const [selectedNotebook, setSelectedNotebook] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Helper to check if in any selection mode
  const isSelectionMode = selectionMode !== null

  // Cache for notebook notes (avoids refetching on every modal open)
  const notebookNotesCache = useRef({})

  // Refs for infinite scroll sentinels
  const notesSentinelRef = useRef(null)
  const notebooksSentinelRef = useRef(null)
  const scrollIntentTimeoutRef = useRef(null)
  const notebookScrollTimeoutRef = useRef(null)

  const hasMoreNotes = notesPagination?.hasNextPage
  const hasMoreNotebooks = notebooksPagination?.hasNextPage

  // Intersection Observer for notes infinite scroll
  useEffect(() => {
    if (!hasMoreNotes || loadingMore) return

    const sentinel = notesSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !loadingMore) {
          scrollIntentTimeoutRef.current = setTimeout(() => {
            loadMoreNotes()
          }, 300)
        } else {
          if (scrollIntentTimeoutRef.current) {
            clearTimeout(scrollIntentTimeoutRef.current)
          }
        }
      },
      { root: null, rootMargin: '100px', threshold: 0 }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      if (scrollIntentTimeoutRef.current) {
        clearTimeout(scrollIntentTimeoutRef.current)
      }
    }
  }, [hasMoreNotes, loadingMore, loadMoreNotes])

  // Intersection Observer for notebooks infinite scroll
  useEffect(() => {
    if (!hasMoreNotebooks || loadingMore) return

    const sentinel = notebooksSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !loadingMore) {
          notebookScrollTimeoutRef.current = setTimeout(() => {
            loadMoreNotebooks()
          }, 300)
        } else {
          if (notebookScrollTimeoutRef.current) {
            clearTimeout(notebookScrollTimeoutRef.current)
          }
        }
      },
      { root: null, rootMargin: '100px', threshold: 0 }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      if (notebookScrollTimeoutRef.current) {
        clearTimeout(notebookScrollTimeoutRef.current)
      }
    }
  }, [hasMoreNotebooks, loadingMore, loadMoreNotebooks])

  const changeView = () => {
    const newMode = viewMode === "list" ? "grid" : "list"
    setViewMode(newMode)
    localStorage.setItem('notesViewMode', newMode)
  }

  // Batch delete selected notes
  const handleBatchDelete = () => {
    if (selectedNotes.length === 0) return
    setShowDeleteModal(true)
  }

  const confirmBatchDelete = () => {
    selectedNotes.forEach(id => deleteNote(id))
    setSelectedNotes([])
    setSelectionMode(null)
    setShowDeleteModal(false)
  }

  const enterDeleteMode = () => {
    setSelectionMode('delete')
    setSelectedNotes([])
  }

  const enterCreateMode = () => {
    setSelectionMode('create')
    setSelectedNotes([])
  }

  const exitSelectionMode = () => {
    setSelectionMode(null)
    setSelectedNotes([])
  }

  const toggleNoteSelection = noteId => {
    setSelectedNotes(prevNote => prevNote.includes(noteId) ? prevNote.filter(id => id !== noteId) : [...prevNote, noteId])
  }

  const handleOpenCreateModal = () => {
    if(selectedNotes.length === 0){
      toast.warning('Please select at least one note to create a notebook')
      return
    }
    setShowCreateModal(true)
  }

  const handleCreateNotebook = async (name, tags) => {
    await createNotebook(name, selectedNotes, tags)
    setSelectionMode(null)
    setSelectedNotes([])
    setShowCreateModal(false)
  }

  const handleOpenNotebook = notebook => setSelectedNotebook(notebook)

  const handleCloseModal = () => setSelectedNotebook(null)

  // Filter notebooks based on search query
  const filteredNotebooks = notebooks.filter(notebook => {
    if (!searchQuery.trim()) return true // if search bar is empty then return everything (show everythign basically)

    const query = searchQuery.toLowerCase().trim()
    const name = notebook.name?.toLowerCase() || ''
    const tags = notebook.tags?.toLowerCase() || ''

    if (name.includes(query)) return true // Check if query matches notebook name

    // Check if query matches tags (with or without # prefix; "#work" == "work" && "work" == "#work" IN TAGS only)
    const searchTerm = query.startsWith('#') ? query.slice(1) : query
    if (tags.includes(searchTerm)) return true

    return false
  }).sort((a, b) => {
    // Sort by favorite status (favorites first ofc)
    if (a.is_favorite && !b.is_favorite) return -1
    if (!a.is_favorite && b.is_favorite) return 1
    return 0
  })

  // Filter notes that aren't a part of any notebook, then apply search filter, then sort by favorites first
  const loneNotes = notes.filter(note => !note.notebook_id).filter(note => {
      if (!searchQuery.trim()) return true // if search bar is empty then return everything (show everythign basically)

      const query = searchQuery.toLowerCase().trim()
      const title = note.title?.toLowerCase() || ''
      const tags = note.tags?.toLowerCase() || ''

      if (title.includes(query)) return true // Check if query matches title then return the note/s

      const searchTerm = query.startsWith('#') ? query.slice(1) : query
      if (tags.includes(searchTerm)) return true

      return false
    })
    .sort((a, b) => {
      // Sort by favorite status (favorites first ofc)
      if (a.is_favorite && !b.is_favorite) return -1
      if (!a.is_favorite && b.is_favorite) return 1
      return 0
    })


  return (
    <div className={styles.container}>


      <div className={styles.header}>
        <h1>NotesHub</h1>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search notes and notebooks by title or tags (e.g., #work)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.controls}>

        <div>
          <p style={{ color: '#888', fontSize: '14px' }}>
            {filteredNotebooks.length} {filteredNotebooks.length === 1 ? 'notebook · ' : 'notebooks · '}
            {loneNotes.length} {loneNotes.length === 1 ? 'note' : 'notes'}
            {isSelectionMode && ` (${selectedNotes.length} selected)`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Delete button - visible when not in create mode */}
          {selectionMode !== 'create' && (
            <button
              onClick={selectionMode === 'delete' ? handleBatchDelete : enterDeleteMode}
              className={styles.batchDeleteBtn}
              disabled={selectionMode === 'delete' && selectedNotes.length === 0}
              title={selectionMode === 'delete' ? "Delete selected notes" : "Select notes to delete"}
            >
              <HiOutlineTrash size={18} />
            </button>
          )}

          {/* Create Notebook button - visible when not in delete mode */}
          {selectionMode !== 'delete' && (
            <button
              onClick={selectionMode === 'create' ? handleOpenCreateModal : enterCreateMode}
              className={styles.createNotebookBtn}
              disabled={selectionMode === 'create' && selectedNotes.length === 0}
            >
              <LuNotebookPen size={16} />
              {selectionMode === 'create' ? `Create (${selectedNotes.length})` : 'Create Notebook'}
            </button>
          )}

          {/* Cancel button - only in selection mode */}
          {isSelectionMode && (
            <button onClick={exitSelectionMode} className={styles.toggleBtn}>
              Cancel
            </button>
          )}

          <button onClick={changeView} className={styles.toggleBtn}>
            {viewMode === "list" ? "Card View" : "List View"}
          </button>
        </div>

      </div>


      {/* ADD NOTE FOR LIST VIEW - above list */}
      {viewMode === "list" && !isSelectionMode && <AddCardList addNote={addNote}/>}

      {/* notes display area && ADD NOTE FOR CARD VIEW */}
      <div className={viewMode === "grid" ? styles.gridView : styles.listView}>

        {/* list view by default, change if it's in grid view */}
        {viewMode === "grid" && !isSelectionMode && <AddCard addNote={addNote}/>}
        
        {/* display NOTEBOOKS FIRST */}
        {!isSelectionMode && (
          viewMode === "list" ?
            filteredNotebooks.map(notebook => (
              <HorizontalNotebookCard
                key={notebook.id}
                notebook={notebook}
                deleteNotebook={deleteNotebook}
                onOpen={handleOpenNotebook}
                toggleFavoriteNotebook={toggleFavoriteNotebook}
                updateNotebookColor={updateNotebookColor}
              />
            ))
            :
            filteredNotebooks.map(notebook => (
              <NotebookCard
                key={notebook.id}
                notebook={notebook}
                deleteNotebook={deleteNotebook}
                onOpen={handleOpenNotebook}
                toggleFavoriteNotebook={toggleFavoriteNotebook}
                updateNotebookColor={updateNotebookColor}
              />
            ))
        )}

        {/* afterwards display the LONE NOTES (notes that aren't part of a notebook) */}
        {viewMode === "list" ?
          loneNotes.map( note => (
            <HorizontalCard key={note.id}
              note={note}
              deleteNote={deleteNote}
              toggleFavorite={toggleFavorite}
              updateColor={updateColor}
              isSelectionMode={isSelectionMode}
              isSelected={selectedNotes.includes(note.id)}
              onToggleSelect={() => toggleNoteSelection(note.id)}
            />
          ))
          :
          loneNotes.map( note => (
            <Card key={note.id}
              note={note}
              deleteNote={deleteNote}
              toggleFavorite={toggleFavorite}
              updateColor={updateColor}
              isSelectionMode={isSelectionMode}
              isSelected={selectedNotes.includes(note.id)}
              onToggleSelect={() => toggleNoteSelection(note.id)}
            />
          ))
        }
      </div>

      {/* Infinite scroll sentinels */}
      {hasMoreNotebooks && (
        <div ref={notebooksSentinelRef} className={styles.sentinel}>
          {loadingMore ? <span className={styles.loadingDots}>...</span> : <span className={styles.moreDots}>...</span>}
        </div>
      )}
      {hasMoreNotes && (
        <div ref={notesSentinelRef} className={styles.sentinel}>
          {loadingMore ? <span className={styles.loadingDots}>...</span> : <span className={styles.moreDots}>...</span>}
        </div>
      )}


      {/* Modal area */}
      {selectedNotebook && (
        <NotebookModal
          notebook={selectedNotebook}
          onClose={handleCloseModal}
          authFetch={authFetch}
          API={API}
          updateNotebookTags={updateNotebookTags}
          renameNotebook={renameNotebook}
          removeNoteFromNotebook={removeNoteFromNotebook}
          addNotesToNotebook={addNotesToNotebook}
          notebookNotesCache={notebookNotesCache}
          allNotes={notes}
        />
      )}

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <CreateNotebookModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateNotebook}
          selectedNotesCount={selectedNotes.length}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmBatchDelete}
        title="Delete Notes"
        message={`Are you sure you want to delete ${selectedNotes.length} selected note(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

    </div>
  )
}

export default NotesHub