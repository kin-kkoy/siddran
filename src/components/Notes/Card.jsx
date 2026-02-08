import { FaStar, FaRegStar, FaEllipsisV } from 'react-icons/fa'
import { HiOutlineTrash } from 'react-icons/hi'
import styles from './Card.module.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import ConfirmModal from '../Common/ConfirmModal'
import { MdChromeReaderMode } from 'react-icons/md'
import { useSettings } from '../../contexts/SettingsContext'
import { NOTE_COLORS, getNoteBackground, getSwatchColor } from './noteColors'

function Card({ note, deleteNote, isSelectionMode, isSelected, onToggleSelect, toggleFavorite, updateColor }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState('below') // 'above' or 'below'
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()
  const { settings } = useSettings()
  const noteBackground = getNoteBackground(note.color, settings.mode)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    deleteNote(note.id)
    setShowDeleteModal(false)
  }

  const cardClicked = (e) => {
    // stop the usual navigation if in selection mode (selecting notes to add to notebook) and instead allow selection
    if(isSelectionMode){
      e.preventDefault()
      onToggleSelect()
    }
  }

  const toggleMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!menuOpen && buttonRef.current) {
      // Calculate if there's enough space below
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - buttonRect.bottom
      const menuHeight = 180 // Approximate menu height

      // If not enough space below, show above
      setMenuPosition(spaceBelow < menuHeight ? 'above' : 'below')
    }

    setMenuOpen(!menuOpen)
  }

  const handleFavoriteToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(note.id)
    setMenuOpen(false)
  }

  const handleColorChange = (e, color) => {
    e.preventDefault()
    e.stopPropagation()
    updateColor(note.id, color)
  }

  const handleOpenInReadMode = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/notes/${note.id}?view=read`)
  }


  const cardContent = (
    <div
      className={`${styles.card} ${isSelected ? styles.isSelected : ''}`}
      style={noteBackground ? { backgroundColor: noteBackground } : undefined}
      onClick={ cardClicked }
    >

      {isSelectionMode && (
        <div className={styles.checkbox}>
          <input type='checkbox'
            checked={isSelected}
            onChange={onToggleSelect}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <div className={styles.cardHeader}>
        <h2 className={styles.title}>{note.title}</h2>
        {!isSelectionMode && (
          <div className={styles.menuContainer} ref={menuRef}>
            <button ref={buttonRef} onClick={toggleMenu} className={styles.menuBtn}>
              <FaEllipsisV />
            </button>

            {menuOpen && (
              <div className={`${styles.menu} ${menuPosition === 'above' ? styles.menuAbove : styles.menuBelow}`}>
                <button onClick={handleFavoriteToggle} className={styles.menuItem}>
                  {note.is_favorite ? <FaStar color="#fbbf24" /> : <FaRegStar />}
                  <span>{note.is_favorite ? 'Unfavorite' : 'Favorite'}</span>
                </button>

                <div className={styles.colorPicker}>
                  <span className={styles.colorLabel}>Color:</span>
                  <div className={styles.colorOptions}>
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c.name}
                        onClick={(e) => handleColorChange(e, c.key)}
                        className={styles.colorBtn}
                        style={{ backgroundColor: getSwatchColor(c, settings.mode) || 'var(--bg-surface)' }}
                        title={c.name}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {note.tags && <p className={styles.preview}>{note.tags}</p>}

      <div className={styles.footer}>
        {!isSelectionMode && (
          <>
            <button onClick={handleOpenInReadMode} className={styles.readModeBtn}><MdChromeReaderMode size={18} /></button>
            <button onClick={handleDelete} className={styles.deleteBtn}><HiOutlineTrash size={18} /></button>
          </>
        )}
      </div>
    </div>
  )


  return (
    <>
      {isSelectionMode ? (
        cardContent
      ) : (
        <Link to={`/notes/${note.id}`} style={{ textDecoration: 'none' }}>
          {cardContent}
        </Link>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Note"
        message={`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}

export default Card