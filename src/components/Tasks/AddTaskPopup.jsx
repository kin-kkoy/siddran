import { useState } from 'react'
import styles from './AddTaskPopup.module.css'

function AddTaskPopup({ addTask }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("normal")
  const [dueDate, setDueDate] = useState("")
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addTask(title, description, priority, dueDate)
    
    // Clear form
    setTitle("")
    setDescription("")
    setPriority("normal")
    setDueDate("")
    setShowForm(false)
  }

  const handleBackdropClick = (e) => { // ← Add this
    if (e.target === e.currentTarget) {
      setShowForm(false)
    }
  }

  if (!showForm) {
    return (
      <button className={styles.addBtn} onClick={() => setShowForm(true)}>
        + Add Task
      </button>
    )
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}> {/* ← Wrap in backdrop */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 style={{ marginTop: 0, marginBottom: 20, color: '#fff' }}>Create New Task</h2>
        
        <input 
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Task title..."
          className={styles.input}
          autoFocus
          required
        />
        
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className={styles.textarea}
        />

        <div className={styles.row}>
          <select 
            value={priority} 
            onChange={e => setPriority(e.target.value)}
            className={styles.select}
          >
            <option value="low">Low Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="high">High Priority</option>
          </select>

          <input 
            type="datetime-local"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>Create Task</button>
        </div>
      </form>
    </div>
  )
}

export default AddTaskPopup