const app = require('./app');
const {retourPython, process, childPythonLaunch, getMusiqueSimilar, getRetour} = require('./python_call/pythonCall')

const server = app.listen(8089, () => {
    console.log(`Express s'exécute sur le port ` + server.address().port);
});

childPythonLaunch();
console.log(getMusiqueSimilar("2L93TdW2GMue1H2zlkt30F"));
console.log(getRetour());

console.log(retourPython);







