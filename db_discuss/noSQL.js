const { MongoClient } = require('mongodb');
const database = 'music_recommendation';

module.exports = {connection, disconnection};


async function connection() {


    const uri = "mongodb://localhost:27017";

    const client = new MongoClient(uri);


    try {
        // Connect to the MongoDB cluster
        await client.connect();
        console.log('tu est connecté');


    } finally {
    }
    return client;
}

async function disconnection(client) {
    // Close the connection to the MongoDB cluster
    await client.close();
    console.log('tu est déconnecté');
}



// Add functions that make DB calls here

async function getUser(client, newListing){
    const result = await client.db(database).collection('users').findOne();
    console.log(result);
}

async function testUser(client,mail,pseudo,password) {
    const result = await client.db(database).collection('users').findOne({pseudo : pseudo, mail : mail});
    console.log(result);
}