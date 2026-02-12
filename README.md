# Cinder

A distraction-free note-taking app built with React and Lexical. Also comes with tasks.

---

## Features

### Authentication
- Simple login & registration (no email required. Might implement soon)
- Session management via cookies & JWT

### Notes
- **Auto-save** — notes save automatically when the editor loses focus, no save button needed
- **Markdown support** — powered by the [Lexical](https://lexical.dev/) editor
- **Reading mode** — toggle between writing and reading, similar to Obsidian
- **Favorites & colors** — mark notes as favorites and assign card colors
- **Floating dock** — shortcut toolbar that hides while you write and reappears when you need it

### Notebooks
- Group notes into notebooks
- Notebooks always appear at the top of the list
- Supports favorites and color customization

### Tasks
- Ongoing implementation

### Mods
- To be implemented

### Sidebar
- Navigation and profile features
- Displays a scrollable list of notes

### Settings
- Light / Dark mode
- Themes
- Toolbar visibility — choose between "auto hide" or "always visible"

---

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | React 19 |
| Editor | Lexical |
| Routing | React Router v7 |
| Build | Vite 7 |
| Styling | CSS Modules |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

---

## Roadmap

- [ ] Code block copy button
- [ ] Toggle button in settings to make notebooks color be the whole notebook card instead of just being the spine.
- [ ] Task lists with subtask nesting (2-3 levels)
- [ ] Dynamically create tasks by highlighting a note's content
- [ ] Account management (change name, change password)
- [ ] Forgot password flow (SOON)
- [ ] Auto-save on idle (guard against connection loss) (SOON)
- [ ] Offline support
- [ ] Game; Mods
- [ ] Real-time collaborative editing (BIG MAYBE)
