const express = require('express');
const mw = require('../middleware')
const {createCourse, createTeacher, createCourseInstance} = require('../handlers/courses');
const router = express.Router();

router.post('/addcourse', mw.authAdminUser, createCourse);
router.post('/addteacher', mw.authAdminUser, createTeacher);
router.post('/addcourseinstance', mw.authAdminUser, createCourseInstance);

module.exports = router;