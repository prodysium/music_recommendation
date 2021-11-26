const { MongoClient, ObjectID} = require('mongodb');
const database = 'music_recommendation';
const colors = require('colors');

module.exports.request = request;

async function request(action = "",artiste = "", titre = "",ids = []) {

    const uri = "mongodb://localhost:25565";

    const client = new MongoClient(uri);
    let retour = 0;

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        console.log('Music Datas'.brightCyan);
        console.log('tu est connecté'.magenta);
        
        switch (action) {
            case "search_music":
                console.log("une action de recherche de musique est sollicitée".cyan);
                retour = await getMusicFromSearch(client, artiste, titre);
                break;

            case "get_musics":
                console.log("une action de récupération de musiques est sollicitée".cyan);
                retour = await getMusics(client,ids);
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
async function getMusicFromSearch(client,artiste, titre) {
    if (titre !== "" || artiste !== "") {
        return await client.db(database).collection("music_data").find({
            song_name: {$regex: '.*' + titre + '.*', $options : "/i"},
            artiste_name: {$regex: '.*' + artiste + '.*', $options : "/i"}
        }).toArray();
    }
    return [];
}

async function getMusics(client,ids) {
    const result = await client.db(database).collection("music_data").find({id : {$in : ids}}).toArray();
    return result;
}
