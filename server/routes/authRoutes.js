const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');
const csrfProtection = require('../middleware/csrf');

router.get('/csrf-token', csrfProtection, (req, res) => {
    try {
        res.json({ csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error generating CSRF token:', error);
        res.status(500).json({ error: 'Failed to generate CSRF token' });
    }
});

router.post(
  '/register',
  csrfProtection,
  validateRegistration,
  authController.registerUser
);

router.post('/verify-otp', authController.verifyOtp);

router.post('/login', csrfProtection, authController.loginUser);

router.get('/events', authController.getEvents);

router.get('/events/:eventId/users', authController.getEventUsers);

router.put('/profile/:userId', authController.updateUserProfile);

module.exports = router;