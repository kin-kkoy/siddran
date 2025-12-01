import { useState } from 'react'
import styles from './TaskCard.module.css'

function AddTaskCard({ addTask, viewMode }) {
    const [taskType, setTaskType] = useState("normal") // normal: normal add task || daily: add daily tasks
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("normal")
    const [dueDate, setDueDate] = useState("")

    // For daily tasks to be created/submitted to API in a batch (or all at once) (array/list of tasks)
    const [dailyTasksDraft, setDailyTasksDraft] = useState([])

    // ---------- for normal tasks ----------
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if(taskType === 'normal'){
            await addTask(title, description, priority, dueDate, taskType)
            // Clear form and close
            setTitle("")
            setDescription("")
            setPriority("normal")
            setDueDate("")
            setShowForm(false)
        }
    }

    // ---------- For daily tasks (draft style) ----------
    const addToDraft = e => {
        e.preventDefault()

        if(!title.trim()){
            alert("Task title cannot be empty")
            return
        }

        setDailyTasksDraft([...dailyTasksDraft, {
            id: Date.now(),
            title: title.trim(),
            priority
        }])

        // Clear inputs
        setTitle("")
        setPriority("normal")
    }

    const removeFromDraft = id => {
        setDailyTasksDraft(dailyTasksDraft.filter( task => task.id !== id))
    }

    const submitDraft = async () => {
        if(dailyTasksDraft.length === 0){
            alert("Add at least one task to the list")
            return
        }

        // title will be an array/list of the tasks instead of a usual string, this happens for daily tasks only
        await addTask(dailyTasksDraft, null, null, null, "daily")
        setDailyTasksDraft([]) // submit
        setShowForm(false) // then close
    }

    // clicking outside the popup
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowForm(false)
        }
    }


  // Card view (grid)
  if (viewMode === "card") {
    return (
      <>
        <div onClick={() => setShowForm(true)} className={styles.addCard}>
          <span className={styles.addCardIcon}>+</span>
          <h2>Add Task</h2>
        </div>

        {showForm && (
          <div className={styles.backdrop} onClick={handleBackdropClick}>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <h2 style={{ marginTop: 0, marginBottom: 20, color: '#fff' }}>Create Task</h2>

                {/* Daily tasks or Normal tasks */}
                <div className={styles.toggleContainer}>
                    {/* Normal */}
                    <button type="button"
                        className={`${styles.toggleBtn} ${taskType === 'normal' ? styles.active : ''}`}
                        onClick={() => setTaskType("normal")}
                    >Normal Task</button>

                    {/* Daily */}
                    <button type='button'
                        className={`${styles.toggleBtn} ${taskType === 'daily' ? styles.active : ''}`}
                        onClick={() => setTaskType("daily")}
                    >Daily Tasks</button>
                </div>
              
              <input 
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Task title..."
                className={styles.input}
                autoFocus
                required
              />
              
              {taskType === 'normal' && (
                <>
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
                </>
              )}

              {taskType === 'daily' && (
                <>
                    <select 
                        value={priority} 
                        onChange={e => setPriority(e.target.value)}
                        className={styles.select}
                        style={{ marginBottom: '16px' }}
                    >
                        <option value="low">Low Priority</option>
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                    </select>

                    {/* Draft Preview List */}
                    {dailyTasksDraft.length > 0 && (
                        <div className={styles.draftList}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#aaa', fontSize: '14px' }}>Tasks to create ({dailyTasksDraft.length}):</h4>
                            {dailyTasksDraft.map(task => (
                                <div key={task.id} className={styles.draftItem}>
                                    <span className={styles.draftText}>{task.title}</span>
                                    <span className={`${styles.draftPriority} ${styles[task.priority]}`}>{task.priority}</span>
                                    <button 
                                        type="button"
                                        onClick={() => removeFromDraft(task.id)}
                                        className={styles.removeBtn}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
              )}

              <div className={styles.actions}>
                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                
                {taskType === 'normal' ? (
                    <button type="submit" className={styles.submitBtn}>Create Task</button>
                ) : (
                    <>
                        <button type="button" onClick={addToDraft} className={styles.submitBtn}>
                            Add to List
                        </button>
                        {dailyTasksDraft.length > 0 && (
                            <button type="button" onClick={submitDraft} className={styles.createAllBtn}>
                                Create All ({dailyTasksDraft.length})
                            </button>
                        )}
                    </>
                )}
              </div>
            </form>
          </div>
        )}
      </>
    )
  }

  // List view (horizontal)
  return (
    <>
      <div onClick={() => setShowForm(true)} className={styles.addCardList}>
        <span className={styles.addCardListIcon}>+</span>
        <h4>Add Task</h4>
      </div>

      {showForm && (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
          <form className={styles.modalForm} onSubmit={handleSubmit}>
            <h2 style={{ marginTop: 0, marginBottom: 20, color: '#fff' }}>Create Task</h2>

            {/* Daily tasks or Normal tasks */}
            <div className={styles.toggleContainer}>
                {/* Normal */}
                <button type="button"
                    className={`${styles.toggleBtn} ${taskType === 'normal' ? styles.active : ''}`}
                    onClick={() => setTaskType("normal")}
                >Normal Task</button>

                {/* Daily */}
                <button type='button'
                    className={`${styles.toggleBtn} ${taskType === 'daily' ? styles.active : ''}`}
                    onClick={() => setTaskType("daily")}
                >Daily Tasks</button>
            </div>
            
            <input 
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title..."
              className={styles.input}
              autoFocus
              required
            />
            
            {taskType === 'normal' && (
                <>
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
                </>
            )}

            {taskType === 'daily' && (
                <>
                    <select 
                        value={priority} 
                        onChange={e => setPriority(e.target.value)}
                        className={styles.select}
                        style={{ marginBottom: '16px' }}
                    >
                        <option value="low">Low Priority</option>
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                    </select>

                    {/* Draft Preview List */}
                    {dailyTasksDraft.length > 0 && (
                        <div className={styles.draftList}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#aaa', fontSize: '14px' }}>Tasks to create ({dailyTasksDraft.length}):</h4>
                            {dailyTasksDraft.map(task => (
                                <div key={task.id} className={styles.draftItem}>
                                    <span className={styles.draftText}>{task.title}</span>
                                    <span className={`${styles.draftPriority} ${styles[task.priority]}`}>{task.priority}</span>
                                    <button 
                                        type="button"
                                        onClick={() => removeFromDraft(task.id)}
                                        className={styles.removeBtn}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

                <div className={styles.actions}>
                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
                    Cancel
                </button>
                
                {taskType === 'normal' ? (
                    <button type="submit" className={styles.submitBtn}>Create Task</button>
                ) : (
                    <>
                        <button type="button" onClick={addToDraft} className={styles.submitBtn}>
                            Add to List
                        </button>
                        {dailyTasksDraft.length > 0 && (
                            <button type="button" onClick={submitDraft} className={styles.createAllBtn}>
                                Create All ({dailyTasksDraft.length})
                            </button>
                        )}
                    </>
                )}
                </div>
          </form>
        </div>
      )}
    </>
  )
}

export default AddTaskCard