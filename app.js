const express = require('express');
const path = require('path');
const routes = require('./routes');
const bodyParser = require('body-parser');

const app = express();
app.set('views', path.join(__dirname, './views'));
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'html');
app.set('view engine', 'ejs');


app.use('/', routes);

module.exports = app;