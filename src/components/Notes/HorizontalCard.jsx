import { Link } from 'react-router-dom'
import styles from './Card.module.css'
import { FaTrash, FaStar, FaRegStar, FaEllipsisV } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'

function HorizontalCard({ note, deleteNote, isSelectionMode, isSelected, onToggleSelect, toggleFavorite, updateColor }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState('below') // 'above' or 'below'
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

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
    if(window.confirm(`Delete "${note.title}"?`)) deleteNote(note.id)
  }

  const cardClicked = (e) => {
    // If in selection mode, toggle selection instead of navigating
    if (isSelectionMode) {
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


  const cardContent = (
    <div
      className={`${styles.horizontalCard} ${isSelected ? styles.selected : ''}`}
      style={{ backgroundColor: note.color || '#1e1e1e' }}
      onClick={cardClicked}
    >

      {/* checkbox should ONLY APPEAR IN SELECTION MODE */}
      {isSelectionMode && (
        <div className={styles.checkbox}>
          <input type='checkbox'
            checked={isSelected}
            onChange={onToggleSelect}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <div className={styles.horizontalCardContent}>
        <h4>{note.title}</h4>
        {note.tags && <p className={styles.preview}>{note.tags}</p>}
      </div>

      <div className={styles.meta}>
        {/* Show menu and delete button only when NOT in selection mode */}
        {!isSelectionMode && (
          <>
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
                      <button onClick={(e) => handleColorChange(e, null)} className={styles.colorBtn} style={{ backgroundColor: '#1e1e1e' }} title="Default"></button>
                      <button onClick={(e) => handleColorChange(e, '#2a2a1a')} className={styles.colorBtn} style={{ backgroundColor: '#2a2a1a' }} title="Brown"></button>
                      <button onClick={(e) => handleColorChange(e, '#1a2a2a')} className={styles.colorBtn} style={{ backgroundColor: '#1a2a2a' }} title="Teal"></button>
                      <button onClick={(e) => handleColorChange(e, '#2a1a2a')} className={styles.colorBtn} style={{ backgroundColor: '#2a1a2a' }} title="Purple"></button>
                      <button onClick={(e) => handleColorChange(e, '#2a1a1a')} className={styles.colorBtn} style={{ backgroundColor: '#2a1a1a' }} title="Red"></button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleDelete} className={styles.deleteBtn}>
              <FaTrash />
            </button>
          </>
        )}
      </div>

    </div>
  )


  return isSelectionMode ? (
    cardContent
  ) : (
    <Link to={`/notes/${note.id}`} style={{textDecoration: 'none'}}>
      {cardContent}
    </Link>
  )
}

export default HorizontalCard