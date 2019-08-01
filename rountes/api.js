/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
    
    MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, function(err, client) {
        var db = client.db("Library");
        db.collection("book").find({}).toArray((err, docs) => {
          if (err) console.log(err);
          if(docs !== null && docs !== undefined && docs.length > 0){
            for(var i=0;i<docs.length;i++) {
              docs[i].commentcount = docs[i].comments.length;
              delete docs[i].comments;
            }
            res.json(docs);
          }else{
            res.json({"message": "no book exists"});
          }
          
          client.close();
        });
      });  
    // res.json({"_id": bookid, "title": book_title, "commentcount": num_of_comments });
 
    })
    
    .post(function (req, res){
    var book_title = req.body.title;
   
    const newEntry = {
        title: book_title,
        comments: []
      };
    
    MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, function(err, client) {
        if(err) console.log('Database error: ' + err);
        var db = client.db("Library");
        
        db.collection("book").insertOne(newEntry, (err, docs) => {
          if (err) res.json(err);
          res.json(docs.ops[0]);
          client.close();
        });
      });
    })
    
    .delete(function(req, res){
    const _id = req.body._id;
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, function(err, client) {
        var db = client.db("Library");
        db.collection("book").deleteMany({}, (err, docs) => {
          if (err) res.json({"message": "Error occurred while deleting", "error": err});
          res.json({"message": "complete delete successful"});
          client.close();
        });
      });
      //if successful response will be 'complete delete successful'
    });


  
  

  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    
    MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, function(err, client) {
        var db = client.db("Library");
        db.collection("book").find({"_id" : new ObjectId(bookid)}).toArray((err, docs) => {
          if (err) console.log(err);
          if(docs !== null && docs !== undefined && docs.length > 0){
            res.json(docs);      
            //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
          }else{
            res.json({"message": "no book exists"});
          }
          client.close();
        });
      });      
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var newcomment = req.body.comment;
    
    //if the id is valid, add comments
    MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, function(err, client) {
        var db = client.db("Library");
         if (err) res.json({"message": "db connection error", "error": err});

          db.collection("book").findOneAndUpdate({"_id" : new ObjectId(bookid)}, { $push: {comments: newcomment } }, function(err, docs) {
            if (err) res.json({"message": "Error occurred while finding", "error": err});
            if(docs !== null && docs !== undefined){
              docs.value.comments.push(newcomment);
              res.json(docs.value);
            }else{
              res.json({"message": "could not found or update", "_id": bookid});
            }
          client.close();
        });
      });

    
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      console.log(bookid)
    MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, function(err, client) {
        var db = client.db("Library");

        db.collection("book").deleteOne({"_id": new ObjectId(bookid)}, (err, docs) => {
          
          if (err) {
            client.close();
            return res.type('text').send('could not delete ' + bookid);
          }
          else {
            res.type('text').send('delete successful');
          }
          client.close();
        });
      });
        //if successful response will be 'delete successful'
    });
  
};
