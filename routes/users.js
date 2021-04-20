'use strict';

const express = require('express');
const User = require('../models').User;
const { check, validationResult } = require('express-validator');
const authenticateUser = require("./userauthentication");
const bcryptjs = require('bcryptjs');


// Construct a router instance.
const router = express.Router();
//Enable All CORS Requests



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
                                GET-Route
 -----------------------------------------------------------------
    *  This route returns the current authenticated user.
    * it uses the middleware "authenticateUser" to get the current authenticated user
 ----------------------------------------------------------------*/
  router.get('/', authenticateUser, asyncHandler( async (req, res) => {
    /*
        The middleware "authenticateUser" stores the "currentUser"
        on the request-object. So we get the current user by
        calling "req.currentUser".
    */
    const user = req.currentUser;
  
    /*
        The current user "firstName", "lastName" and "emailAddress" 
        are send as response with the status code 200.
    */ 
    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      id: user.id
    });
    }
));

  



/*----------------------------------------------------------------
                        Input Validation
 -----------------------------------------------------------------
    The function "inputValidator" validates the input for 
    "firstName","lastName","emailAddress","password"
    It is used in the post-route to validate the Input 
    before it is send to the database 
 ----------------------------------------------------------------*/
//Validation for the post route
const inputValidator = [
    check('firstName')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "first name"'),
    check('lastName')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "last name"'),
    check('emailAddress')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "email"'),
    check('password')
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "password"')
      .isLength({ min: 8, max: 20 })
      .withMessage('Password length must be between 8 and 20 characters'),
  ];
  






 /*----------------------------------------------------------------
                            POST - route
 -----------------------------------------------------------------
    *  This route creates a new user
    *  First the input data is validated
    *  Then we check if the user is unique or already exists
    *  If user doesn't exist the password is hashed and the user is created
 ----------------------------------------------------------------*/
    router.post('/', inputValidator, asyncHandler( async (req, res) => {
		 //Storing the "validationResult" in variable "errors"
         const errors = validationResult(req);
  
         // If there are validation errors "errors.isEmpty()" would be false. 
        // Therfore the not-operator "!" is used, so that it has the value "true" if a validation error exists
         if (!errors.isEmpty()) {
            // Here the map function is used, to get a list of error messages 
           const errorMessages = errors.array().map(error => error.msg);
          // The Error Message with the status 400 is returned as json object
           return res.status(400).json({ errors: errorMessages });
         }
       
         // Get the user from the request body.
         const user = req.body;

        // check if user already exists in Users table
		 const userIsExisting = await User.findOne({
			where: {
				emailAddress: user.emailAddress
			}
		});


        if(userIsExisting) {
            //if user already exists a status code 400 is send to the client, with 
            res.status(400).json({ errors: ["Email must be unique. This email already exists."] });
        } else {
            // Hash the new user's password.
            user.password = bcryptjs.hashSync(user.password);
            // Add the user to the `users` table.
            await User.create(user);
        
            // Set the status to 201 Created and end the response.
            return res.location('/').status(201).end();
        }
		
	}
));


module.exports = router;

	

