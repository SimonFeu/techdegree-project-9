'use strict';

const express = require('express');
const User = require('../models').User;
const Course = require('../models').Course;
const { check, validationResult } = require('express-validator');
const authenticateUser = require("./userauthentication");


// Construct a router instance.
const router = express.Router();


/*----------------------------------------------------------------
                Route-Handler (asyncHandler)
 -----------------------------------------------------------------
    * To make the try-catch-block easier to use 
      and not to have to repeat it all the time we 
      use the middlewar "asyncHandler"
 ----------------------------------------------------------------*/
// Handler function to wrap each route.
function asyncHandler(cb) {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        // Forward error to the global error handler
        next(error);
      }
    }
  }


/*----------------------------------------------------------------
                Get-route (all courses)
 -----------------------------------------------------------------
    * This get-route returns a list of all courses
    * It includes all the data from the user table associated 
      with the particular course
 ----------------------------------------------------------------*/
/*  GET /api/courses 200 - Returns a 
    list of courses (including the user that owns each course)*/
    router.get('/', asyncHandler( async (req, res) => {
            //selecting all course-objects in the database
            const courses = await Course.findAll({
                //filter out properties "createdAt" and "updatedAt"
                attributes: {
                    exclude: ['createdAt','updatedAt']
                },
                //includes all the data from the user table associated with the course
                include: [
                    {
                      model: User,
                      //filter out properties "createdAt" and "updatedAt"
                      attributes: {
                        exclude: ['createdAt','updatedAt']
                      },
                    },
                  ],
            });
            //All course-objects are send to the client
            res.json(courses);
        }
    ));



/*----------------------------------------------------------------
                Get-route (specific courses)
 -----------------------------------------------------------------
    * This get-route returns a specific course with the id
      "req.params.id"
    * It includes all the data from the user table associated 
      with the course
 ----------------------------------------------------------------*/
router.get('/:id', asyncHandler( async (req, res) => {
        const course = await Course.findOne({
            //selecting the course-object with the id "req.params.id"
            where: {
                id: req.params.id
            },
            //filter out properties "createdAt" and "updatedAt"
           attributes: {
              exclude: ['createdAt','updatedAt']
            },
            //includes all the data from the user table associated with the course
            include: [
                {
                  model: User,
                  //filter out properties "createdAt" and "updatedAt"
                  attributes: {
                      exclude: ['createdAt','updatedAt']
                  },
                },
              ],
        });
        if(course){
            //if a course with the given "id" is existing the course-object is send to the client
            res.json(course);
        } else {
            //if a course with the given "id" is not existing the following message with the status 404 is send to the client
            res.status(404).json({message: "No Course with this ID found."})
        }
    
}
));




/*----------------------------------------------------------------
                        Input Validation
 -----------------------------------------------------------------
    The function "inputValidator" validates the input for 
    "title" and "description".
    It is used in the post-route and the put-route to validate
    the Input before it is send to the database 
 ----------------------------------------------------------------*/
const inputValidator = [
    check('title')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check('description')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"'),
];
  




/*----------------------------------------------------------------
                        Post-route
 -----------------------------------------------------------------
    * The post-route first uses the middelware "inputValidator"
      to validate the input for "title" and "description".
    * Then it uses the middelware "authenticateUser" to check if
      the current (logged in) user is allowed to post a course.
    * If validation and authentication is OK it creates a course
      with the input data and saves it to the database 
 ----------------------------------------------------------------*/
