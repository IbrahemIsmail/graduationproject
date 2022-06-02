const express = require('express');
const mw = require('../middleware')
const {createCourse, createTeacher, createCourseInstance, showforums, getCourse, getCourses} = require('../handlers/courses');
const {showRatings} = require('../handlers/ratings');
const router = express.Router();




router.get('/addcourse', mw.authAdminUser, showforums);
router.get('/', getCourses);
router.get('/showcourse/id=:id', getCourse);
//idk about any of this actually
// //this get will show the course instance and the comments/ratings for it; the show course instance handler is yet to be added
// router.get('/courseInstance', showRatings, )

router.post('/addcourse', mw.authAdminUser, createCourse);
router.post('/addteacher', mw.authAdminUser, createTeacher);
router.post('/addcourseinstance', mw.authAdminUser, createCourseInstance);

module.exports = router;