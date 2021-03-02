'use strict';
const { Model, DataTypes } = require('sequelize');
 
/*----------------------------------------------------------------
                        Model "Course"
 -----------------------------------------------------------------
    * "id" is the primery key which increments automatically
    * "firstName" is a STRING value, cannot be null or empty
    * "lastName" is a STRING value, cannot be null or empty
    * "emailAddress" is a STRING value, it has to be unique, cannot be null and it must be an email format
    *  "password" is a STRING, cannot be null or empty
    *  estimatedTime is a STRING value and can be null
    *  materialsNeeded is a STRING value and can be null
    *  Course is associated with the User table (one course belongs to only on user)
 ----------------------------------------------------------------*/
module.exports = (sequelize) => {
  class User extends Model {}
  User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A name is required'
        },
        notEmpty: {
          msg: 'Please provide your firstname'
        }
      }
     },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'A name is required'
          },
          notEmpty: {
            msg: 'Please provide your lastname'
          }
        }
      },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'The email you entered already exists'
      },
      validate: {
        notNull: {
          msg: 'An email is required'
        },
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING,  
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A password is required'
        },
        notEmpty: {
          msg: 'Please provide a password'
        }
      }
    }
  }, { sequelize });
  User.associate = (models) => {
    // define association between tables
    // a "user" has many "courses"
    User.hasMany(models.Course, {
        foreignKey: {
            fieldName: 'userId', 
            allowNull: false,
        },
    });
};
  return User;
};
