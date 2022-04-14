const { check } = require('express-validator');

module.exports = {
  title: check('title')
    .trim()
    .isLength({ min: 5, max: 25 })
    .withMessage('Must be between 5 and 25 chars'),
  author: check('author')
    .trim()
    .isLength({ min: 5, max: 25 })
    .withMessage('Must be between 5 and 25 chars')
    .custom((author) => {
      const regex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
      if (regex.test(author)) {
        throw new Error('Author contains special characters');
      }
    }),
  requireEmail: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be a valid email'),
};
