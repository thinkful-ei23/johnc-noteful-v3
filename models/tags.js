const mongoose = require('mongoose')

const tagsSchema = new mongoose.Schema({
    name: { type: String, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

tagsSchema.index({ name: 1, userId: 1}, { unique: true });


tagsSchema.set('timestamps',true);

tagsSchema.set('toObject',{
    virtuals:true,
    versionKey:false,
    transform: (doc, ret) => {
        delete ret._id;
        }
});

module.exports = mongoose.model('Tag',tagsSchema);