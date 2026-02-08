import { useState, useEffect, useCallback } from "react";

// Custom hook for tasks and daily tasks
export const useTasks = (authFetch, API, isAuthed) => {

    const [tasks, setTasks] = useState([])
    const [dailyTasks, setDailyTasks] = useState([])
    const [tasksPagination, setTasksPagination] = useState(null)
    const [dailyTasksPagination, setDailyTasksPagination] = useState(null)
    const [loadingMore, setLoadingMore] = useState(false)
    const [loading, setLoading] = useState(true)


    // ----------- Fetch data on auth ================================================================
    useEffect(() => {
        if(!isAuthed) return

        const fetchAllTasks = async () => {
            try {
                const [res1, res2] = await Promise.all([
                    authFetch(`${API}/tasks`),
                    authFetch(`${API}/daily-tasks`)
                ])

                if(res1.ok) {
                    const data = await res1.json()
                    setTasks(data.tasks)
                    setTasksPagination(data.pagination)
                }
                if(res2.ok) {
                    const data2 = await res2.json()
                    setDailyTasks(data2.dailyTasks)
                    setDailyTasksPagination(data2.pagination)
                }

            } catch (error) {
                console.error(`Error fetching tasks:`, error)
            } finally {
                setLoading(false)
            }
        }

        fetchAllTasks()

    }, [isAuthed, authFetch, API])


    // ----------- Load More Functions (Pagination) ==========================================
    const loadMoreTasks = useCallback(async () => {
        if (!tasksPagination?.hasNextPage || loadingMore) return

        setLoadingMore(true)
        try {
            const response = await authFetch(
                `${API}/tasks?cursor=${tasksPagination.nextCursor}&limit=${tasksPagination.limit}`
            )
            if(response.ok) {
                const data = await response.json()
                setTasks(prev => [...prev, ...data.tasks])
                setTasksPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error loading more tasks:', error)
        } finally {
            setLoadingMore(false)
        }
    }, [authFetch, API, tasksPagination, loadingMore])

    const loadMoreDailyTasks = useCallback(async () => {
        if (!dailyTasksPagination?.hasNextPage || loadingMore) return

        setLoadingMore(true)
        try {
            const response = await authFetch(
                `${API}/daily-tasks?cursor=${dailyTasksPagination.nextCursor}&limit=${dailyTasksPagination.limit}`
            )
            if(response.ok) {
                const data = await response.json()
                setDailyTasks(prev => [...prev, ...data.dailyTasks])
                setDailyTasksPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error loading more daily tasks:', error)
        } finally {
            setLoadingMore(false)
        }
    }, [authFetch, API, dailyTasksPagination, loadingMore])


    // ----------- Task Operations ===========================
    const addTask = useCallback(async (title, description, priority, dueDate, taskType) => {
        // if daily tasks
        if (taskType === 'daily') {
            if (!Array.isArray(title) || title.length === 0) {
                alert("No tasks to create")
                return
            }

            try {
                const res = await authFetch(`${API}/daily-tasks`, {
                    method: 'POST',
                    body: JSON.stringify({ tasks: title })
                })

                if(res.ok) {
                    const newTasks = await res.json()
                    setDailyTasks(prev => [...newTasks, ...prev])
                }

            } catch (error) {
                console.error("Error adding daily tasks:", error)
                alert("Failed to create daily tasks")
            }

            return
        }

        // if normal tasks
        if (!title.trim()) {
            alert("Task title cannot be empty")
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

            if(res.ok) {
                const newTask = await res.json()
                setTasks(prev => [newTask, ...prev])
            }

        } catch (error) {
            console.error("Error adding task:", error)
            alert("Failed to add task")
        }
    }, [authFetch, API])

    const deleteTask = useCallback(async (id) => {
        try {
            const res = await authFetch(`${API}/tasks/${id}`, { method: 'DELETE' })
            if(res.ok) {
                setTasks(prev => prev.filter(task => task.id !== id))
            }

        } catch (error) {
            console.error("Error deleting task:", error)
        }
    }, [authFetch, API])

    const toggleTaskCompletion = useCallback(async (id, isCompleted) => {
        // Optimistic update
        setTasks(prev => prev.map(task =>
            task.id === id ? {...task, is_completed: isCompleted} : task
        ))

        try {
            await authFetch(`${API}/tasks/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ is_completed: isCompleted })
            })

        } catch (error) {
            console.error("Error updating task:", error)
            // Revert on error
            setTasks(prev => prev.map(task =>
                task.id === id ? {...task, is_completed: !isCompleted} : task
            ))
        }
    }, [authFetch, API])


    // ----------- Daily Task Operations ===========================
    const deleteDailyTask = useCallback(async (id) => {
        try {
            const res = await authFetch(`${API}/daily-tasks/${id}`, { method: "DELETE" })
            if(res.ok) {
                setDailyTasks(prev => prev.filter(task => task.id !== id))
            }
        } catch (error) {
            console.error("Error deleting daily task:", error)
        }
    }, [authFetch, API])

    const toggleDailyTaskCompletion = useCallback(async (id, isCompleted) => {
        // Optimistic update
        setDailyTasks(prev => prev.map(task =>
            task.id === id ? {...task, is_completed: isCompleted} : task
        ))

        try {
            await authFetch(`${API}/daily-tasks/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ is_completed: isCompleted })
            })

        } catch (error) {
            console.error("Error updating daily task:", error)
            // Revert on error
            setDailyTasks(prev => prev.map(task =>
                task.id === id ? {...task, is_completed: !isCompleted} : task
            ))
        }
    }, [authFetch, API])


    return {
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
    }
}
