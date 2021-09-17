let http = require('http');
let path = require('path');
let express = require('express');

// nous faisons appel à expressJS en tapant app.nom_de_la_fonction()
let app = express();
let server = http.createServer(app);


let routes = require('./serveur/routes.js');
let socket = require('./serveur/socket.js');
const {Server} = require("socket.io");
let io = new Server(server);
// appel de la fonction qui se trouve dans "routes.js"
routes.f(app, __dirname);
// appel de la fonction qui se trouve dans "socket.js"
socket.f(io);

server.listen(8888);