import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import App from './App'
import Login from './components/Login'
import Signup from './components/Signup'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route index element={<App />} />
				<Route path='login' element={<Login />} />
				<Route path='signup' element={<Signup />} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
)
