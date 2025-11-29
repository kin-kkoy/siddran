import styles from './TaskCard.module.css'
import { FaCheck, FaTrash } from "react-icons/fa"

function TaskCard({ task, deleteTask, toggleCompletion, viewMode}) {

    const handleDelete = e => {
        e.preventDefault()
        e.stopPropagation()
        deleteTask(task.id)
    }
    
    const handleToggle = e => {
        e.preventDefault()
        e.stopPropagation()
        toggleCompletion(task.id, !task.is_completed)
    }

    
    return (
        <div className={`${styles.card} ${task.is_completed ? styles.completed : ''}`}>

            {/* ------- Checkbox ------- */}
            <button 
                className={`${styles.checkbox} ${task.is_completed ? styles.checked : ''}`}
                onClick={handleToggle}
            >
                {task.is_completed && <FaCheck size={12} />}
            </button>

            {/* ------- Contents ------- */}
            <div className={styles.content}>

                <h3 className={styles.title}>{task.title}</h3>
                {task.description && (
                <p className={styles.description}>
                    {task.description.substring(0, 100)}
                    {task.description.length > 100 ? '...' : ''}
                </p>
                )}

                {/* --- Metadata --- */}
                <div className={styles.metadata}>
                    <span className={`${styles.priority} ${styles[task.priority]}`}>
                        {task.priority}
                    </span>
                    {task.due_date && (
                        <span className={styles.dueDate}>
                        Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                    )}
                </div>

                {/* Checklist Preview */}
                {task.checklist && task.checklist.length > 0 && (
                    <div className={styles.checklistPreview}>
                        <small>
                        ✓ {task.checklist.filter(c => c.is_completed).length}/{task.checklist.length} completed
                        </small>
                    </div>
                )}

            </div>

            {/* ------- Delete Button ------- */}
            <button className={styles.deleteBtn} onClick={handleDelete}>
                <FaTrash />
            </button>

        </div>
    )
}

export default TaskCard