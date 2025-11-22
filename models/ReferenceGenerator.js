const mongoose = require('mongoose');

const referenceGeneratorSchema = new mongoose.Schema({
    model_name: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: Number,
        default: 0,
    },
});

referenceGeneratorSchema.statics.getNextReference = async function(model_name) {
    const counter = await this.findOneAndUpdate({ model_name }, { $inc: { value: 1 } }, {
        new: true, // returns the newly updated version of the document
        upsert: true, // creates counter automatically
    });
    return counter.value;
};

module.exports = mongoose.model('Counter', referenceGeneratorSchema, 'counters');
