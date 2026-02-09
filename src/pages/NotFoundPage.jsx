import { Link } from 'react-router-dom'

function NotFoundPage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '16px',
            color: 'var(--text-primary)',
        }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '72px', margin: 0, color: 'var(--text-muted)' }}>404</h1>
            <p style={{ fontSize: '18px', color: 'var(--text-dim)', margin: 0 }}>
                This page doesn't exist.
            </p>
            <Link to="/notes" style={{
                marginTop: '8px',
                color: 'var(--accent-warning)',
                textDecoration: 'none',
                fontSize: '16px',
            }}>
                Back to Notes
            </Link>
        </div>
    )
}

export default NotFoundPage
