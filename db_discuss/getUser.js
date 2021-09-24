module.exports = {getUser};

async function getUser(client, database){
    const result = await client.db(database).collection('users').findOne();
    console.log(result);
}