import { useEffect, useState } from "react"
import TaskCard from "../../components/Tasks/TaskCard"
import AddTaskPopup from "../../components/Tasks/AddTaskPopup"
import styles from './TasksHub.module.css'

function TasksHub({ authFetch, API }) {

  const [tasks, setTasks] = useState([])
  const [viewMode, setViewMode] = useState("card") // card | list
  const [loading, setLoading] = useState(true)


  // ----- Fetch tasks on mount -----
  useEffect(() => {
    fetchTasks()
  }, [])
  

  const fetchTasks = async () => {
    try {
      const res = await authFetch(`${API}/tasks`)
      if(res.ok){
        const data = await res.json()
        setTasks(data)
      }

    } catch (error) {
      console.error("Error fetching tasks: ", error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (title, description, priority, dueDate) => {
    if (!title.trim()){
      alert("Task title cannot be emtpy")
      return
    }
    
    try {
      const res = await authFetch(`${API}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
            title,
            description,
            priority,
            due_date: dueDate ? new Date(dueDate).toISOString() : null
          })
      })

      if(res.ok){
        const newTask = await res.json()
        setTasks([newTask, ...tasks])
      }

    } catch (error) {
      console.error("Error adding task:", error)
      alert("Failed to add task")
    }
  }

  const deleteTask = async (id) => {
    try {
      const res = await authFetch(`${API}/tasks/${id}`, { method: 'DELETE' })
      if(res.ok){
        setTasks(tasks.filter(task => task.id !== id))
      }

    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const toggleTaskCompletion = async (id, isCompleted) => {
    setTasks(tasks.map( task => task.id === id ? {...task, is_completed: isCompleted} : task))

    try {
      await authFetch(`${API}/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_completed: isCompleted })
      })

    } catch (error) {
      console.error("Error updating task:", error)
      fetchTasks() // Revert on error
    }
  }

  const changeView = () => {
    setViewMode(viewMode === "card" ? "list" : "card")
  }

  
  return (
    <div className={styles.container}>

        <div className={styles.header}>
          <h1>Tasks</h1>
          <button onClick={changeView} className={styles.toggleBtn}>
            {viewMode === "list" ? "Card View" : "List View"}
          </button>
        </div>

        <div className={styles.controls}>
          <p style={{ color: '#888', fontSize: '14px' }}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>

        
        {/* Add Task Component */}
        <AddTaskPopup addTask={addTask} />


        {/* Lists of Tasks display */}
        <div className={viewMode === "card" ? styles.gridView : styles.listView}>
          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard key={task.id}
               task = {task}
               deleteTask = {deleteTask}
               toggleCompletion = {toggleTaskCompletion}
               viewMode = {viewMode}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No tasks yet. Create today's set of tasks or create a new task to do</p>
            </div>
          )}
        </div>

    </div>
  )
}

export default TasksHub