// comme dans le fichier routes.js, la fonction principale est lancée depuis app.js
// nous passons le paramètre io, qui contient le module socket.io, depuis app.js
exports.f = function(io) {

    /* cette fonction de callback s'exécute à chaque fois qu'un client
    émet l'événement "connection" */
    io.on('connection', function (socket) {

        /* lorsque le client effectue un socket.emit('bouton_client'),
        cette fonction s'exécute */
        socket.on('bouton_client', function(){
            console.log('Le client a cliqué sur le bouton !')
        });

    });

}