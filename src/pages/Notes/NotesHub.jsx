import { useState } from 'react'
import Card from '../../components/Notes/Card'
import HorizontalCard from '../../components/Notes/HorizontalCard'
import AddCard from '../../components/Notes/AddCard'
import AddCardList from '../../components/Notes/AddCardList'
import styles from './NotesHub.module.css'
import HorizontalNotebookCard from '../../components/Notebooks/HorizontalNotebookCard'
import NotebookCard from '../../components/Notebooks/NotebookCard'
import NotebookModal from '../../components/Notebooks/NotebookModal'
import CreateNotebookModal from '../../components/Notebooks/CreateNotebookModal'

// obtains the notes and
function NotesHub({ notes, notebooks, addNote, deleteNote, toggleFavorite, updateColor, createNotebook, deleteNotebook, toggleFavoriteNotebook, updateNotebookColor, updateNotebookTags, authFetch, API }) {

  const [viewMode, setViewMode] = useState("list")
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState([])
  const [selectedNotebook, setSelectedNotebook] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const changeView = () => viewMode === "list" ? setViewMode("grid") : setViewMode("list")

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedNotes([])  // clear the selected notes when toggling
  }

  const toggleNoteSelection = noteId => {
    setSelectedNotes(prevNote => prevNote.includes(noteId) ? prevNote.filter(id => id !== noteId) : [...prevNote, noteId])
  }

  const handleOpenCreateModal = () => {
    if(selectedNotes.length === 0){
      alert('Please select at least one note to create a notebook')
      return
    }
    setShowCreateModal(true)
  }

  const handleCreateNotebook = async (name, tags) => {
    await createNotebook(name, selectedNotes, tags)
    setIsSelectionMode(false)
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
            {filteredNotebooks.length} {filteredNotebooks.length === 1 ? 'notebook | ' : 'notebooks | '}
            {loneNotes.length} {loneNotes.length === 1 ? 'note' : 'notes'}
            {isSelectionMode && ` (${selectedNotes.length} selected)`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isSelectionMode && (
            <button
              onClick={handleOpenCreateModal}
              className={styles.createNotebookBtn}
              disabled={selectedNotes.length === 0}
            >
              Create Notebook ({selectedNotes.length})
            </button>
          )}
          
          <button 
            onClick={toggleSelectionMode} 
            className={styles.toggleBtn}
          >
            {isSelectionMode ? 'Cancel' : 'Select Notes'}
          </button>

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


      {/* Modal area */}
      {selectedNotebook && (
        <NotebookModal
          notebook={selectedNotebook}
          onClose={handleCloseModal}
          authFetch={authFetch}
          API={API}
          updateNotebookTags={updateNotebookTags}
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


    </div>
  )
}

export default NotesHub