router.post('/', inputValidator , authenticateUser, asyncHandler( async (req, res) => {  
        //Storing the "validationResult" in variable "errors"
        const errors = validationResult(req);
        // If there are validation errors "errors.isEmpty()" would be false. 
        // Therfore the not-operator "!" is used, so that it has the value "true" if a validation error exists
        if (!errors.isEmpty()) {
            // Here the map function is used, to get a list of error messages 
            const errorMessages = errors.array().map(error => error.msg);
            // The Error Message with the status 400 is returned as json object
            return res.status(400).json({ errors: errorMessages });
        } else {
            //stores the request body in the variable vourse
            const course = req.body;
            //setting the foreign key "userId" to the current user-id
            course.userId = req.currentUser.id;
            //creates and saves the course in the database
            const courseCreated = await Course.create(course);
            //setting the Locationheader to the URI for the course (with course id), and returns no content (status 201)
            res.location(`/api/courses/${courseCreated.id}`).status(201).end();
        }
    }
));






/*----------------------------------------------------------------
                        Put-route
 -----------------------------------------------------------------
    * Route-path uses "params" to read the course-id
    * The post-route first uses the middelware "inputValidator"
      to validate the input for "title" and "description".
    * Then it uses the middelware "authenticateUser" to check if
      the current (logged in) user is allowed to post a course.
    * If validation and authentication is OK it updates the course
      with the given id and saves it to the database 
 ----------------------------------------------------------------*/
router.put('/:id', inputValidator, authenticateUser, asyncHandler( async (req, res) => {
        //Storing the "validationResult" in variable "errors"
        const errors = validationResult(req);
        // If there are validation errors "errors.isEmpty()" would be false. 
        //Therfore the not-operator "!" is used, to show "true" if a validation error exists
        if (!errors.isEmpty()) {
            // Here the map function is used, to get a list of error messages 
            const errorMessages = errors.array().map(error => error.msg);
            // The Error Message with the status 400 is returned as json object
            return res.status(400).json({ errors: errorMessages });
        } else {
            //selecting the course with the "id" of "req.params.id" and saving it to the variable "course"
            const course = await Course.findOne({
                where: {
                    id: req.params.id
                }
            });
            //Checking if the course with the given "id" exists
            if(course){
                //Testing if userId inside the coursedata matches the userId of the logged-in user
                if(course.userId == req.currentUser.id) {
                    //updating "title" and "description" of the course with data of "req.body"
                    course.title = req.body.title;
                    course.description = req.body.description;
                    //saving the updated course to the database
                    await course.save();
                    //ending the response with a status 204
                    res.status(204).end();
                } else {
                    /*
                        if the logged in user is not the one who has created the course access is forbidden.
                        Then the following messages is send to the client with the status 403
                    */
                    res.status(403).json({message: "Access to the requested resource is forbidden"});
                }
            } else {
                //if a course with the given "id" is not existing the following message with the status 404 is send to the client
                res.status(404).json({message: "Course not found"});
            }
        }
    }
));






/*----------------------------------------------------------------
                        Delete-route
 -----------------------------------------------------------------
    * Route-path uses "params" to read the course-id
    * The post-route first uses the middelware "inputValidator"
      to validate the input for "title" and "description".
    * Then it uses the middelware "authenticateUser" to check if
      the current (logged in) user is allowed to post a course.
    * If validation and authentication is OK it updates the course
      with the given id and saves it to the database 
 ----------------------------------------------------------------*/
router.delete('/:id',authenticateUser, asyncHandler( async (req, res) => {
    //selecting the course with the "id" of "req.params.id" and saving it to the variable "course"
    const course = await Course.findOne({
        where: {
            id: req.params.id
        }
    });

    //Checking if the course with the given "id" exists
    if(course){
        //Testing if userId inside the coursedata matches the userId of  logged-in user
        if(course.userId == req.currentUser.id) {
            //deleting the course in the database 
            await course.destroy();
            //ending the response with a status 204
            res.status(204).end();
        } else {
            /*
                if the logged in user is not the one who has created the course access is forbidden.
                Then the following messages is send to the client with the status 403
            */
            res.status(403).json({message: "Access to the requested resource is forbidden"});
        }
    } else {
         //if a course with the given "id" is not existing the following message with the status 404 is send to the client
        res.status(404).json({message: "Course not found"});
    }

    }
));




module.exports = router;