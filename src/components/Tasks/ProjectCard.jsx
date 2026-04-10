import { useState } from 'react'
import { FaCheck } from 'react-icons/fa'
import { HiOutlineTrash } from 'react-icons/hi'
import styles from './ProjectCard.module.css'
import ConfirmModal from '../Common/ConfirmModal'

function ProjectCard({ project, toggleProjectTaskCompletion, deleteProject, onOpenDetail }) {

    const [ showDeleteModal, setShowDeleteModal ] = useState(false);

    const handleDelete = e => {
        e.preventDefault()
        e.stopPropagation()
        setShowDeleteModal(true);
    }

    const confirmDelete = () => {
        deleteProject(project.id)
        setShowDeleteModal(false)
    }

    const priorityOrder = { high: 0, normal: 1, low: 2 }
    const sortedTasks = [...project.tasks].sort((a, b) => {
        if(a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
    })

    const totalCount = project.tasks.length;
    const completedCount = project.tasks.filter(task => task.is_completed).length;

    return (
        <div
            className={styles.card}
            onClick={() => onOpenDetail(project)}
            style={project.color ? { backgroundColor: `color-mix(in srgb, ${project.color} 12%, var(--bg-elevated))` } : undefined}
        >

            {/* Header: title + project priority + delete button */}
            <div className={styles.header} style={project.color ? { backgroundColor: `color-mix(in srgb, ${project.color} 18%, var(--bg-elevated))` } : undefined}>
                <div className={styles.headerLeft}>
                    <h3 className={styles.title}>{project.title}</h3>
                </div>
                <div className={styles.headerRight}>
                    <span className={styles.projectPriority}>
                        {project.priority}
                    </span>
                    <button className={styles.deleteBtn} onClick={handleDelete}>
                        <HiOutlineTrash size={18} />
                    </button>
                </div>
            </div>

            {/* Task List: sorted tasks with checkbox + title + priority tag */}
            <ul className={styles.taskList}>
                {sortedTasks.map(task => (
                    <li key={task.id} className={`${styles.taskItem} ${task.is_completed ? styles.completed : ''}`}>
                        {/* Checkbox */}
                        <button
                            className={`${styles.checkbox} ${task.is_completed ? styles.checked : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleProjectTaskCompletion(project.id, task.id, !task.is_completed)
                            }}
                        >
                            {task.is_completed && <FaCheck size={12} />}
                        </button>

                        {/* Task Content */}
                        <div className={styles.taskContent}>
                            <span className={styles.taskTitle}>{task.title}</span>
                        </div>

                        <span className={`${styles.priority} ${styles[task.priority]}`}>
                            {task.priority}
                        </span>
                    </li>
                ))}
            </ul>

            {/* Footer: progress bar + "X / Y completed" */}
            {totalCount > 0 && (
                <div className={styles.footer} style={project.color ? { backgroundColor: `color-mix(in srgb, ${project.color} 6%, var(--bg-primary))` } : undefined}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: `${(completedCount / totalCount) * 100}%`,
                                backgroundColor: project.color || undefined,
                            }}
                        />
                    </div>
                    <span className={styles.progressText}>
                        {completedCount} / {totalCount} completed
                    </span>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <div>
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete Project"
                    message={`Are you sure you want to delete "${project.title}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            </div>

        </div>
    )
}

export default ProjectCard
