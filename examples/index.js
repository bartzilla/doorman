var express = require('express');
var doorman = require('../index');

var app = express();

app.use(doorman.init(app, {
  application: {
    href: "58b96232a973bc951a1f6891"
  },
  website: true
}));

var port = 3000;
app.on('doorman.ready', function(){
  app.listen(port);
  console.log('Example is running on port: ' + port + '.');
});