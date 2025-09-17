const User = require('../models/User');
const Otp = require('../models/Otp');
const EventCode = require('../models/EventCode');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const Event = require('../models/Event');
const mongoose = require('mongoose');

exports.registerUser = async (req, res) => {
  // Check for validation errors from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, uniqueCode, eventId, phone, linkedin, github } = req.body;

  try {
    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID format.' });
    }

    // Convert eventId string to ObjectId for MongoDB queries
    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    // 1. Find the provided uniqueCode and event ID record.
    const eventCodeRecord = await EventCode.findOne({ 
      code: uniqueCode, 
      email: email.toLowerCase(),
      event: eventObjectId 
    });

    if (!eventCodeRecord) {
      return res.status(403).json({ message: 'Invalid unique code, email, or event selection.' });
    }
    
    // Check if the code has already been used
    if (eventCodeRecord.isUsed) {
        // If the code is used, check if the email trying to register is the one that used it.
        if (eventCodeRecord.email === email.toLowerCase()) {
            return res.status(409).json({ message: 'This code has already been used by you. Please login.' });
        } else {
            return res.status(409).json({ message: 'This code has already been used by another user.' });
        }
    }

    // Check if the provided email matches the one for the uniqueCode
    if (eventCodeRecord.email !== email.toLowerCase()) {
      return res.status(403).json({ message: 'The provided email does not match the unique code.' });
    }

    // Check if a user with this email has already registered (but not yet verified).
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    // Handle a user who has previously registered but is not yet verified.
    if (existingUser && !existingUser.isVerified) {
        // We will just send a new OTP and update their password if needed.
        const otp = otpGenerator.generate(6, { digits: true, upperCase: false, specialChars: false });
        
        // Remove old OTP to avoid conflicts.
        await Otp.deleteOne({ email: email.toLowerCase() });
        const newOtp = new Otp({ email: email.toLowerCase(), otp });
        
        // Update their password if they provided a new one.
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.password = hashedPassword;
        
        await Promise.all([
            existingUser.save(),
            newOtp.save()
        ]);

        

        
        const mailOptions = {
            from: process.env.EMAIL_SERVICE_USER,
            to: email,
            subject: 'EventNet: Your New OTP for Email Verification',
            html: `
                <p>Hello ${name},</p>
                <p>You recently tried to log in or register again. Please use the following OTP to verify your email address:</p>
                <h3>${otp}</h3>
                <p>This code is valid for 5 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            `,
        };
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'You have already registered. A new OTP has been sent to your email.' });
    }
    
    // If a verified user with this email exists, this is a login attempt.
    if (existingUser && existingUser.isVerified) {
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (isMatch) {
        return res.status(200).json({ message: 'Login successful. Redirecting to dashboard.' });
      } else {
        return res.status(401).json({ message: 'Incorrect password.' });
      }
    }
    
    // If no user exists, proceed with new registration.
    // Function to send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service provider
      auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS,
      },
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      event: eventObjectId,
      phone,
      linkedin,
      github,
      isVerified: false,
    });
    const otp = otpGenerator.generate(6, { digits: true, upperCase: false, specialChars: false });
    const newOtp = new Otp({ email: email.toLowerCase(), otp });

    await Promise.all([
      newUser.save(),
      newOtp.save()
    ]);

    const mailOptions = {
      from: process.env.EMAIL_SERVICE_USER,
      to: email,
      subject: 'EventNet: Your OTP for Email Verification',
      html: `
        <p>Hello ${name},</p>
        <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
        <h3>${otp}</h3>
        <p>This code is valid for 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    
    res.status(201).json({ 
        message: 'Registration successful. OTP sent to your email.',
        user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            isVerified: newUser.isVerified,
            event: newUser.event,
            phone: newUser.phone,
            linkedin: newUser.linkedin,
            github: newUser.github,
            status: newUser.status,
            bio: newUser.bio,
        }
    });

  } catch (error) {
    console.error('REGISTRATION CRASHED. THE REAL ERROR IS:', error); 
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email: email.toLowerCase(), otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const userToVerify = await User.findOne({ email: email.toLowerCase() });
    
    if (!userToVerify) {
        return res.status(404).json({ message: 'User not found.' });
    }

    userToVerify.isVerified = true;
    await userToVerify.save();

    await Otp.deleteOne({ email: email.toLowerCase(), otp });

    const eventCodeRecord = await EventCode.findOneAndUpdate(
        { email: email.toLowerCase(), isUsed: false }, 
        { $set: { isUsed: true, usedBy: userToVerify._id } }
    );
    
    if (!eventCodeRecord) {
        console.warn('EventCode not found or already used for this email during OTP verification.');
    }

    res.status(200).json({ 
      message: 'Email verified successfully! You can now access your dashboard.',
      user: {
        _id: userToVerify._id,
        name: userToVerify.name,
        email: userToVerify.email,
        isVerified: userToVerify.isVerified,
        event: userToVerify.event,
        phone: userToVerify.phone,
        linkedin: userToVerify.linkedin,
        github: userToVerify.github,
        status: userToVerify.status,
        bio: userToVerify.bio,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email address first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.status(200).json({ 
        message: 'Login successful!',
        user: { 
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            event: user.event,
            phone: user.phone,
            linkedin: user.linkedin,
            github: user.github,
            status: user.status,
            bio: user.bio,
        } 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching events.' });
  }
};

exports.getEventUsers = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: 'Invalid event ID format.' });
        }

        const users = await User.find({ event: eventId, isVerified: true });
        
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users.' });
    }
};

exports.updateUserProfile = async (req, res) => {
  try {
      const { userId } = req.params;
      const { name, phone, linkedin, github, status, bio } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: 'Invalid user ID format.' });
      }

      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { name, phone, linkedin, github, status, bio },
          { new: true, runValidators: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ 
          message: 'Profile updated successfully!',
          user: { 
              _id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              phone: updatedUser.phone,
              linkedin: updatedUser.linkedin,
              github: updatedUser.github,
              status: updatedUser.status,
              bio: updatedUser.bio,
              // FIX: ADD THE MISSING EVENT ID TO THE RESPONSE
              event: updatedUser.event
          } 
      });
  } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error updating profile.' });
  }
};