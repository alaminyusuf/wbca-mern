import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import Axios from 'axios'

export default function LoginPage() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const handleLogin = async (e) => {
		e.preventDefault()
		setError('')

		const body = {
			username,
			password,
		}

		try {
			const rs = await Axios.post(
				`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/login`,
				body,
				{
					withCredentials: true,
				},
			);
			console.log(rs.data);
			
			// Redirect to chat page or dashboard
			navigate('/')
		} catch (err) {
			console.error('Network or server error during login:', err)
			setError('Could not connect to the server. Please try again.')
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-red-50 p-4'>
			<div className='bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-200'>
				<div className='text-center mb-8'>
					<h1 className='text-4xl font-extrabold text-red-700 mb-2'>
						Login to FUD WBCA
					</h1>
				</div>
				{error && <p className='text-red-500 mb-4'>{error}</p>}
				<form onSubmit={handleLogin}>
					<div className='mb-4'>
						<label htmlFor='username'>Username:</label>
						<input
							type='text'
							id='username'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className='w-full p-2 border rounded'
							required
						/>
					</div>
					<div className='mb-6'>
						<label htmlFor='password'>Password:</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='w-full p-2 border rounded'
							required
						/>
					</div>
					<button
						type='submit'
						className='w-full bg-red-600 text-white p-2 rounded'
					>
						Login
					</button>
				</form>
				<p className='text-center text-gray-600 text-sm mt-6'>
					Don't have an account?{' '}
					<a
						href='signup'
						className='text-red-600 hover:underline font-semibold'
					>
						Sign Up
					</a>
				</p>
			</div>
		</div>
	)
}
