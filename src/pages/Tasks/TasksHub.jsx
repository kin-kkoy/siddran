import { useEffect, useState } from "react"
import TaskCard from "../../components/Tasks/TaskCard"
import AddTaskCard from "../../components/Tasks/AddTaskCard"
import styles from './TasksHub.module.css'
import DailyTaskCard from "../../components/Tasks/DailyTaskCard"

function TasksHub({ authFetch, API }) {

  const [dailyTasks, setDailyTasks] = useState([]) // daily tasks
  const [tasks, setTasks] = useState([]) // normal tasks
  const [viewMode, setViewMode] = useState("card") // card | list
  const [loading, setLoading] = useState(true)


  // ----- Fetch tasks on mount -----
  useEffect(() => {
    fetchAllTasks()
  }, [])
  

  const fetchAllTasks = async () => {
    try {
      const [res1, res2] = await Promise.all([
        authFetch(`${API}/tasks`),
        authFetch(`${API}/daily-tasks`)
      ])

      if(res1.ok){
        const data = await res1.json()
        setTasks(data)
      }
      if(res2.ok){
        const data2 = await res2.json()
        setDailyTasks(data2)
      }
      
    } catch (error) {
      console.error("Error fetching tasks or daily tasks: ", error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (title, description, priority, dueDate, taskType) => {
    
    // if daily tasks
    if (taskType === 'daily') {
      // TITLE IS AN ARRAY OKKAY!!!!!
      if (!Array.isArray(title) || title.length === 0) {
        alert("No tasks to create")
        return
      }

      try {
        const res = await authFetch(`${API}/daily-tasks`, {
          method: 'POST',
          body: JSON.stringify({ tasks: title})
        })

        if(res.ok){
          const newTasks = await res.json()
          setDailyTasks([...newTasks, ...dailyTasks])
        }

      } catch (error) {
        console.error("Error adding daily tasks:", error)
        alert("Failed to create daily tasks")
      }

      return
    }

    
    // if normal tasks
    if (!title.trim()){
      alert("Task title cannot be emtpy")
      return
    }

    try {
      const res = await authFetch(`${API}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title, description, priority,
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

  const deleteDailyTask = async (id) => {
    try {
      const res = await authFetch(`${API}/daily-tasks/${id}`, { method: "DELETE"})
      if(res.ok){
        setDailyTasks(dailyTasks.filter(task => task.id !== id))
      }
    } catch (error) {
      console.error("Error deleting daily task:", error)
    }
  }

  const toggleDailyTaskCompletion = async (id, isCompleted) => {
    // Optimistic update
    setDailyTasks(dailyTasks.map( task => 
      task.id === id ? 
      {...task, is_completed: isCompleted} : task
    ))

    // the actual calling of the api
    try {
      await authFetch(`${API}/daily-tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_completed: isCompleted })
      })

    } catch (error) {
      console.error("Error updating daily task:", error)
      fetchAllTasks() // Revert on error
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

        
        <div className={viewMode === "card" ? styles.gridView : styles.listView}>
        
        {/* Add Task Component */}
          <AddTaskCard addTask={addTask} viewMode={viewMode} />

        {/* Lists of Tasks display  =  ALWAYS DAILY TASKS FIRST !!! */}
          <DailyTaskCard tasks={dailyTasks} toggleCompletion={toggleDailyTaskCompletion} deleteTask={deleteDailyTask} />
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