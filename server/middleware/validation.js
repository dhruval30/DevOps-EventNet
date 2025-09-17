const { body } = require('express-validator');

exports.validateRegistration = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Please enter a valid email.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('uniqueCode').notEmpty().withMessage('Unique code is required.'),
];