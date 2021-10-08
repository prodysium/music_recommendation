const { MongoClient } = require('mongodb');
const {use} = require("express/lib/router");
const database = 'music_recommendation';

module.exports.request = request;

async function request(action = "",pseudo= "",mail= "",password= "",user_id = "",extra_data = "") {


    const uri = "mongodb://localhost:27017";

    const client = new MongoClient(uri);
    let retour = 0;


    try {
        // Connect to the MongoDB cluster
        await client.connect();

        console.log('tu est connecté');

        switch (action) {
            case "login" :
                console.log("une action de login est sollicitée");
                retour = await testLogin(client,pseudo,password);
                break;
            case "signup" :
                console.log("une action de sign up est sollicitée");
                retour = await createUser(client,pseudo,mail,password);
                break;
            case "pass_change" :
                console.log("une action de changement de mot de passe est sollicitée");
                retour = await changePassword(client,user_id,extra_data);
                break;
            case "pseudo_change" :
                console.log("une action de changement de pseudo est sollicitée");
                retour = await changePseudo(client,user_id,extra_data);
                break;
            case "mail_change" :
                console.log("une action de changement de mail est sollicitée");
                retour = await changeMail(client,user_id,extra_data);
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

async function getRandomUser(client){
    const result = await client.db(database).collection('users').findOne();
    console.log(result);
}

async function testLogin(client,pseudo,password) {
    let result = await client.db(database).collection('users').findOne({pseudo : pseudo});
    if (typeof (result) !== "undefined" && result.password === password) {

        return [0,result._id.toString()];

    }
    return [1];
}

async function testUser(client,mail = "",pseudo = "") {
    let result;
    if (mail !== "") {
        result = await client.db(database).collection('users').find({mail : mail});
    } else if (pseudo !== "") {
        result = await client.db(database).collection('users').find({pseudo: pseudo});
    }

    if (typeof(result) !== "undefined") {

        let val = await result.toArray();
        let i = 0;
        val.forEach((elem) => {
            i++;
            console.log(elem.pseudo);
            console.log(elem.email);
        });

        if (i > 1) {
            return [1];
        }
        return [0,result._id.toString()];
    }
    return [1];
    //console.log(result);
}

async function createUser(client,pseudo,mail,password) {
    let resultPseudo = await client.db(database).collection('users').findOne({pseudo : pseudo});
    let resultMail = await client.db(database).collection('users').findOne({pseudo : pseudo});

    if (resultPseudo === null && resultMail === null) {
        const result = await client.db(database).collection('users').insertOne({
            pseudo: pseudo,
            email: mail,
            password: password
        })
        return [0,result._id.toString()];
    }
    return [1];
}

async function changePassword(client,user_id,new_pass) {
    let resultUser = await client.db(database).collection("users").findOne({_id : user_id});

    if (resultUser) {
        const result = await client.db(database).collection("users").update({_id: user_id}, {$set: {password : new_pass}});
    }
    let resultPass = await client.db(database).collection('users').findOne({_id: user_id, password: new_pass});
    if (resultPass._id.toString() === user_id) {
        return 0;
    }
    return 1;
}

async function changePseudo(client,user_id,new_pseudo) {
    let resultUser = await client.db(database).collection("users").findOne({_id : user_id});

    if (resultUser) {
        const result = await client.db(database).collection("users").update({_id: user_id}, {$set: {pseudo : new_pseudo}});
    }
    let resultPass = await client.db(database).collection('users').findOne({_id: user_id, pseudo: new_pseudo});
    if (resultPass._id.toString() === user_id) {
        return 0;
    }
    return 1;
}

async function changeMail(client,user_id,new_mail) {
    let resultUser = await client.db(database).collection("users").findOne({_id : user_id});

    if (resultUser) {
        const result = await client.db(database).collection("users").update({_id: user_id}, {$set: {mail : new_mail}});
    }
    let resultPass = await client.db(database).collection('users').findOne({_id: user_id, mail: new_mail});
    if (resultPass._id.toString() === user_id) {
        return 0;
    }
    return 1;
}
