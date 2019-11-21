const express=require('express')
// set up express app
const favicon = require('express-favicon');
 
 


const PORT = process.env.PORT || 4000

const app = express();

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use('/api',require('./routes/api'))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))