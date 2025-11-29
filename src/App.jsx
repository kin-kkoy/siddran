import { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import Sidebar from "./components/Layout/Sidebar/Sidebar.jsx"
import NotePage from "./pages/Notes/NotePage.jsx"
import NotesHub from "./pages/Notes/NotesHub.jsx"
import LoginPage from "./pages/Auth/LoginPage.jsx"
import RegisterPage from "./pages/Auth/RegisterPage.jsx"
import TasksHub from "./pages/Tasks/TasksHub.jsx"
import ModsHub from "./pages/ModsHub.jsx"
import SettingsPage from "./pages/SettingsPage.jsx"
import { useNotes } from "./hooks/useNotes.js"

// Wrapper component to get the ID from route parameters
function NotePageWrapper({ notes, editTitle, editBody, onNoteChange}){
  const { id } = useParams()

  useEffect(() => {
    onNoteChange(id)
  }, [id, onNoteChange])

  return <NotePage notes={notes} editTitle={editTitle} editBody={editBody} />
}

function App() {

  const [isAuthed, setIsAuthed] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false) // for sidebar's margin. It's setter logic will be done on the sidebar (which is the child)
  const [currentNoteID, setCurrentNoteID] = useState(null)
  const [username, setUsername] = useState(null)

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000' 


  // helper function for getting username from token
  const getUsernameToken = token => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.username
    } catch (error) {
      return null
    }
  }

  // first and foremost check if user already has token
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if(accessToken){
      setIsAuthed(true)
      // get username from the token
      const getUsername = getUsernameToken(accessToken)
      if(getUsername) setUsername(getUsername)
    }
  }, [])

  // get token and attach to `Authentication` header AS WELL AS the username
  const getAuthHeaders = () => {
    const accessToken = localStorage.getItem('accessToken')
    return{
      'Content-Type': 'application/json',
      'Authorization': accessToken ? `Bearer ${accessToken}` : ''
    }
  }

  const refreshAuthToken = async () => {
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        credentials: 'include' // auto sends HttpOnly cookie
      })

      if (!res.ok) throw new Error(`Failed to refresh token`)

      const data = await res.json()
      localStorage.setItem(`accessToken`, data.accessToken)
      return data.accessToken

    } catch (refreshTokenError) {
      // failed to refresh token = logout user
      localStorage.removeItem(`accessToken`)
      setIsAuthed(false)
      throw error
    }
  }

  // helper function for AUTHENTICATED FETCH
  const authFetch = async (URL, reqProps = {}) => {
    let res = await fetch(URL, {
      ...reqProps,
      credentials: 'include',
      headers: {
        ...getAuthHeaders(),
        ...reqProps.headers
      },
    })

    // If access token has expired (15mins), try to refresh it
    if(res.status === 401) {
      try {
        
        // First, try to refresh/reset access token
        await refreshAuthToken()

        // If successfully refreshed, then attempt again to call the fetch request
        res = await fetch(URL, {
          ...reqProps,
          credentials: 'include',
          headers: {
            ...getAuthHeaders(),
            ...reqProps.headers
          },
        })

      } catch (refreshError) {
        console.error(`Token refresh failed:`, refreshError)
        localStorage.removeItem(`accessToken`)
        setIsAuthed(false)
        throw new Error('Session expired. Please login again.')
        
      }
    }

    return res
  }


  // ------------- DATA LOGIC (Adding, deleting, etc. of Notes and Notebooks) ===================================
  const {
    notes, notebooks, addNote, deleteNote, editTitle, editBody, createNotebook, deleteNotebook
  } = useNotes(authFetch, API, isAuthed)


  //  Elements area
  const notesHubElement = (
    <NotesHub notes={notes} 
    notebooks={notebooks}
    addNote={addNote}
    deleteNote={deleteNote}
    createNotebook={createNotebook}
    deleteNotebook={deleteNotebook}
    authFetch={authFetch}
    API={API}/>
  )

  // temp style so that my eyes won't cry when dev mode
  const style = {
    backgroundColor: "#121212", // dark grayish background
    color: "#ffffff",            // white text
    minHeight: "100vh",          // full height
    margin: 0,
    padding: 0,
    fontFamily: "Arial, sans-serif",
  };


  return (

    <div style={style}>
      <BrowserRouter>
        <div style={{ display: "flex", 
          flexDirection: "row", 
          margin: 0, 
          padding: 0, 
          backgroundColor: '#121212'
        }}>

          {/* Only show sidebar when logged in */}
          {isAuthed && (
            <Sidebar username={username}
              isCollapsed={isCollapsed} 
              toggleSidebar={setIsCollapsed} 
              notes={notes} 
              currentNoteID={currentNoteID} 
              setIsAuthed={setIsAuthed}
            />
          )}


          {/* blank space reserved for fixed sidebar */}
          {isAuthed && (
            <div style={{
              width: isCollapsed ? '70px' : '250px',
              flexShrink: 0,  /* Prevents this from shrinking */
              transition: 'width 0.3s ease'
            }} />
          )}


          {/* The main page/s (the contents on the right, not sidebar) */}
          <div style={{ flex: 1, 
            padding: isAuthed ? '20px 40px' : '0', 
            overflowY: 'auto', 
            backgroundColor: '#121212',
            minWidth: 0  /* Allows flex item to shrink below content size */
          }}>


            <Routes>
              <Route path="/login" element={<LoginPage setIsAuthed={setIsAuthed} setAppUsername={setUsername} />} />
              <Route path="/register" element={<RegisterPage setIsAuthed={setIsAuthed} setAppUsername={setUsername} />} />
              {isAuthed ? (
                <>
                  <Route path="/notes" element={notesHubElement} />
                  <Route path="/notes/:id" element={
                    <NotePageWrapper notes={notes} 
                      editTitle={editTitle}
                      editBody={editBody}
                      onNoteChange={setCurrentNoteID}
                      />
                    }
                  />
                  {/* <Route path="/notebooks/:id" element={Notebook} */}

                  <Route path="/tasks" element={<TasksHub authFetch={authFetch} API={API}/>} />
                  <Route path="/mods" element={<ModsHub />} />

                  <Route path="/settings" element={<SettingsPage />} />
                </>
              ) : (
                <Route path="*" element={<LoginPage setIsAuthed={setIsAuthed} setAppUsername={setUsername} />} />
              )}
              {/* <Route path="add" element={}/> */}
            </Routes>

          </div>
        </div>
      </BrowserRouter>
    </div>

  )
}

export default App
