const express = require('express');
const mw = require('../middleware')
const {searchCourseInstance, getCourse, getCourses, createCourse, createTeacher, createCourseInstance} = require('../handlers/courses');
const router = express.Router();

router.get('/', getCourses);
router.get('/id=:id', getCourse);

router.post('/searchData', searchCourseInstance); // this route looks stupid, change it
router.post('/addcourse', mw.authAdminUser, createCourse);
router.post('/addteacher', mw.authAdminUser, createTeacher);
router.post('/addcourseinstance', mw.authAdminUser, createCourseInstance);

module.exports = router;