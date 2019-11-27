require('dotenv').config()
const express=require('express');
const favicon = require('express-favicon');

//Define port
const PORT = process.env.PORT || 4000;

//set up express app
const app = express();

//initiallize routes
app.use('/',require('./routes/api'));

//listen for requests
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

//Use favicon
app.use(favicon(__dirname + '/public/favicon.ico'));