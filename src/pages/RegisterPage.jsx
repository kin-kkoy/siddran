import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function RegisterPage({ setIsAuthed }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState('')

    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const register = async () => {
        if(!username.trim || !password.trim() || !confirmPassword.trim()){
            setError(`All fields are required`)
            return;
        }

        if(password !== confirmPassword){
            setError(`Passwords don't match!!`)
            return;
        }

        if(password.length < 6){
            setError(`Password must be at least 6 characters long`)
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username, password })
            })

            const data = await res.json();

            if(!res.ok) throw new Error (data.error || 'Registration failed')

            // Change alert to toast later soon
            alert('Registration successful! Going in now')
            localStorage.setItem(`token`, data.token)
            setIsAuthed(true)
            navigate('/notes')

        } catch (error) {
            console.error('Registration erorr:', error)
            setError(error.message || 'Something went wrong when trying to register')
        }finally{
            setLoading(false)
        }
    }

    return (
        <div>

            <h1>Register Page</h1>

            <label>Username: </label>
            <input type='text' onChange={e => setUsername(e.target.value)}/>
            <br/>

            <label>Password: </label>
            <input type='password' onChange={e => setPassword(e.target.value)}/>
            <br/>
            <label>Confirm Password: </label>
            <input type='password' onChange={e => setConfirmPassword(e.target.value)}/>
            <br/>

            <button onClick={register}>{loading ? `Registering...` : `Register`}</button>
            <br/>
            <p>
                Already have an account? <a href='/login'>Login now</a>
            </p>
            
            <p>Error: {error}</p>

        </div>
    )
}

export default RegisterPage