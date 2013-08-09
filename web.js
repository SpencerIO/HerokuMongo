//main
var express = require("express");
var fs = require('fs');
var app = express();

//mongo
var mongodb = require('mongodb');
var url = require('url');

//main
var index = fs.readFileSync('index.html');
app.use(express.logger());

//mongo
var log = console.log;
 
var connectionUri = url.parse(process.env.MONGOHQ_URL);
var dbName = connectionUri.pathname.replace(/^\//, '');
// test
var questionsArray = [];
var tokensArray = [];

//questionsArray.push("hello");
var lastCollection = null;

var clientCount = 2;
var clientCounter = 0;

// collection/documents
var questionsCollection;
var questionDocuments;
var tokensCollection;
var tokenDocuments;

//mongo
mongodb.Db.connect(process.env.MONGOHQ_URL, function(error, client) {
  if (error) throw error;
 
 
    questionsCollection = new mongodb.Collection(client, "questions");
    questionDocuments = questionsCollection.find({});
	
 
      // output the first 5 documents
      questionDocuments.toArray(function(error, docs) {
        if(error) throw error;
 
        docs.forEach(function(doc){
			//questionsArray = doc;
			questionsArray.push(doc)
          log(doc);
        });
 
        // close the connection
		clientCounter++;
		if(clientCounter == clientCount)client.close();
      });
	
	tokensCollection = new mongodb.Collection(client, "tokens");
    tokenDocuments = tokensCollection.find({}, {limit:5});
	
      // output the first 5 documents
      tokenDocuments.toArray(function(error, docs) {
        if(error) throw error;
 
        docs.forEach(function(doc){
			//tokensArray = doc;
			tokensArray.push(doc)
          log(doc);
        });
 
        // close the connection
		clientCounter++;
		if(clientCounter == clientCount)client.close();
      });
	
	
	
});

//main
app.get('/', function(request, response) {
  //response.send('Hello World!');
  //response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end(index);
});

app.get('/get-all/', function(request, response) {
	
mongodb.Db.connect(process.env.MONGOHQ_URL, function(error, client) {
  if (error) throw error;
  questionsCollection = new mongodb.Collection(client, "questions");
    questionDocuments = questionsCollection.find({});
	
 
      // output the first 5 documents
      questionDocuments.toArray(function(error, docs) {
        if(error) throw error;
 
        docs.forEach(function(doc){
			
			//questionsArray.push(doc)
          log(doc);
        });
 
        // close the connection
		response.send({questions:questionsArray, tokens:tokensArray, env:process.env.MONGOHQ_URL});
		client.close();
      });
  
	});
  
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});