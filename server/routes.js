const { Router } = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const { authLimiter } = require('./middleware/rate-limiter')
const User = require('./models/User')

const router = Router()

// User Input Validation Schema
const userSchema = z.object({
	username: z.string().min(1, 'Username is required').trim(),
	password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Apply stricter rate limiting to auth routes
router.use('/login', authLimiter)
router.use('/signup', authLimiter)

router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body

		// Validate input with Zod
		const validation = userSchema.safeParse({ username, password })
		if (!validation.success) {
			return res.status(400).json({
				error: validation.error.errors[0].message,
			})
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

		// Validate input with Zod
		const validation = userSchema.safeParse({ username, password })
		if (!validation.success) {
			return res.status(400).json({
				error: validation.error.errors[0].message,
			})
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
