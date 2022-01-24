const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const localStrategy = require('passport-local');

app.get('/', (req, res)=> res.send('fuck you!'));

app.listen(process.env.PORT || 3000, ()=> console.log(`Server is up and running om port ${process.env.PORT || 3000}`));