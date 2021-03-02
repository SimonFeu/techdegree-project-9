'use strict';
const { Model, DataTypes } = require('sequelize');
 
/*----------------------------------------------------------------
                        Model "Course"
 -----------------------------------------------------------------
    * "id" is the primery key which increments automatically
    * "title" is a STRING value, cannot be null or empty
    *  "descritpion" is a TEXT value, cannot be null or empty
    *  "estimatedTime" is a STRING value and can be null
    *  "materialsNeeded" is a STRING value and can be null
    *  Course is associated with the User table (one course belongs to only on user)
 ----------------------------------------------------------------*/
module.exports = (sequelize) => {
  class Course extends Model {}
  Course.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A title is required'
        },
        notEmpty: {
          msg: 'Please provide a title'
        }
      }
     },
     description : {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'A description is required'
          },
          notEmpty: {
            msg: 'Please provide a description'
          }
        }
      },
      estimatedTime : {
      type: DataTypes.STRING,
      allowNull: true
    },
    materialsNeeded : {
      type: DataTypes.STRING,  
      allowNull: true
    }
  }, { sequelize });
  Course.associate = (models) => {
    // define association between tables
    // a "course" belongs to a single "user"
    Course.belongsTo(models.User, {
        foreignKey: {
            fieldName: 'userId',
            allowNull: false
        }
    });
};
  return Course;
};
