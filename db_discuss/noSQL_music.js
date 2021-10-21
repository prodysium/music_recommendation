const { MongoClient } = require('mongodb');
const database = 'music_recommendation';

module.exports.request = request;

async function request(action = "",user_id = "",extra_data = "") {


    const uri = "mongodb://localhost:27017";

    const client = new MongoClient(uri);
    let retour = 0;


    try {
        // Connect to the MongoDB cluster
        await client.connect();

        console.log('tu est connecté');

        switch (action) {
            case "get_data" :
                console.log("une action de récupération des données d'un user est sollicitée");
                retour = await getUserData(client,user_id);
                break;
            case "add_data" :
                console.log("une action d'ajout de données d'un user est sollicitée");
                retour = await addUserData(client,user_id,extra_data);
                break;
            case "rem_data" :
                console.log("une action de suppression de données d'un user est sollicitée");
                retour = await remUserData(client,user_id,extra_data);
                break;

            default :
                console.log("aucune action sollicitée");
        }

    } finally {
        await disconnection(client);
    }
    return retour;
}

async function disconnection(client) {
    // Close the connection to the MongoDB cluster
    await client.close();
    console.log('tu est déconnecté');
}

// Add functions that make DB calls here

