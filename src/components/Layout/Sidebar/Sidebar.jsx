import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from './Sidebar.module.css'
import SidebarList from "./SidebarList";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";
import logger from "../../../utils/logger";


function Sidebar({ username, isCollapsed, toggleSidebar, notes, currentNoteID, setIsAuthed }) {

    const navigate = useNavigate()
    const location = useLocation()

    const onNotePage = location.pathname.startsWith('/notes/') && location.pathname !== '/notes';

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

            {/* TOP SECTION: brand + navigation links */}
            <div className={styles.topSection}>

                {/* Brand section — click to collapse */}
                <div className={styles.brand} onClick={() => toggleSidebar(!isCollapsed)}>
                    <div className={styles.brandIcon}>&#10022;</div>
                    {!isCollapsed && (
                        <div>
                            <div className={styles.brandName}>SIDDRAN</div>
                            <div className={styles.brandSub}>space drifting</div>
                        </div>
                    )}
                </div>

                {/* Navigation area */}
                <div className={styles.navSection}>
                    <Link to="/notes"
                        className={`${styles.menuBtn} ${location.pathname.startsWith('/notes') ? styles.active : ''}`}
                        title="Notes">
                            <span className={styles.navDot}></span>
                            {!isCollapsed && <span>Notes</span>}
                    </Link>
                    <Link to="/tasks"
                        className={`${styles.menuBtn} ${location.pathname === '/tasks' ? styles.active : ''}`} title="Tasks">
                            <span className={styles.navDot}></span>
                            {!isCollapsed && <span>Tasks</span>}
                    </Link>

                    <div className={styles.divider} />

                    <Link to="/mods"
                        className={`${styles.menuBtn} ${location.pathname === '/mods' ? styles.active : ''}`}
                        title="Mods">
                            <span className={styles.navDot}></span>
                            {!isCollapsed && <span>Mods</span>}
                    </Link>
                </div>

            </div>


            {/* MIDDLE SECTION: the list of notes/tasks/mods */}
            <div className={styles.menuSection}>
                {onNotePage && (<SidebarList isCollapsed={isCollapsed} notes={notes} currentNoteID={currentNoteID}/>)}
            </div>


            {/* BOTTOM SECTION: user & settings */}
            <div className={styles.bottomSection}>
                <ProfileDropdown username={username} isCollapsed={isCollapsed} handleLogout={handleLogout} />
            </div>

        </div>
    )
}

export default Sidebar
