// server/tests/controllers/authController.test.js

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const cookieParser = require('cookie-parser');

const authController = require('../../controllers/authController');
const { validateRegistration } = require('../../middleware/validation');

const User = require('../../models/User');
const Otp = require('../../models/Otp');
const EventCode = require('../../models/EventCode');

// Mock all external dependencies and models
jest.mock('nodemailer');
jest.mock('bcryptjs');
jest.mock('otp-generator');
jest.mock('../../models/User');
jest.mock('../../models/Otp');
jest.mock('../../models/EventCode');

// Create a clean Express app only for testing
const app = express();
app.use(express.json());
app.use(cookieParser());

// Mock the CSRF middleware for full control
const mockCsrfMiddleware = (req, res, next) => {
    req.csrfToken = () => 'test_csrf_token';
    next();
};

// Manually define ONLY the routes needed for this test file.
app.get('/api/auth/csrf-token', mockCsrfMiddleware, (req, res) => {
    // --- FINAL FIX: Manually set a cookie on the response ---
    // This ensures `res.headers['set-cookie']` is defined for our tests.
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.json({ csrfToken: req.csrfToken() });
});
app.post('/api/auth/register', mockCsrfMiddleware, validateRegistration, authController.registerUser);
app.post('/api/auth/verify-otp', authController.verifyOtp);


describe('authController - Registration and Verification', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getCsrfTokenAndCookie = async () => {
        const res = await request(app).get('/api/auth/csrf-token');
        return {
            csrfToken: res.body.csrfToken,
            cookie: res.headers['set-cookie']
        };
    };
    
    it('should successfully register a new user and send an OTP', async () => {
        const mockEventId = new mongoose.Types.ObjectId();
        const mockEventCode = { code: 'ABCD123', email: 'testuser@example.com', event: mockEventId, isUsed: false };
        const mockUser = { _id: new mongoose.Types.ObjectId(), name: 'Test User', email: 'testuser@example.com', isVerified: false, event: mockEventId, phone: '1234567890', linkedin: 'linkedin.com/in/testuser', github: 'github.com/testuser', status: 'Available for networking', bio: '' };
        const mockOtp = { email: 'testuser@example.com', otp: '123456' };

        const mockUserSave = jest.fn().mockResolvedValue(true);
        User.mockImplementation(() => ({ ...mockUser, save: mockUserSave }));

        const mockOtpSave = jest.fn().mockResolvedValue(true);
        Otp.mockImplementation(() => ({ ...mockOtp, save: mockOtpSave }));
        
        const mockSendMail = jest.fn().mockResolvedValue(true);
        nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });
        
        bcrypt.hash.mockResolvedValue('hashedPassword123');
        otpGenerator.generate.mockReturnValue('123456');

        EventCode.findOne.mockResolvedValue(mockEventCode);
        User.findOne.mockResolvedValue(null);

        const { csrfToken, cookie } = await getCsrfTokenAndCookie();

        const res = await request(app)
            .post('/api/auth/register')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrfToken)
            .send({
                name: 'Test User', email: 'testuser@example.com', password: 'testPassword',
                uniqueCode: 'ABCD123', eventId: mockEventId.toString(), phone: '1234567890',
                linkedin: 'linkedin.com/in/testuser', github: 'github.com/testuser'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Registration successful. OTP sent to your email.');
        expect(mockUserSave).toHaveBeenCalledTimes(1);
    });

    it('should return 403 if unique code, email, or event is invalid', async () => {
        EventCode.findOne.mockResolvedValue(null);
        const { csrfToken, cookie } = await getCsrfTokenAndCookie();
        const res = await request(app)
            .post('/api/auth/register')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrfToken)
            .send({
                name: 'Test User', email: 'testuser@example.com', password: 'testPassword',
                uniqueCode: 'INVALIDCODE', eventId: new mongoose.Types.ObjectId().toString(),
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Invalid unique code, email, or event selection.');
        expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should successfully verify OTP and update user and event code', async () => {
        const mockUser = {
            _id: new mongoose.Types.ObjectId(), email: 'testuser@example.com', isVerified: false,
            save: jest.fn().mockResolvedValue(true)
        };
        const mockOtpRecord = { email: 'testuser@example.com', otp: '123456' };
        
        Otp.findOne.mockResolvedValue(mockOtpRecord);
        Otp.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
        User.findOne.mockResolvedValue(mockUser);
        EventCode.findOneAndUpdate.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/auth/verify-otp')
            .send({ email: 'testuser@example.com', otp: '123456' });

        expect(res.statusCode).toBe(200);
        expect(mockUser.save).toHaveBeenCalledTimes(1);
        expect(Otp.deleteOne).toHaveBeenCalledTimes(1);
    });
});