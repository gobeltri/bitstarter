var express = require('express');
var app = express();
app.use(express.logger());


var buffer = fs.readFileSync('index.html');
var string = buffer.toString;

app.get('/', function(request, response) {
  response.send('Hello World 2!');
  buffer.troString('utf-8');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
