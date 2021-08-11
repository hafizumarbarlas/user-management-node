const auth = require('../middlewares/auth');
const {User, validate, validateEmail} = require('../models/user');
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
    // console.log("We need to validate the user input here");
    // We have an auth middleware which will take care of the authentication using jwt
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
})

router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if(user) {
        if(!user.isDeleted === true){
            return res.status(400).send('User already registered');
        }
    }

    if(user){
        user = await User.findByIdAndUpdate(
            user._id,
            {$set: {
                    name: req.body.name, 
                    password: await hashPassword(req.body.password), 
                    isActive: req.body.isActive, 
                    isDeleted: false, 
                    isAdmin: req.body.isAdmin, 
                    isValidated: req.body.isValidated
                }
            },
            {new: true}
        )
    }else{
        user = new User(_.pick(req.body, ['name', 'email', 'password', 'isActive', 'isAdmin', 'isValidated']));
        user.password = await hashPassword(user.password);
        await user.save();
    }

    const token = user.generateAuthToken();

    res.header('x-auth-token', token).send(_.pick(user, ['id', 'name', 'email']));
})

router.delete('/', auth, async(req, res) => {
    const {error} = validateEmail(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    await User.findOneAndUpdate(
        {email: req.body.email},
        {$set: {isDeleted: true}},
        {$new: true}
    )
    res.status(200).send("User Deleted Successfully");
})

async function hashPassword(plainPassword){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
}

module.exports = router;