const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
global.__root = __dirname + '/';
const dotenv = require('dotenv').config({path: `${__root}.env`});
const config = require('./config/config');
const db = require('./db');
const routes = require('./resources/routes');

// middleware for handling cors
app.use(cors());

// 'hello' to test if resources are up
app.get('/hello', (req, res) => {
    res.status(200).send('API resources are up!');
});

// primary routes
app.use(routes);

// start app
app.listen(config.node_port, () => {
    console.log(`Server listening on port: ${config.node_port}`);
});



