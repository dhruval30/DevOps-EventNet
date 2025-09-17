const csurf = require('csurf');

// Configure CSRF protection with simplified options
const csrfProtection = csurf({
    cookie: {
        httpOnly: false, // Allow client-side access for debugging
        secure: false, // Don't require HTTPS in development
        sameSite: 'lax' // Relaxed for development
    }
});

module.exports = csrfProtection;