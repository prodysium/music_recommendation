/*const { MongoClient } = require('mongodb');
let getUser = require('./getUser');
let noSQL = require('./noSQL');
const database = 'music_recommendation';

let client = noSQL.connection().then();

let user = getUser.getUser(client,database);

console.log(user);

noSQL.disconnection(client).then();



// Add functions that make DB calls here



async function testUser(client,mail,pseudo,password) {
    const result = await client.db(database).collection('users').findOne({pseudo : pseudo, mail : mail});
    console.log(result);
}*/