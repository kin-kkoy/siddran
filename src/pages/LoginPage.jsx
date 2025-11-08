import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    // char char or design purposes
    const [loading, setLoading] = useState('')

    const navigate = useNavigate()
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000' 


    const login = async () => {
        if(!username.trim() || !password.trim()){
            setError('Username & Password required')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            const data = await res.json();

            if(!res.ok) throw new Error (data.error || 'Login failed')

            // if loggin in worked well, store the obtained token
            localStorage.setItem(`token`, data.token)

            // then redirect
            navigate('/notes')

        } catch (error) {
            console.error('Login erorr:', error)
            setError(error.message || 'Something went wrong when trying to login')
        }finally{
            setLoading(false)
        }
    }

    return (
        <div>

            <h1>Login Page</h1>

            <label>Username: </label>
            <input type='text' onChange={e => setUsername(e.target.value)}/>
            <br/>

            <label>Password: </label>
            <input type='password' onChange={e => setPassword(e.target.value)}/>
            <br/>

            <button onClick={login}>{loading ? `Logging in...` : `Login`}</button>
            <br />
            <p>
                Don't have an account? <a href='/register'>Register now</a>
            </p>
            
            <p>User: {username}</p>
            <p>Pass: {password}</p>
            <p>Error: {error}</p>

        </div>
    )
}

export default LoginPage