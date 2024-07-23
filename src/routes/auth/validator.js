const { body, validationResult } = require('express-validator');


module.exports = new class {
    registerValidation() {
        console.log("registerValidation")
        return [
            // body('name')
            //     .isLength({ min: 1 })
            //     .withMessage('name must be at least 4 chars long')
            //     .isLength({ max: 50 })
            //     .withMessage(' name must be less than 12 chars long')
            //     .exists()
            //     .withMessage('name is required')
            //     .trim()
            //     .matches(/^[A-Za-z0-9\_]+$/)
            //     .withMessage('username must be alphanumeric only')
            //     .escape(),
            body('email').isEmail().normalizeEmail().withMessage('Invalid Email').exists(),
            body('password')
                .isLength({ min: 5 })
                .withMessage('password must be at least 5 chars long')
                .isLength({ max: 30 })
                .withMessage('password must be at max 30 chars long')
                .matches(/\d/)
                .withMessage('password must contain a number')
                .exists(),
        ]

    }
    loginValidation() {
        return [
            body('email').isEmail().normalizeEmail().withMessage('Invalid Email').exists(),
            body('password')
                .isLength({ min: 5 })
                .withMessage('password must be at least 5 chars long')
                .isLength({ max: 30 })
                .withMessage('password must be at max 30 chars long')
                .matches(/\d/)
                .withMessage('password must contain a number')
                .exists(),
        ]
    }
}