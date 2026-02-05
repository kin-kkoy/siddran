import { LuNotebook } from 'react-icons/lu';
import { FaStar, FaRegStar, FaEllipsisV } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import styles from './NotebookCard.module.css'
import { useState, useRef, useEffect } from 'react'
import ConfirmModal from '../Common/ConfirmModal'

function NotebookCard({ notebook, deleteNotebook, onOpen, toggleFavoriteNotebook, updateNotebookColor }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [menuPosition, setMenuPosition] = useState('below')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
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
        setShowDeleteModal(true)
    }

    const confirmDelete = () => {
        deleteNotebook(notebook.id)
        setShowDeleteModal(false)
    }

    const handleClick = (e) => {
        e.preventDefault()
        onOpen(notebook)
    }

    const toggleMenu = (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!menuOpen && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - buttonRect.bottom
            const menuHeight = 180

            setMenuPosition(spaceBelow < menuHeight ? 'above' : 'below')
        }

        setMenuOpen(!menuOpen)
    }

    const handleFavoriteToggle = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavoriteNotebook(notebook.id)
        setMenuOpen(false)
    }

    const handleColorChange = (e, color) => {
        e.preventDefault()
        e.stopPropagation()
        updateNotebookColor(notebook.id, color)
    }

    return (
        <>
            <div onClick={handleClick} className={styles.cardLink} style={{ cursor: 'pointer' }}>
                <div className={styles.card} style={{ borderLeftColor: notebook.color || '#4a9eff' }}>
                    <div className={styles.header}>
                        <div style={{ flex: 1 }}>
                            <div className={styles.icon}><LuNotebook /></div>
                            <h3 className={styles.title}>{notebook.name}</h3>
                        </div>
                        <div className={styles.menuContainer} ref={menuRef}>
                            <button ref={buttonRef} onClick={toggleMenu} className={styles.menuBtn}>
                                <FaEllipsisV />
                            </button>

                            {menuOpen && (
                                <div className={`${styles.menu} ${menuPosition === 'above' ? styles.menuAbove : styles.menuBelow}`}>
                                    <button onClick={handleFavoriteToggle} className={styles.menuItem}>
                                        {notebook.is_favorite ? <FaStar color="#fbbf24" /> : <FaRegStar />}
                                        <span>{notebook.is_favorite ? 'Unfavorite' : 'Favorite'}</span>
                                    </button>

                                    <div className={styles.colorPicker}>
                                        <span className={styles.colorLabel}>Border Color:</span>
                                        <div className={styles.colorOptions}>
                                            <button onClick={(e) => handleColorChange(e, '#4a9eff')} className={styles.colorBtn} style={{ backgroundColor: '#4a9eff' }} title="Blue (Default)"></button>
                                            <button onClick={(e) => handleColorChange(e, '#fbbf24')} className={styles.colorBtn} style={{ backgroundColor: '#fbbf24' }} title="Yellow"></button>
                                            <button onClick={(e) => handleColorChange(e, '#10b981')} className={styles.colorBtn} style={{ backgroundColor: '#10b981' }} title="Green"></button>
                                            <button onClick={(e) => handleColorChange(e, '#8b5cf6')} className={styles.colorBtn} style={{ backgroundColor: '#8b5cf6' }} title="Purple"></button>
                                            <button onClick={(e) => handleColorChange(e, '#ef4444')} className={styles.colorBtn} style={{ backgroundColor: '#ef4444' }} title="Red"></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.footer}>
                        <span className={styles.date}>
                            !! change this to category maybe !!
                        </span>
                        <button onClick={handleDelete} className={styles.deleteBtn}>
                            <HiOutlineTrash size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Notebook"
                message={`Are you sure you want to delete "${notebook.name}"? Don't worry, your notes will not be deleted.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    )
}

export default NotebookCard
