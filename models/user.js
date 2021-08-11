const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 255,
    },
    isActive: {
        type: Boolean,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    isValidated: {
        type: Boolean,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
    return token;
}
const User = mongoose.model('User', userSchema);

function validateUser(user){
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        isActive: Joi.boolean().required(),
        isDeleted: Joi.boolean(),
        isAdmin: Joi.boolean().required(),
        isValidated: Joi.boolean().required()
    });
    return schema.validate(user);
}

function validateEmail(user){
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email()
    });
    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
exports.validateEmail = validateEmail;
