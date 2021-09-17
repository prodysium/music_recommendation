/* les fonctions byId() et byClass() permettent juste
de ne pas avoir besoin d'écrire "document.getElementById" et
"document.getElementsByClassName" à chaque fois qu'on les appelle */


function byId(id) {
    return document.getElementById(id);
}

function byClass(classe) {
    return document.getElementsByClassName(classe);
}
let socket = io();
//let socket = io.connect('http://localhost:8888/');

/* cette fonction est appelée lorsque un utilisateur qui est
sur un appareil mobile clique sur le toggle de la barre de navigation */
function navbar_mobile() {
    // si, lorsque la fonction est appelée, le contenu de la barre n'est pas affiché
    if (byId('contenu_nav').className === 'navbar-collapse collapse') {
        // on l'affiche
        byId('contenu_nav').className = 'navbar-collapse collapse in';
        byId('navbar').style.height = '100%';
        // à l'inverse
    } else {
        // on le cache
        byId('contenu_nav').className = 'navbar-collapse collapse';
        byId('navbar').style.height = '50px';
    }
}