import { useState } from 'react'
import styles from './CreateNotebookModal.module.css'

function CreateNotebookModal({ onClose, onCreate, selectedNotesCount }) {
    const [name, setName] = useState('')
    const [tags, setTags] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!name.trim()) {
            alert('Please enter a notebook name')
            return
        }
        onCreate(name, tags)
        onClose()
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Create New Notebook</h2>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.info}>
                        Creating notebook with <strong>{selectedNotesCount}</strong> {selectedNotesCount === 1 ? 'note' : 'notes'}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="notebook-name">Notebook Name *</label>
                        <input
                            id="notebook-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Work Projects, Personal Ideas..."
                            className={styles.input}
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="notebook-tags">Tags (Optional)</label>
                        <input
                            id="notebook-tags"
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., work, personal, archive..."
                            className={styles.input}
                        />
                        <span className={styles.hint}>Separate multiple tags with commas</span>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.createBtn}>
                            Create Notebook
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateNotebookModal
