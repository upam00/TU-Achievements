var Student = require('../models/student')
var async = require('async')
//var Book = require('../models/book')

const { body, validationResult } = require("express-validator");

// Display list of all students.
exports.student_list = function (req, res, next) {

    Student.find()
        .sort([['first_name', 'ascending']])
        .exec(function (err, list_student) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('student_list', { title: 'Student List', student_list: list_student });
        })

};


// Display detail page for a specific student.

exports.student_detail = function (req, res, next) {

    async.parallel({
        student: function (callback) {
            Student.findById(req.params.id)
                .exec(callback)
        },
        /*students_books: function (callback) {
            Book.find({ 'student': req.params.id }, 'title summary')
                .exec(callback)
        },
        //exam cleared by student goes here.
        */
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.student == null) { // No results.
            var err = new Error('student not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('student_detail', { title: 'student Detail', student: results.student });
    });

};



//Display student create form on GET.
exports.student_create_get = function (req, res, next) {
    res.render('student_form', { title: 'Create student' });
};


// Handle student create on POST.
exports.student_create_post = [

    // Validate and sanitize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('last_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    //body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    //body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('department').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('course').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('enrollment_no').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        //handling unique Roll No

        const errors = validationResult(req);

        var new_student = new Student(
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                //date_of_birth: req.body.date_of_birth,
                //date_of_death: req.body.date_of_death,
                course: req.body.course,
                department: req.body.department,
                enrollment_no: req.body.enrollment_no
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('student_form', { title: 'Create student', student: new_student, errors: errors.array() });
            return;
        }

        else {


            async.parallel({
                student: function (callback) {
                    Student.find({ enrollment_no: req.body.enrollment_no })
                        .exec(callback)
                },
                /*students_books: function (callback) {
                    Book.find({ 'student': req.params.id }, 'title summary')
                        .exec(callback)
                },
                //exam cleared by student goes here.
                */
            }, function (err, results) {
                if (err) {
                    console.log("error");
                    return next(err);
                } // Error in API usage.
                if (results.student.length != 0 ) { // Duplicate No.
                    var err = new Error();
                    err.msg = "Duplicate Enrollment No. A student with same Enrollment No already exists."
                    //err.status = 404;
                    //console.log(err);
                    //return next(err);
                    //errors.add(err);
                    res.render('student_form', { title: 'Create student', student: new_student, errors: [err]});
                    return;
                }
                else {
                   



                    // Data from form is valid.

                    // Save student.
                    new_student.save(function (err) {
                        if (err) { return next(err); }
                        // Successful - redirect to new student record.
                        res.redirect('/catalog/student/' + new_student.url);
                    });

                }
            });
        }
        //Handle Roll No is unique

        // Create student object with escaped and trimmed data

    }
];


//Display student delete form on GET.
exports.student_delete_get = function (req, res, next) {

    async.parallel({
        student: function (callback) {
            Student.findById(req.params.id).exec(callback)
        },
        /*students_books: function (callback) {
            Book.find({ 'student': req.params.id }).exec(callback)
        },
        //results
        */
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.student == null) { // No results.
            res.redirect('/catalog/students');
        }
        // Successful, so render.
        res.render('student_delete', { title: 'Delete student', student: results.student });
    });

};



// Handle student delete on POST.
exports.student_delete_post = function (req, res, next) {

    async.parallel({
        student: function (callback) {
            Student.findById(req.body.studentid).exec(callback)
        },
        /*students_books: function (callback) {
            Book.find({ 'student': req.body.studentid }).exec(callback)
        },
        */
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        /*if (results.students_books.length > 0) {
            // student has books. Render in same way as for GET route.
            res.render('student_delete', { title: 'Delete student', student: results.student, student_books: results.students_books });
            return;
        }
        */
        // {
        // student has no books. Delete object and redirect to the list of students.
        Student.findByIdAndRemove(req.body.studentid, function deletestudent(err) {
            if (err) { return next(err); }
            // Success - go to student list.
            res.redirect('/catalog/students')
        })


    });

};


// Display student update form on GET.
exports.student_update_get = function (req, res, next) {

    Student.findById(req.params.id, function (err, student) {
        if (err) { return next(err); }
        if (student == null) { // No results.
            var err = new Error('student not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('student_form', { title: 'Update student', student: student });

    });
};

// Handle student update on POST.
exports.student_update_post = [

    // Validate and santize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('last_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    //body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    //body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('department').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('course').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('enrollment_no').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create student object with escaped and trimmed data (and the old id!)
        var student = new Student(
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                //date_of_birth: req.body.date_of_birth,
                //date_of_death: req.body.date_of_death,
                course: req.body.course,
                department: req.body.department,
                enrollment_no: req.body.enrollment_no,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('student_form', { title: 'Update student', student: student, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Student.findByIdAndUpdate(req.params.id, student, {}, function (err, thestudent) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect('/catalog/student/' + student.url);
            });
        }
    }
];

