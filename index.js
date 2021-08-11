const config = require('config');
const express = require('express');
const helmet  = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');


//Routes
const users = require('./routes/users');
const auth = require('./routes/auth');

const app = express();

if(!config.get('jwtPrivateKey')){
    console.log('FATAL ERROR: jwtPrivateKey is not defined');
    process.exit(1);
}
mongoose.connect('mongodb://localhost/nodepractice', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error('Could not connect to MongoDB...'));

//use set/export(MAC) PORT=port_number to set the enviroment variable
const port = process.env.PORT || 3000;

// const enviroment  = process.env.NODE_ENV; //If not set, returns undefined
const enviroment  = app.get('env'); //This uses above method but if the variable is not set, it'll return "development" by default

//Middlewares
app.use(express.json());//Set JSON req data in req.body property
// app.use(express.urlencoded({extended: true})); //Set key value pair data (Form data) in req.body property
// app.use(express.static('public')); //For serving static assets like png, logo, icons. It should be in public folder

//Third party middlewares
app.use(helmet());
if(enviroment === 'development'){
    console.log('Morgan Enabled');
    app.use(morgan('tiny'));
}

app.use('/api/users', users);
app.use('/api/auth', auth);

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});