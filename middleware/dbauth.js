const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const { registerValidation, loginValidation } = require('../validation');


router.post('/login', async (req, res) => {
    const { error } = loginValidation(req.body);

    if (error) { 
        return res.status(400).send(error.details[0].message);
    }

    // Check if user is registered
    const user = await User.findOne({ email: req.body.email });

    if(!user) return res.status(400).send('Email or password is wrong');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Password is wrong');

    // Create JWT token
    const token = jwt.sign({ _id: user._id, iat: Math.floor(Date.now() / 1000) - 30 }, process.env.TOKEN_SECRET, {expiresIn: '1h'});
    res.header('auth-token', token).send(token);

    // res.send('Logged in');

});

router.post('/register', async (req, res) => {
    // Validate data
    const { error } = registerValidation(req.body);

    if (error) { 
        return res.status(400).send(error.details[0].message);
    }

    // Check if user already exists
    const emailExists = await User.findOne({ email: req.body.email });

    if(emailExists) return res.status(400).send('Email already registered');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        const savedUser = await user.save();
        res.send(savedUser);
    } catch (err) {
        res.status(400).send(err);
    }
})

module.exports = router;