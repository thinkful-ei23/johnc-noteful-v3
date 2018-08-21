'use strict';

const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/user');

const router = express.Router();


router.post('/users', (req,res,next)=>{
    const {fullname= '',username, password} = req.body;

    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        const err = new Error(`Missing '${missingField}' in request body`);
        err.status = 422;
    return next(err);
    }

    const stringFields = ['username', 'password', 'fullname'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if (nonStringField) {
        return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Incorrect field type: expected string',
        location: nonStringField
        });
    }

    const explicityTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Cannot start or end with whitespace',
        location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 8,
            max: 72
        }
    };
    const tooSmallField = Object.keys(sizedFields).find(
        field =>
            'min' in sizedFields[field] &&
                req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
        field =>
            'max' in sizedFields[field] &&
                req.body[field].trim().length > sizedFields[field].max
    );
    
    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
            ? `Must be at least ${sizedFields[tooSmallField]
                .min} characters long`
            : `Must be at most ${sizedFields[tooLargeField]
                .max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }
    

    return User.find({username})
    .count()
    .then(count =>{
        if(count > 0){
            return Promise.reject({
                code: 422,
                reason: 'ValidationError',
                message: 'Username already exists',
                location: 'username'
            });
        }
        return User.hashPassword(password)
    })
    .then((digest)=>{
        console.log(digest)
        return User.create({
            fullname,
            username,
            password: digest
        });
    })
    .then(result =>{
        return res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
        if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
        }
        res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

router.put('/users/:id',(req,res,next)=>{
    const _id = req.params.id
    const {fullname,username,password} = req.body
    let updateUser;
    return User.findById(_id).exec()
    .then(user =>{
        updateUser = user
        console.log(user)
        updateUser.fullname = fullname || updateUser.fullname
        updateUser.username = username || updateUser.username
        if(password){
            return updateUser.validatePasswordHistory(password)
            .then(isValid=>{  
                console.log(isValid)
                if (!isValid){
                    throw new Error('oops')
                }
                updateUser.passwordHistory = updateUser.passwordHistory || []
                updateUser.passwordHistory=[...updateUser.passwordHistory,updateUser.password]
                return User.hashPassword(password)
                .then(hashedPassword =>{
                    updateUser.password = hashedPassword
                    return user.save()
                })})
            }
        return user.save()
    })
    .then(result=>{
        console.log(result)
        res.json(result)
    })
    .catch(err =>{
        next(err)
    })
})


module.exports = router;