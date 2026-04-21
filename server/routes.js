const { Router } = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./models/User')

const router = Router()

// Validation helper
const validateInput = (username, password) => {
	if (
		!username ||
		typeof username !== 'string' ||
		username.trim().length === 0
	) {
		return 'Username is required and must be a non-empty string'
	}
	if (!password || typeof password !== 'string' || password.length < 6) {
		return 'Password is required and must be at least 6 characters'
	}
	return null
}

router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body

		// Validate input
		const error = validateInput(username, password)
		if (error) {
			return res.status(400).json({ error })
		}

		// Check if user exists
		const found = await User.findOne({ username: username }).select(
			'+password',
		)

		if (!found) {
			return res.status(400).json({
				error: 'User does not exist in DB',
			})
		}

		// Check if password is correct
		const validPassword = await bcrypt.compare(password, found.password)
		if (!validPassword) {
			return res.status(400).json({ error: 'Invalid password' })
		}

		// Create JWT token
		const tokenData = {
			username: found.username,
		}

		const token = await jwt.sign(
			tokenData,
			process.env.JWT_SECRET || 'default_secret_key',
			{
				expiresIn: '12h',
			},
		)

		// Send token to user's cookies
		res.cookie('wbca', token, {
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Lax',
			maxAge: 12 * 60 * 60 * 1000, // 12 hours
		})

		return res.status(201).json({
			message: 'Login Successful',
			success: true,
			token,
		})
	} catch (error) {
		console.error('Login error:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

router.post('/signup', async (req, res) => {
	try {
		const { username, password } = req.body

		// Validate input
		const error = validateInput(username, password)
		if (error) {
			return res.status(400).json({ error })
		}

		const found = await User.findOne({ username: username })
		if (found) {
			return res.status(400).json({
				error: 'This user already exists',
			})
		}

		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		const model = new User({
			username,
			password: hashedPassword,
		})

		const user = await model.save()
		return res.status(201).json({
			message: 'User created!',
			success: true,
			data: { username: user.username },
		})
	} catch (error) {
		console.error('Signup error:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
})

module.exports = router
