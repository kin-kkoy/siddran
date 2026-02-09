import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from './Sidebar.module.css'
import SidebarList from "./SidebarList";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";
import { LuNotepadText } from "react-icons/lu";
import { BiTask, BiPackage } from "react-icons/bi";
import { RxHamburgerMenu } from "react-icons/rx";
import logger from "../../../utils/logger";


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


function Sidebar({ username, isCollapsed, toggleSidebar, notes, currentNoteID, setIsAuthed }) {

    // Contents depend on whether on notes/note(specific)/todo/mod page
    //  you will use the concept of *mounting* and `useEffect` 
    //      - useEffect to observe when pathname changes like if it's /notes or not


    const navigate = useNavigate()
    const location = useLocation()

    const onNotePage = location.pathname.startsWith('/notes/') && location.pathname !== '/notes';   // ensures that we're on a NOTEPAGE NOT NOTESHUB

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
    const handleLogout = async () => {
        // calling logout endpoint/route to revoke the refresh token
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                credentials: 'include'
            })
        } catch (error) {
            logger.error('Logout error:', error)
        }

        // clear tokens and cached data then redirect
        localStorage.removeItem('accessToken')
        localStorage.removeItem('username')
        localStorage.removeItem('cinder_settings')
        sessionStorage.clear()

        if (setIsAuthed) {
            setIsAuthed(false)
        }

        navigate('/login')
    }


    return (
        <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>

            {/* TOP SECTION: toggle and navigation links */}
            <div className={styles.topSection}>

                {/* this is the toggle button */}
                <button className={styles.toggleBtn} onClick={() => toggleSidebar(!isCollapsed)}><RxHamburgerMenu /></button>

                {/* Navigation area */}
                {!isCollapsed && <p className={styles.sectionLabel}>Links</p>}
                <Link to="/notes"
                    className={`${styles.menuBtn} ${location.pathname.startsWith('/notes') ? styles.active : ''}`}
                    title="Notes"> 
                        <span className={styles.icon}><LuNotepadText /></span>
                        {!isCollapsed && <span>Notes</span>}
                </Link>
                <Link to="/tasks" 
                    className={`${styles.menuBtn} ${location.pathname === '/tasks' ? styles.active : ''}`} title="Tasks">
                        <span className={styles.icon}><BiTask /></span>
                        {!isCollapsed && <span>Tasks</span>}
                </Link>
                <Link to="/mods" 
                    className={`${styles.menuBtn} ${location.pathname === '/mods' ? styles.active : ''}`} 
                    title="Mods">
                        <span className={styles.icon}><BiPackage /></span>
                        {!isCollapsed && <span>Mods</span>}
                </Link>

            </div>


            {/* MIDDLE SECTION: the list of notes/takss/mods */}
            <div className={styles.menuSection}>
                
                {/* Notes */}
                {/* Conditional, but just an IF instead of an if-else */}
                {onNotePage && (<SidebarList isCollapsed={isCollapsed} notes={notes} currentNoteID={currentNoteID}/>)}

                {/* Tasks (MAYBE ADD OR NOT, DEPENDS) */}

                {/* Mods */}
                
            </div>


            {/* BOTTOM SECTION: user & settings */}
            <div className={styles.bottomSection}>
                <ProfileDropdown username={username} isCollapsed={isCollapsed} handleLogout={handleLogout} />
            </div>

        </div>
    )
}

export default Sidebar