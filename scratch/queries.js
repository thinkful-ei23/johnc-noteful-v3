const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

mongoose.connect(MONGODB_URI)
.then(() => {
    const searchTerm = 'lady';

    return Note.find()
    .or([{title:{$regex: searchTerm, $options: 'i'}},{content:{$regex: searchTerm, $options: 'i'}}])
})
.then(results => {
    console.log(results);
})
.then(() => {
    return mongoose.disconnect()
})
.catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
});

//   mongoose.connect(MONGODB_URI)
//     .then(()=>{
//         const id = '000000000000000000000003'

        // return Note.findById(id)
//     })
//     .then(result =>{
//         console.log(result)
//     })
//     .then(() => {
//         return mongoose.disconnect()
//     })
//     .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//     })


    // mongoose.connect(MONGODB_URI)
    //     .then(()=>{
    //         const newItem = {title: 'having fun in the sun', content: 'just kidding'}

    //         return Note.create(newItem)
    //     })
    //     .then(result =>{
    //         console.log(result)
    //     })
    //     .then(()=>{
    //         return mongoose.disconnect()
    //     })
    // .catch(err => {
    // console.error(`ERROR: ${err.message}`);
    // console.error(err);
    // });

    // mongoose.connect(MONGODB_URI)
    //     .then(()=>{
    //        const id ='000000000000000000000005'
    //        const updateObj = {title:'newTitle here!'}

    //         return Note.findByIdAndUpdate(id,updateObj,{new: true})
    //     })
    //     .then(result =>{
    //         console.log(result)
    //     })   
    //     .then(()=>{
    //         return mongoose.disconnect()
    //     })
    // .catch(err => {
    // console.error(`ERROR: ${err.message}`);
    // console.error(err);
    // });

    // mongoose.connect(MONGODB_URI)
    //     .then(()=>{
    //         const id = '5b7325e3d04ba965dbbb7cb5'

    //         return Note.findByIdAndRemove(id)
    //     })
    //         .then(result =>{
    //         console.log(result)
    //     })   
    //     .then(()=>{
    //         return mongoose.disconnect()
    //     })
    // .catch(err => {
    // console.error(`ERROR: ${err.message}`);
    // console.error(err);
    // });