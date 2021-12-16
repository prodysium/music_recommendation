const assert = require("assert");
const spawn = require('child_process').spawn;

let retourPython = [];
let launched = false;
let process;

module.exports.retourPython = retourPython;

module.exports.launched = launched;

module.exports.childPythonLaunch = async function childPythonLaunch() {
    process = spawn('python3.7',["src/Main.py"]);

    process.stdout.on('data', function(data) {
        console.log('stdout triggered');

        console.log(data.toString());
        console.log("datas ajoutés childLaunchProcess");
        retourPython.push(data.toString());


    });

    process.stderr.on('data', function(data) {
        console.log(data.toString());
        process.kill('SIGINT');
        childPythonLaunch();

    });

};
module.exports.process = process;

module.exports.getMusiqueSimilar = function getMusiqueSimilar(musicId) {
    process.stdin.write("getMusiqueSimilar:" + musicId + "\n");

};

module.exports.getRetour = function getRetour() {
    process.stdout.on('data', function(data) {
        retourPython.push(data.toString());
    })
    return retourPython[retourPython.length - 1];
}



//getMusiqueSimilar("2L93TdW2GMue1H2zlkt30F");
