const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'je_test';
let db

MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    console.log("Connected successfully to server");
    db = client.db(dbName);

});