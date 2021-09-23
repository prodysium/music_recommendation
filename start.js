const app = require ('./app');

const server = app.listen (3000, () => {
    console.log(`Express s'exécute sur le port ` + server.address().port);
});