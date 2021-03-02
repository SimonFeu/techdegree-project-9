'use strict';

const User = require('../models').User;
const bcryptjs = require('bcryptjs');
const auth = require("basic-auth");

const authenticateUser = async (req, res, next) => {
    let message = null;
  
    //checking if Auth header is available
    if(auth(req)) {
    // Parse the user's credentials from the Authorization header.
    const credentialUser = auth(req).name;
    const credentialPassword = auth(req).pass;
      /*
        Getting the user data from the datastore, by searching with the username 
        stored in the Authorization header
      */
      const user = await User.findOne({
          where: {
              emailAddress: credentialUser
          }
      });
  
      //If a user exists
      if (user) {
        /* 
          Using the bcryptjs package to compare the user's password
          (from the Authorization header) to the user's password
          that was retrieved from the data store.
        */
        const authenticated = bcryptjs
          .compareSync(credentialPassword, user.password);
  
        // If the passwords matches "authenticated" is true
        if (authenticated) {
            console.log(`Authentication successful for username: ${user.emailAddress}`);
    
            /* 
              Storing the retrieved user object on the request object
            */
            req.currentUser = user;
          } else {
            message = `Authentication failure for username: ${user.emailAddress}`;
          }
        } else {
          message = `User not found for username: ${credentialUser}`;
        }
      } else {
        message = 'Auth header not found';
      }
  
    // If the user authentication fails "message" has a value
    if (message) {
      console.warn(message);
  
      // If access is denied returning a response with a 401 Unauthorized HTTP status code.
      res.status(401).json({ message: 'Access Denied' });
    } else {
      // Or if user authentication succeeded calling the next() method
      next();
    }
  };

  module.exports = authenticateUser;