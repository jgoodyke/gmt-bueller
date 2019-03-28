const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const verifyToken = require('./_middleware/verifyToken');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// load controllers
var authController = require('./auth/auth.controller');
const studentController = require('./data/student/student.controller');

// auth routes
router.use('/auth', authController);
router.use('/data/student/report/stats', verifyToken, studentController.getReportStats);
router.use('/data/student/report/grades/view/:view', verifyToken, studentController.getGradesCustomView);
router.use('/data/student/school/:school', verifyToken, studentController.getBySchool);
router.use('/data/student', verifyToken, studentController.getAll);

module.exports = router;