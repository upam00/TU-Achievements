var express = require('express');
var router = express.Router();


// Require our controllers.
//var book_controller = require('../controllers/bookController'); 
//var author_controller = require('../controllers/authorController');
//var genre_controller = require('../controllers/genreController');
//var book_instance_controller = require('../controllers/bookinstanceController');
var student_controller = require('../controllers/studentController')
var exam_controller = require('../controllers/examController')
var result_controller = require('../controllers/resultConroller')


const { requiresAuth } = require('express-openid-connect');

//PUBLIC ROUTES
router.get('/', result_controller.index); 
router.get('/achivements',  result_controller.achivements);

//STUDENT ROUTES
router.get('/students', requiresAuth(), student_controller.student_list);
router.get('/student/create', requiresAuth(), student_controller.student_create_get);
router.post('/student/create', requiresAuth(), student_controller.student_create_post);
router.get('/student/:id', requiresAuth(), student_controller.student_detail);
router.get('/student/:id/delete', requiresAuth(), student_controller.student_delete_get);
router.post('/student/:id/delete', requiresAuth(), student_controller.student_delete_post);
router.get('/student/:id/update', requiresAuth(), student_controller.student_update_get);
router.post('/student/:id/update', requiresAuth(), student_controller.student_update_post);

//EXAM Routes
router.get('/exams', requiresAuth(), exam_controller.exam_list);
router.get('/exam/create', requiresAuth(), exam_controller.exam_create_get);
router.post('/exam/create', requiresAuth(), exam_controller.exam_create_post);
router.get('/exam/:id', requiresAuth(), exam_controller.exam_detail);
router.get('/exam/:id/delete', requiresAuth(), exam_controller.exam_delete_get);
router.post('/exam/:id/delete', requiresAuth(), exam_controller.exam_delete_post);
router.get('/exam/:id/update', requiresAuth(), exam_controller.exam_update_get);
router.post('/exam/:id/update', requiresAuth(), exam_controller.exam_update_post);

//RESULT Routes

router.get('/results', requiresAuth(), function(req, res) {
    res.redirect('/catalog/achivements');
  });
router.get('/result/create', requiresAuth(), result_controller.result_create_get)
router.post('/result/create', requiresAuth(), result_controller.result_create_post)
router.get('/result/:id', requiresAuth(), result_controller.result_detail);
router.get('/result/:id/delete', requiresAuth(), result_controller.result_delete_get);
router.post('/result/:id/delete', requiresAuth(), result_controller.result_delete_post);
router.get('/result/:id/update', requiresAuth(), result_controller.result_update_get);
router.post('/result/:id/update', requiresAuth(), result_controller.result_update_post);


module.exports = router;
