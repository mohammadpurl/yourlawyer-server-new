
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors('*'));
const mongoose = require('mongoose');
const debuge = require('debug')("app:main");
const config = require('config');
const dotenv = require("dotenv");
dotenv.config();

const router = require('./src/routes')

require('./startup/config')(app,express);
require('./startup/db')();
require('./startup/loginng')();
app.use('/api', router);

   

const PORT = process.env.PORT  || 5000;
app.listen(PORT , () => console.log(`listening on port ${PORT}`));

