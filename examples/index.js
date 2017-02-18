var express = require('express');
var doorman = require('../index');

var app = express();

app.use(doorman.init(app, {website: false}));

app.on('doorman.ready', function(){
  app.listen(3000);
});