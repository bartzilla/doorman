var express = require('express');
var doorman = require('../index');

var app = express();

app.use(doorman.init(app, {website: false}));

var port = 3000;
app.on('doorman.ready', function(){
  app.listen(port);
  console.log('Example is running on port: ' + port + '.');
});