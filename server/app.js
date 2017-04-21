"use strict";
var bodyParser = require("body-parser");
var express = require("express");
var morgan = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var db = require("./config/db");
var routes = require("./routes");
var app = express();
exports.app = app;
app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
mongoose.connect(db.default.url);
var db = mongoose.connection;
mongoose.Promise = global.Promise;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
    routes.default(app);
    app.get('/*', function (req, res) {
        res.sendFile(path.join(__dirname, '../client/index.html'));
    });
    app.listen(app.get('port'), function () {
        console.log('BikeShed App listening on port ' + app.get('port'));
    });
});