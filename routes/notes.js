'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  mongoose.connect(MONGODB_URI)
  .then(() => {
      const { searchTerm } = req.query
    if(searchTerm){
      return Note.find()
      .or([{title:{$regex: searchTerm, $options: 'i'}},{content:{$regex: searchTerm, $options: 'i'}}])
  }
  return Note.find()
})
    
  .then(results => {
      res.json(results);
  })
  .then(() => {
      return mongoose.disconnect()
  })
  .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
  });
  
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(()=>{
        const id = req.params.id

        return Note.findById(id)
    })
    .then(result =>{
        res.json(result)
    })
    .then(() => {
        return mongoose.disconnect()
    })
    .catch(err => {
    console.error(`ERROR: ${err.message}`);
    next(err);
    })
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {


  mongoose.connect(MONGODB_URI)
  .then(()=>{
      const {title, content} = req.body

      const newItem = {
        title: title,
        content: content
      }

      return Note.create(newItem)
  })
  .then(result =>{
      res.location(req.originalUrl/req.id).status(201).json(result)
  })
  .then(()=>{
      return mongoose.disconnect()
  })
.catch(err => {
console.error(`ERROR: ${err.message}`);
console.error(err);
});

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  mongoose.connect(MONGODB_URI)
  .then(()=>{
  const id =req.params.id

  const {title, content} =req.body
  const updateObj = {title:title, content:content}

      return Note.findByIdAndUpdate(id,updateObj,{new: true})
  })
  .then(result =>{
    if(result){
      res.json(result)
    }
    else{
      next()
    }
  })   
  .then(()=>{
      return mongoose.disconnect()
  })
.catch(err => {
console.error(`ERROR: ${err.message}`);
next(err);
});
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  mongoose.connect(MONGODB_URI)
  .then(()=>{
      const id = req.params.id

      return Note.findByIdAndRemove(id)
  })
      .then(() =>{
        res.sendStatus(204)
  })   
  .then(()=>{
      return mongoose.disconnect()
  })
.catch(err => {
  console.error(`ERROR: ${err.message}`);
  next(err);
});
});

module.exports = router;