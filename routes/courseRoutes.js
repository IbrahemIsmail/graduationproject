const express = require('express');
const mw = require('../middleware')
const {createUniversity, createCourse, createTeacher, createCourseInstance, showforums, getCourse, getCourses, searchCourse} = require('../handlers/courses');
const {showRatings} = require('../handlers/ratings');
const router = express.Router();
const multer = require('multer');


var storage = multer.memoryStorage();
var upload = multer({ storage: storage });



router.get('/addcourse', mw.authAdminUser, showforums);
router.get('/', getCourses);
router.get('/showcourse/id=:id', getCourse);
router.post('/searchData', searchCourse);
//idk about any of this actually
// //this get will show the course instance and the comments/ratings for it; the show course instance handler is yet to be added
// router.get('/courseInstance', showRatings, )

router.post('/adduni', mw.authAdminUser, upload.single('file'), createUniversity);
router.post('/addcourse', mw.authAdminUser, createCourse);
router.post('/addteacher', mw.authAdminUser, createTeacher);
router.post('/addcourseinstance', mw.authAdminUser, createCourseInstance);

module.exports = router;