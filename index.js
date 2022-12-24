require('dotenv').config()
const express = require('express');
const favicon = require('express-favicon');
var serveStatic = require('serve-static')
var cors = require('cors')

const PORT = process.env.PORT || 4000;

const app = express();
// Serve the files in public as static to improve load times.
app.use(serveStatic('public'))
app.use(cors())
app.use('/', require('./routes/api'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Use favicon to avoid errors in the requests.
app.use(favicon(__dirname + '/public/favicon.ico'));

module.exports = app