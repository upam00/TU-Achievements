var Result = require('../models/result');
var Student = require('../models/student');
var Exam = require('../models/exam');
//var ResultInstance = require('../models/resultinstance');

const { body,validationResult } = require("express-validator");

var async = require('async');


const { requiresAuth } = require('express-openid-connect');

exports.index = function(req, res) {

        if(req.oidc.isAuthenticated())
            {res.render('index', { title: 'TU Achivements Page'});}
        else
        {res.render('index_public', { title: 'TU Achivements Page' });}
    
};



// Display list of all results.
exports.result_list = function(req, res, next) {

  Result.find({})
    .populate('student').populate('exam').exec(function (err, list_results) {
      if (err) {return next(err)} 
      else {
            // Successful, so render
            res.render('u_result_list', { title: 'Achivements List', result_list:  list_results});
        }
    });

};


// Display detail page for a specific result.
exports.result_detail = function(req, res, next) {

    async.parallel({
        result: function(callback) {

            Result.findById(req.params.id)
              .populate('student')
              .populate('exam')
              .exec(callback);
        }
        /*
        result_instance: function(callback) {

          ResultInstance.find({ 'result': req.params.id })
          .exec(callback);
        },
        */
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.result==null) { // No results.
            var err = new Error('Result not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('u_result_detail', {result: results.result} );
    });

};


// Display result create form on GET.
exports.result_create_get = function(req, res, next) {

    // Get all students and exams, which we can use for adding to our result.
    async.parallel({
        students: function(callback) {
            Student.find(callback);
        },
        exams: function(callback) {
            Exam.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('u_result_form', { title: 'Create Achivement',students:results.students, exams:results.exams });
    });

};

// Handle result create on POST.
exports.result_create_post = [
    // Convert the exam to an array.
    /*(req, res, next) => {
        if(!(req.body.exam instanceof Array)){
            if(typeof req.body.exam==='undefined')
            req.body.exam=[];
            else
            req.body.exam=new Array(req.body.exam);
        }
        next();
    },
    */

    // Validate and sanitize fields.
    body('student', 'Enrollment No must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('exam', 'Exam must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('Marks', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    //body('exam.*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Result object with escaped and trimmed data.
        var result = new Result(
          { 
            student: req.body.student,
            exam: req.body.exam,
            rank: req.body.rank,
            marks: req.body.marks,
            percentile: req.body.percentile
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all students and exams for form.
            async.parallel({
                students: function(callback) {
                    Student.find(callback);
                },
                exams: function(callback) {
                    Exam.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                /* Mark our selected exams as checked.
                for (let i = 0; i < results.exams.length; i++) {
                    if (result.exam.indexOf(results.exams[i]._id) > -1) {
                        results.exams[i].checked='true';
                    }
                }
                */
                console.log("error found");
                res.render('u_result_form', { title: 'Create Result',student :results.students, exams:results.exams, result: result, errors: errors.array() });
                
            });
            return;
        }
        else {
            // Data from form is valid. Save result.
            result.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new result record.
                   console.log("successfull");
                   res.redirect(result.url);
                });
        }
    }
];




// Display result delete form on GET.
exports.result_delete_get = function(req, res, next) {

    async.parallel({
        result: function(callback) {
            Result.findById(req.params.id).populate('student').populate('exam').exec(callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.result==null) { // No results.
            res.redirect('/catalog/results');
        }
        // Successful, so render.
        res.render('u_result_delete', { title: 'Delete Result ?', result: results.result} );
    });

};

// Handle result delete on POST.
exports.result_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        result: function(callback) {
            Result.findById(req.body.id).populate('student').populate('exam').exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        else {
            // Result has no ResultInstance objects. Delete object and redirect to the list of results.
            Result.findByIdAndRemove(req.body.id, function deleteResult(err) {
                if (err) { return next(err); }
                // Success - got to results list.
                res.redirect('/catalog/results');
            });

        }
    });

};

// Display result update form on GET.
exports.result_update_get = function(req, res, next) {

    // Get result, students and exams for form.
    async.parallel({
        result: function(callback) {
            Result.findById(req.params.id).populate('student').populate('exam').exec(callback);
        },
        students: function(callback) {
            Student.find(callback);
        },
        exams: function(callback) {
            Exam.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.result==null) { // No results.
                var err = new Error('Result not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            
            res.render('u_result_form', { title: 'Update Result', students:results.students, exams:results.exams, result: results.result });
        });

};


// Handle result update on POST.
exports.result_update_post = [

    // Convert the exam to an array.
    (req, res, next) => {
        if(!(req.body.exam instanceof Array)){
            if(typeof req.body.exam==='undefined')
            req.body.exam=[];
            else
            req.body.exam=new Array(req.body.exam);
        }
        next();
    },
   
    // Validate and santitize fields.
    body('student', 'Student ID must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('exam', 'Exam must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    //body('exam.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Result object with escaped/trimmed data and old id.
        var result = new Result(
            { 
              student: req.body.student,
              exam: req.body.exam,
              rank: req.body.rank,
              marks: req.body.marks,
              percentile: req.body.percentile,
              _id:req.params.id 
             });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all students and exams for form
            async.parallel({
                students: function(callback) {
                    Student.find(callback);
                },
                exams: function(callback) {
                    Exam.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('result_form', { title: 'Update Result',students:results.students, exams:results.exams, result: result, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Result.findByIdAndUpdate(req.params.id, result, {}, function (err,theresult) {
                if (err) { return next(err); }
                   // Successful - redirect to result detail page.
                   res.redirect(theresult.url);
                });
        }
    }
];

//Public route to get the public results page.
exports.achivements = function(req, res) {

    Result.find({})
    .populate('student').populate('exam').exec(function (err, list_results) {
      if (err) {return next(err)} 
      else {
        if(req.oidc.isAuthenticated())
            {res.render('u_achivements_admin', { title: 'Achivements', result_list: list_results });}
        else
            {res.render('u_achivements_public', { title: 'Achivements', result_list: list_results });}
        }
    });
   
};


//.list-group.list-group-flush
/*
 p Welcome to #[em LocalLibrary], a very basic Express website developed as a tutorial example on the Mozilla Developer Network.


  h1 Dynamic content

  if error
    p Error getting dynamic content.
  else

    p The library has the following record counts:
    
    ul
      li #[strong Books:] !{data.book_count}
      li #[strong Copies:] !{data.book_instance_count}
      li #[strong Copies available:] !{data.book_instance_available_count}
      li #[strong Authors:] !{data.author_count}
      li #[strong Genres:] !{data.genre_count}
      */