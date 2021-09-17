// nous créons une fonction qui contient toutes les routes
// ainsi, nous pouvons la lancer depuis le fichier app.js
exports.f = function(app, dossier) {

// affichage de la page index si on entre localhost/
    app.get('/', function(req, res) {
        res.render("index.ejs");
    });

// envoi des fichiers statiques si l'URL commence par "static"
    app.get(/static\/([a-z\.\/_-]+)$/i, function(req, res) {
        res.sendFile(dossier + '/static/' + req.params[0]);
    });

// affichage d'un message d'erreur pour n'importe quel autre URL
    app.get(/.*/, function(req, res) {
        res.end('Cette page n\'existe pas');
    });

}