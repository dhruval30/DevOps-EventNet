// server/tests/controllers/authController.test.js

// All module imports and requires go at the top
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const cookieParser = require('cookie-parser');

const authController = require('../../controllers/authController');
const { validateRegistration } = require('../../middleware/validation');
const csrfProtection = require('../../middleware/csrf');
const authRoutes = require('../../routes/authRoutes');

// Correctly define the model variables by requiring the actual files
const User = require('../../models/User');
const Otp = require('../../models/Otp');
const EventCode = require('../../models/EventCode');
const Event = require('../../models/Event');

// Now, mock the required modules. Jest's mocking will attach to the variables defined above.
jest.mock('nodemailer');
jest.mock('bcryptjs');
jest.mock('otp-generator');



// Correctly mock the models themselves to allow for spying on their methods
jest.mock('../../models/User');
jest.mock('../../models/Otp');
jest.mock('../../models/EventCode');
jest.mock('../../models/Event');

// Create a test Express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

// Mock the CSRF token generation and validation for a controlled test environment
const mockCsrfMiddleware = (req, res, next) => {
    req.csrfToken = () => 'test_csrf_token';
    next();
};

// Re-configure the routes to use the mock CSRF middleware for isolated testing
// These routes will now use the logic from your authRoutes.js file
app.post('/api/auth/register', mockCsrfMiddleware, validateRegistration, authController.registerUser);
app.post('/api/auth/login', mockCsrfMiddleware, authController.loginUser);
// The verify-otp route does not have CSRF protection in your authRoutes.js
app.post('/api/auth/verify-otp', authController.verifyOtp);

describe('authController - Registration and Verification', () => {
    // A utility function to get the CSRF token and cookie from the mounted route
    const getCsrfTokenAndCookie = async () => {
        const res = await request(app).get('/api/auth/csrf-token');
        return {
            csrfToken: res.body.csrfToken,
            cookie: res.headers['set-cookie']
        };
    };
    
    // Test case for successful user registration
    it('should successfully register a new user and send an OTP', async () => {
        // Mock a new event and event code for the test
        const mockEventId = new mongoose.Types.ObjectId();
        const mockEventCode = {
            code: 'ABCD123',
            email: 'testuser@example.com',
            event: mockEventId,
            isUsed: false,
            save: jest.fn().mockResolvedValue(true)
        };
        const mockUser = {
            _id: new mongoose.Types.ObjectId(),
            name: 'Test User',
            email: 'testuser@example.com',
            isVerified: false,
            event: mockEventId,
            save: jest.fn().mockResolvedValue(true)
        };
        const mockOtp = {
            email: 'testuser@example.com',
            otp: '123456',
            save: jest.fn().mockResolvedValue(true)
        };

        // Configure the mocks to return specific data
        EventCode.findOne.mockResolvedValue(mockEventCode);
        User.findOne.mockResolvedValue(null); // No existing user
        User.prototype.save = jest.fn().mockResolvedValue(mockUser);
        Otp.prototype.save = jest.fn().mockResolvedValue(mockOtp);
        bcrypt.hash.mockResolvedValue('hashedPassword123');
        otpGenerator.generate.mockReturnValue('123456');
        nodemailer.createTransport().sendMail.mockResolvedValue(true);

        // Get CSRF token and cookie
        const { csrfToken, cookie } = await getCsrfTokenAndCookie();

        // Perform the POST request
        const res = await request(app)
            .post('/api/auth/register')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrfToken)
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'testPassword',
                uniqueCode: 'ABCD123',
                eventId: mockEventId.toString(),
                phone: '1234567890',
                linkedin: 'linkedin.com/in/testuser',
                github: 'github.com/testuser'
            });

        // Assertions
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Registration successful. OTP sent to your email.');
        expect(User.prototype.save).toHaveBeenCalledTimes(1);
        expect(Otp.prototype.save).toHaveBeenCalledTimes(1);
        expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);
        expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'testuser@example.com',
                subject: 'EventNet: Your OTP for Email Verification',
            })
        );
    });

    // Test case for failed registration due to invalid unique code
    it('should return 403 if unique code, email, or event is invalid', async () => {
        // Mock a scenario where the EventCode is not found
        EventCode.findOne.mockResolvedValue(null);

        // Get CSRF token and cookie
        const { csrfToken, cookie } = await getCsrfTokenAndCookie();

        // Perform the POST request with invalid data
        const res = await request(app)
            .post('/api/auth/register')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrfToken)
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'testPassword',
                uniqueCode: 'INVALIDCODE',
                eventId: new mongoose.Types.ObjectId().toString(),
            });

        // Assertions
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Invalid unique code, email, or event selection.');
        expect(User.findOne).not.toHaveBeenCalled();
    });

    // Test case for successful OTP verification
    it('should successfully verify OTP and update user and event code', async () => {
        const mockUser = {
            email: 'testuser@example.com',
            isVerified: false,
            save: jest.fn().mockResolvedValue(true)
        };
        const mockOtpRecord = {
            email: 'testuser@example.com',
            otp: '123456'
        };
        const mockEventCodeRecord = {
            isUsed: false,
            save: jest.fn().mockResolvedValue(true)
        };

        // Mock database calls
        Otp.findOne.mockResolvedValue(mockOtpRecord);
        User.findOne.mockResolvedValue(mockUser);
        EventCode.findOneAndUpdate.mockResolvedValue(mockEventCodeRecord);

        // Perform the POST request
        const res = await request(app)
            .post('/api/auth/verify-otp')
            .send({
                email: 'testuser@example.com',
                otp: '123456'
            });

        // Assertions
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Email verified successfully! You can now access your dashboard.');
        expect(mockUser.isVerified).toBe(true);
        expect(mockUser.save).toHaveBeenCalledTimes(1);
        expect(Otp.deleteOne).toHaveBeenCalledTimes(1);
        expect(EventCode.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });
});
