# techdegree-project-9
### REST API
This REST API provides a way for users to administer a school database. 

## How to Download and Install
1) Download the repo
2) Open a Command Prompt (on Windows) or Terminal (on macOS and Linux) instance and browse to the root project folder.
3) Run the command npm install to install the required dependencies.
4) Run the command npm run seed to create your application's database and populate it with data.
5) After the command completes, you'll find in the project's root folder a SQLite database file named fsjstd-restapi.db. 
6) Run the command npm start to run the Node.js Express application.

=> Express server is listening on port 5000 (http://localhost:5000/)

## About the Project
In this project, I developed a REST API that uses Express. The API provides users with the ability to manage a school database. With the API you can:
- create new users
- retrieve user data
- display individual courses or course lists
- create, update or delete courses

## Used Frameworks
- Express
- Sequelize ORM
- express-validator
- bcryptjs
- basic-auth

## Helpful Tools
- DB Browser for SQLite for viewing SQLite database tables 
- Postman for the route testing


## Routes
Users:
| Method  | Path | Description|
| ------------- | ------------- | ------------- |
| GET | http://localhost:5000/api/users/:id  |Getting the data from currently authenticated user|
| POST | http://localhost:5000/api/users  | Creating a new user|

Users:
| Method  | Path | Description|
| ------------- | ------------- | ------------- |
| GET | http://localhost:5000/api/courses/  | Sending a list of courses as response|
| GET | http://localhost:5000/api/courses/:id  |Sending a specific courses as response|
| POST | http://localhost:5000/api/courses  |Creating a new course|
| PUT | http://localhost:5000/api/courses/:id  |Updating a specific course|
| DELETE | http://localhost:5000/api/courses/:id  |Deleting a specific course|

## Example of the User routes

## Route-Handler (asyncHandler)
To make the try-catch-block easier to use and not to have to repeat it all the time we use the middlewar "asyncHandler"

```javascript
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
```

## GET-Route
    *  This route returns the current authenticated user.
    * it uses the middleware "authenticateUser" to get the current authenticated user
  
```javascript
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
      emailAddress: user.emailAddress
    });
    }
));
```
  
## Input Validation
The function "inputValidator" validates the input for "firstName","lastName","emailAddress","password" .
It is used in the post-route to validate the Input before it is send to the database.

```javascript
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
  ```

## POST - route
    *  This route creates a new user
    *  First the input data is validated
    *  Then we check if the user is unique or already exists
    *  If user doesn't exist the password is hashed and the user is created

 ```javascript
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
            res.status(400).json({ message: "Email must be unique. This email already exists." });
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
```
