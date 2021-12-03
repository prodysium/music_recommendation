const assert = require("assert");
const spawn = require('child_process').spawn;

let retourPython = "";
let launched = false;
let process;

module.exports.retourPython = retourPython;
module.exports.process = process;

module.exports.childPythonLaunch = async function childPythonLaunch() {
    process = spawn('python3.7',["/home/aafcjm/public_html/src/Main.py"]);

    process.stdout.on('data', function(data) {
        retourPython = "";
        if (data.toString() === "lancement Python") {
            console.log(data.toString());
            launched = true;
        } else {
            retourPython = data.toString();
        }

    });

    process.stderr.on('data', function(data) {
        console.log(data.toString());
    });
};

module.exports.getMusiqueSimilar = async function getMusiqueSimilar(musicId) {
    retourPython != "";
    process.stdin.write("getMusiqueSimilar:" + musicId + "\n");

};

module.exports.getRetour = async function getRetour() {
    await process.stdout.on('data', (data) => {
        retourPython = data.toString();
    })
    };



//getMusiqueSimilar("2L93TdW2GMue1H2zlkt30F");
