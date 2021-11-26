const { MongoClient, ObjectID} = require('mongodb');
const database = 'music_recommendation';
const colors = require('colors');

module.exports.request = request;

async function request(action = "",user_id = "",extra_data = "") {

    const uri = "mongodb://localhost:25565";

    const client = new MongoClient(uri);
    let retour = 0;

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        console.log('Users Datas'.brightCyan);
        console.log('tu est connecté'.magenta);

        switch (action) {
            case "get_data" :
                console.log("une action de récupération des données d'un user est sollicitée".cyan);
                retour = await getUserData(client,user_id);
                break;

            case "add_data" :
                console.log("une action d'ajout de données d'un user est sollicitée".cyan);
                retour = await addUserData(client,user_id,extra_data);
                break;

            case "del_data" :
                console.log("une action de suppression de données d'un user est sollicitée".cyan);
                retour = await remUserData(client,user_id,extra_data);
                break;

            default :
                console.log("aucune action sollicitée".cyan);
        }

    } finally {
        await disconnection(client);
    }
    return retour;
}

async function disconnection(client) {
    // Close the connection to the MongoDB cluster
    await client.close();
    console.log('tu est déconnecté'.magenta);
}

// Add functions that make DB calls here

async function getUserData(client,user_id) {
    const result = await client.db(database).collection("users_data").findOne({user: user_id});

    if (typeof (result) !== "undefined" && result !== null){
        return result;
    }
    return 1;
}

async function addUserData(client, user_id, data) {
    const user_datas = await getUserData(client, user_id);

    if (typeof(user_datas) === "undefined" || user_datas === 1 || (user_datas !== 1 && !(user_datas.favories.includes(data)))) {
        const resultUpdate = await client.db(database).collection("users_data").updateOne({user: user_id}, {$push: {favories: data}}, {upsert: true});
    }
    return 0;
}

async function remUserData(client,user_id,data) {
    const resultUpdate = await client.db(database).collection("users_data").updateOne({user: user_id},
        {$pull: {
            favories: data
        }});
    return 0;
}
