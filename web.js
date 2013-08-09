var express = require('express')
  , http = require('http')
  , path = require('path')
  , mongo = require('mongo')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , mongodb = require('mongodb')
   , ObjectID = require('mongodb').ObjectID;

var app = express();
var admin = fs.readFileSync('public/admin.html');

var questionsArray = [];
var tokensArray = [];
// collection/documents
var questionsCollection;
var questionDocuments;
var tokensCollection;
var tokenDocuments;

var myclient;

mongodb.Db.connect(process.env.MONGOHQ_URL, {
    
    auto_reconnect: true,
    safe: true
}, function(err, client) {  

	myclient = client;
  
	getalldata();
});

//configure
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, "public")));
});

app.get('/', function(request, response) {
  
});

app.get('/admin/', function(request, response) {
  response.end(admin);
});

app.get('/get-all/', function(request, response) {
	
	questionsArray = [];
	
	questionsCollection = new mongodb.Collection(myclient, "questions");
    questionDocuments = questionsCollection.find({});
	
    questionDocuments.toArray(function(error, docs) {
		
        if(error) throw error;
 
        docs.forEach(function(doc){
			questionsArray.push(doc)
        });
 			response.send({questions:questionsArray, tokens:tokensArray});
     });
});

app.post('/post-all/', function(request, response) {
	
	//parse serialized json from webpage
	var requestObj = JSON.parse(request.body.obj);
	var BSON = require('mongodb').BSONPure;
	var o_id = new BSON.ObjectID(requestObj._id);
	
	var q = new mongodb.Collection(myclient, "questions");
	q.update({  _id: o_id },
			{ $set: {question: requestObj.question, yes:requestObj.yes, no:requestObj.no}},
			function (err,item){
				if (err) throw err;    
				response.send({quest:requestObj.question}
			);   
	});
   
});

function getalldata(){
	
	questionsArray = [];
	tokensArray = [];
	
	questionsCollection = new mongodb.Collection(myclient, "questions");
    questionDocuments = questionsCollection.find({});
	
        questionDocuments.toArray(function(error, docs) {
			if(error) throw error;
	 
			docs.forEach(function(doc){
				questionsArray.push(doc)
			});
 
      });
	  
	tokensCollection = new mongodb.Collection(myclient, "tokens");
    tokenDocuments = tokensCollection.find({}, {limit:5});
	
    	tokenDocuments.toArray(function(error, docs) {
			if(error) throw error;
	 
				docs.forEach(function(doc){
				tokensArray.push(doc)
			});
      });
	
}

http.createServer(app).listen(process.env.PORT || 5000);