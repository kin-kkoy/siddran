import { useState, useEffect, useRef } from "react"
import TaskCard from "../../components/Tasks/TaskCard"
import AddTaskCard from "../../components/Tasks/AddTaskCard"
import styles from './TasksHub.module.css'
import DailyTaskCard from "../../components/Tasks/DailyTaskCard"
import ConfirmModal from "../../components/Common/ConfirmModal"
import { HiOutlineTrash } from 'react-icons/hi'

function TasksHub({
  tasks,
  dailyTasks,
  tasksPagination,
  dailyTasksPagination,
  loadMoreTasks,
  loadMoreDailyTasks,
  loadingMore,
  loading,
  addTask,
  deleteTask,
  toggleTaskCompletion,
  deleteDailyTask,
  toggleDailyTaskCompletion
}) {

  // Persist view mode in localStorage
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('tasksViewMode') || 'card'
  })
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const tasksSentinelRef = useRef(null)
  const dailyTasksSentinelRef = useRef(null)
  const scrollIntentTimeoutRef = useRef(null)

  const hasMoreTasks = tasksPagination?.hasNextPage
  const hasMoreDailyTasks = dailyTasksPagination?.hasNextPage

  // Sort tasks: incomplete first, then by priority (High -> Normal -> Low)
  const priorityOrder = { high: 0, normal: 1, low: 2 }
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by completion status (incomplete first)
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1
    }
    // Then sort by priority within each group
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
  })

  // Intersection Observer for tasks infinite scroll
  useEffect(() => {
    if (!hasMoreTasks || loadingMore) return

    const sentinel = tasksSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !loadingMore) {
          // Delay fetch to detect scroll intent (user must keep scrolling)
          scrollIntentTimeoutRef.current = setTimeout(() => {
            loadMoreTasks()
          }, 300)
        } else {
          // User scrolled away - cancel pending fetch
          if (scrollIntentTimeoutRef.current) {
            clearTimeout(scrollIntentTimeoutRef.current)
          }
        }
      },
      {
        root: null,
        rootMargin: '100px', // Trigger slightly before sentinel is visible
        threshold: 0
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      if (scrollIntentTimeoutRef.current) {
        clearTimeout(scrollIntentTimeoutRef.current)
      }
    }
  }, [hasMoreTasks, loadingMore, loadMoreTasks])

  // Intersection Observer for daily tasks infinite scroll
  useEffect(() => {
    if (!hasMoreDailyTasks || loadingMore) return

    const sentinel = dailyTasksSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !loadingMore) {
          setTimeout(() => {
            loadMoreDailyTasks()
          }, 300)
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0
      }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasMoreDailyTasks, loadingMore, loadMoreDailyTasks])

  const changeView = () => {
    const newMode = viewMode === "card" ? "list" : "card"
    setViewMode(newMode)
    localStorage.setItem('tasksViewMode', newMode)
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedTasks([])
  }

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    )
  }

  const handleBatchDelete = () => {
    if (selectedTasks.length === 0) return
    setShowDeleteModal(true)
  }

  const confirmBatchDelete = () => {
    selectedTasks.forEach(id => deleteTask(id))
    setSelectedTasks([])
    setIsSelectionMode(false)
    setShowDeleteModal(false)
  }


  return (
    <div className={styles.container}>

        <div className={styles.header}>
          <h1>Tasks</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Delete button - always visible */}
            <button
              onClick={isSelectionMode ? handleBatchDelete : toggleSelectionMode}
              className={styles.batchDeleteBtn}
              disabled={isSelectionMode && selectedTasks.length === 0}
              title={isSelectionMode ? "Delete selected tasks" : "Select tasks to delete"}
            >
              <HiOutlineTrash size={18} />
            </button>

            {/* Cancel button - only in selection mode */}
            {isSelectionMode && (
              <button onClick={toggleSelectionMode} className={styles.toggleBtn}>
                Cancel
              </button>
            )}

            <button onClick={changeView} className={styles.toggleBtn}>
              {viewMode === "list" ? "Card View" : "List View"}
            </button>
          </div>
        </div>

        <div className={styles.controls}>
          <p style={{ color: '#888', fontSize: '14px' }}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            {isSelectionMode && ` (${selectedTasks.length} selected)`}
          </p>
        </div>


        <div className={viewMode === "card" ? styles.gridView : styles.listView}>

          {/* Add Task Component */}
          <AddTaskCard addTask={addTask} viewMode={viewMode} />

          {/* Daily Tasks Section */}
          <DailyTaskCard tasks={dailyTasks} toggleCompletion={toggleDailyTaskCompletion} deleteTask={deleteDailyTask} />

          {/* Daily tasks infinite scroll sentinel */}
          {hasMoreDailyTasks && (
            <div ref={dailyTasksSentinelRef} className={styles.sentinel}>
              {loadingMore ? <span className={styles.loadingDots}>...</span> : <span className={styles.moreDots}>...</span>}
            </div>
          )}

          {/* Normal Tasks Section - sorted by priority (High -> Normal -> Low) */}
          {loading ? (
            <p>Loading tasks...</p>
          ) : sortedTasks.length > 0 ? (
            sortedTasks.map(task => (
              <TaskCard key={task.id}
               task={task}
               deleteTask={deleteTask}
               toggleCompletion={toggleTaskCompletion}
               viewMode={viewMode}
               isSelectionMode={isSelectionMode}
               isSelected={selectedTasks.includes(task.id)}
               onToggleSelect={() => toggleTaskSelection(task.id)}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No tasks yet. Create today's set of tasks or create a new task to do</p>
            </div>
          )}

          {/* Tasks infinite scroll sentinel (...) */}
          {hasMoreTasks && (
            <div ref={tasksSentinelRef} className={styles.sentinel}>
              {loadingMore ? <span className={styles.loadingDots}>...</span> : <span className={styles.moreDots}>...</span>}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmBatchDelete}
          title="Delete Tasks"
          message={`Are you sure you want to delete ${selectedTasks.length} selected task(s)? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />

    </div>
  )
}

export default TasksHub
