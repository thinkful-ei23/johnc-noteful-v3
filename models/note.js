const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true},
    content:String,
    folderId: {type: mongoose.Schema.Types.ObjectId, ref:'Folder'},
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
});

noteSchema.set('timestamps',true);

noteSchema.set('toObject', {
    virtuals: true,    
    versionKey: false,  
    transform: (doc, ret) => {
    delete ret._id; 
    }
});

module.exports =mongoose.model('Note', noteSchema);