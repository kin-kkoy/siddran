import { useState } from "react"


function TempFIle() {
    const [text, setText] = useState("");
    const [todos, setTodos] = useState([]);

    const [editingTodoID, setEditingTodoID] = useState(-1);
    const [editText, setEditText] = useState("")
    

    const handleText = e => setText(e.target.value)

    
    const addTodo = () => {

        const todo = {
            id: todos.length, // this is not appropriate but just for the sake
            title: text
        }

        setTodos([...todos, todo])
        setText("")
    }

    const removeTask = id => {
        setTodos(todos.filter(todo => todo.id !== id))
    }

    const editModeTodo = (id, title) => {
        setEditingTodoID(id);
        setEditText(title);
    }

    const handleEditText = e => setEditText(e.target.value)

    const saveEditModeTodo = (id) => {
        setTodos(todos.map(todo => {
            return todo.id === id ? {...todo, title: editText} : todo
        }))
        setEditingTodoID(-1); // reset
    }



    return (
        <div>
            <h1>Add a todo!</h1>
            <label>Todo: </label>
            <input type="text" value={text} onChange={handleText}/>
            <br/>
            <button type="button" onClick={addTodo}>Submit todo</button>
            <br/>
            <h2>Todos:</h2>
            <ul>
                {todos.map(todo => {
                    return (
                        <li key = {todo.id}>

                            {todo.id === editingTodoID ? 
                                <input 
                                    type="text"
                                    value={editText}
                                    id={todo.id}
                                    onChange={handleEditText} 
                                />
                            :
                                todo.title
                            }

                            <button 
                                type="button"
                                onClick={
                                    editingTodoID === todo.id ? 
                                    () => saveEditModeTodo(todo.id) : 
                                    () => editModeTodo(todo.id, todo.title)
                                }
                            >
                                {editingTodoID === todo.id ? "Save" : "Edit"} todo
                            </button>

                            <button type="button" onClick={() => removeTask(todo.id)}>Remove todo</button>
                            
                            <br />

                        </li>
                    )
                })}
            </ul>
            <p>ID: {editingTodoID} | Debug purposes</p>
            <p>text: {editText} | Debug purposes</p>
        </div>
    )
}

export default TempFIle