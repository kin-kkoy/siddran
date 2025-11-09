import { useState } from "react"
import LogoutBtn from "../Buttons/LogoutBtn";
import { useNavigate } from "react-router-dom";


// CHANGE EVERYTHING THERE!! WHAT SHOULD HAPPEN:
//  - Initially will not show (in home page) but when either notes/todo/mod(game)
//      is added, will appear and will change depending on whether notes/todo/mod(game)
//  - Notes: will have a buttons for: home page, todo, mod(game). Then below those
//      buttons will be an add note/folder button and then the list of notes (buttons)
//  - Todo: to implement but same concept
//  - Game: (Don't bother yet and think about this feature much more thoroughly)
//  - Bottom part ----------
//  - User icon (button): Opens up a modal with the options:
//       settings, profile page, logout


function Sidebar() {

    // Contents depend on whether on notes/note(specific)/todo/mod page
    //  you will use the concept of *mounting* and `useEffect` 
    //      - useEffect to observe when pathname changes like if it's /notes or not

    // for now stay in default mode unless it's time to implement sidebar
    const [currentState, setCurrentState] = useState('def'); // value: def(default)|notes|note|todo|mod

    const navigate = useNavigate()



    // // Don't mind these 2 yet, to be implemented soon since these are just extras
    // // Sort note
    // const sortNote = choice => {
    //     // TODO: Ideally, the sorting happens in the backend, and frontend simply fetches and displays.
    //     alert(`This is temporary, sorting should be implemented`)
    // }
    // // Display note toggle (card/list view)
    // const displayToggle = choice => {
    //     // TODO: Clicking this button toggles between card/list view
    //     alert(`This is temporary, toggling will be implemented`)
    // }


    // logout
    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
        window.location.reload()
    }


    return (
        <div className="sidebar">
            <button>Replace with: hide/show button</button>
            <button onClick={() => alert(`to be implemented!`)}>Replace this to user icon later</button>
            <p>---- Modal window shows these: ----</p>
            <button onClick={() => alert(`to be implemented`)}>Profile</button>
            <button onClick={() => alert(`to be implemented`)}>Settings</button>
            <LogoutBtn handleLogout={handleLogout}/>
        </div>
    )
}

export default Sidebar