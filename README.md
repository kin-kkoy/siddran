# Features
 - Simple Authentication [ Login/Register (no email), with cookies & jwt for session management ]
 - Notes features
   - immediate saving no need to click buttons or the like
   - has favorite feature and color change for the card.
   - Markdown support for the editor (the note taking area)
   - Has a docker at the bottom with shortcut buttons
     - appears at the bottom when editor is not in focus and disappears when in focus
     - appears when the mouse/cursor is placed at the bottom-center of the editor/screen
     - *Went with this behavior because I wanted to remove distractions once user is note-taking*
   - Reading mode of a note; Aside from being able to WRITE a note, you can also READ a note, like in Obsidian but make the reading/writing mode button/toggle much clearer or visible to the user.
     - Reading mode doesn't allow editing/typing of the contents. (if it's not obvious) 
 - Notebook, made by grouping a bunch of notes. Always appears on top. Also has favorite and color change (only on the side) feat.
 - Sidebar, shows navigation & profile features but still lacks implementation for most buttons. Notes does work though and shows lists of notes

---

# To implement before deployment
 - Settings Page
    - Light/Dark mode
    - Themes
    - Toolbar (Docking toolbar at the bottom) can be toggled to be "auto hide" or "always visible" on settings
 - Fix light mode or themes to not persist in login/signup page

# To implement/fix
 - Note Editor (Lexical)
    - Code Block - Copy button (button clicked will copy the whole code block)
 - Tasks (Currently bugged, not fetching properly)
 - Settings Page (remaining todo)
    - Themes
        - theme colors are barely visible in light mode.
    - Account Management
        - Change name
        - Change pass
        - Add/Change email (maybe)
 - Forgot Password feature
 - Tasks
    - To-do list
        - 2 or 3 Layer nesting of tasks (subtasks)
        - Parent of nested tasks/subtask can compress or not via dropdown
    - Notifications (maybe) -----------------
        - to alert user about their tasks

 - Mods
    - TBD

 - Advanced
    - Social features: (MAYBE THOUGH LIKELY)
        - Adding friends. List of Friends
        - Real-time editing similar to Docs with other people

---

# NEED FIX
 

# FIXED BUT NEEDS DOUBLE CHECKING ON A LATER DATE
 - Checklist not working well; renders properly once first pressed but after leaving the note and then visiting back, it is displayed like this " [ ] " or " [x] " instead of the checkbox look in markdown. In other words, render issue
 - The editor doesn't respect the gap. Line 1 then add 2 blank lines then on line 4 add a word or letter, leave the note and come back and then you can see the 2 blank lines (lines 2 and 3) are gone, simply put it kinda removes whitespaces lines.
 - Code block, there should be a way to exit out of it (if the code block is the last line in the editor, currently if the last line of the note is the code block the only way to exit out of the code block (to start another line) is to remove the code block then add another line then on the previous line add the code block and then to exit the said code block just move the cursor to the line below (WHICH IS EXTRA HASSLE))
 - Link, needs fixing, inserting a link


# PROBLEMS 
 - Doesn't auto save when user stops typing for a while (Could be a problem when internet connection is suddenly gone)
 - No Offline feature YET (might do this or not)