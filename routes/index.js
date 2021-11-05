const express = require ('express');
const {check, validationResult, Result} = require('express-validator');
const router = express.Router ();
const request_user = require('../db_discuss/noSQL_users');
const request_data = require('../db_discuss/noSQL_user_data');
const request_music = require('../db_discuss/noSQL_music');

//sur le path /login -> ouverture de la page de connexion
router.get ('/login', (req, res) => {
    res.clearCookie("utilisateur");
    res.render('login.ejs');
});

//sur le path /signup -> ouverture de la page d'inscription
router.get('/signup', (req, res) => {
    res.clearCookie("utilisateur");
    res.render('signup.ejs');
});

router.get("/testPY",(req,res) => {

    const { exec } = require('child_process');
    let fichierEtArgs = 'C:\\Users\\jonas\\AppData\\Local\\Programs\\Python\\Python38-32\\python.exe recommandationparvoisinetcontenue.py "Si Vos QuerésµYerba Brava"';
    exec(fichierEtArgs, (err, stdout, stderr) => {
        if (err) {
            console.error(err);

        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);

        }
        console.log(stdout);
    });


    res.redirect("/login");
});


//retour de la page login quand l'utilisateur essaye de se connecter
router.post("/login", [
    check('pseudo').isLength({ min: 3 }).withMessage('pseudo invalid'),

    check('password').isLength({ min: 8 }).withMessage('password invalid'),
],(req,res) => {
    res.clearCookie("utilisateur");
    const errors = validationResult(req);
    let result = [1];
    if (errors.isEmpty()) {

        request_user.request("login",req.body.pseudo,"",req.body.password).then((value) => {
            result = value;
        if (result[0] === 0) {
            res.cookie("utilisateur",result[1],{maxAge:3600 * 1000});
            res.redirect("/favories");
        } else {
            res.render("login.ejs", {mes_erreurs: "pseudo-password unknown"});
        }
        });

    } else
{
    let erreurs = [];
    if (!errors.isEmpty()) {
        for (const i of errors.array()) {
            erreurs[i] = i.msg;
        }
    }
    res.render('login.ejs', {mes_erreurs: erreurs});
}});

//retour de la page signup quand un utilisateur essaye de creer un compte
router.post('/signup',[
    check('mail').isLength({ min: 1 }).withMessage('mail invalid'),
    check('mail').isEmail().withMessage('mail not well formed'),

    check('pseudo').isLength({ min: 3 }).withMessage('pseudo invalid'),

    check('password').isLength({ min: 8 }).withMessage('password invalid'),

],(req,res) => {
    res.clearCookie("utilisateur");
    const errors = validationResult(req);
    let retour = [0];
    if (errors.isEmpty()) {

        request_user.request("signup",req.body.pseudo,req.body.mail,req.body.password).then((retour) => {
            if (!retour[0]) {
                res.cookie("utilisateur",retour[1],{maxAge:3600 * 1000});
                res.render('profile.ejs', {page : "favories"});
            } else {
                res.render("signup.ejs", {mes_erreurs : "pseudo-mail already used"});
            }});
    } else {
        let erreurs = [];
        if (!errors.isEmpty()) {
            for (const i of errors.array()) {
                erreurs[i] = i.msg;
            }
        }
        res.render('signup.ejs', {mes_erreurs : erreurs});
    }});


//quand un utilisateur va sur la page des favoris, la page par défaut quand on se connecte
router.get("/favories", (req, res) => {
    if (typeof (req.headers.cookie) === "undefined") {
        res.redirect("/login");
    }
    let header = req.headers;
    let reqCookies = req.headers.cookie.split(";");
    let cookieUser = "";
    for (let i = 0; i < reqCookies.length; i++) {
        if (reqCookies[i].startsWith("utilisateur")) {
            let results = reqCookies[i].split("=");
            cookieUser = results[1];
        }
    }
    request_data.request("get_data", cookieUser).then((result) => {
        request_music.request("get_musics", "", "", result.favories).then((values) => {
            res.render('profile.ejs', {
                page: "favories",
                user_datas: values
            });
        });
    });
});

//affiche la page settings
router.get("/settings",(req,res) => {
    res.render('profile.ejs', {page : "settings"});
});

//affiche la page de recherche de musique
router.get("/search",(req,res) => {
    res.render('profile.ejs', {page : "search"});
});


//retour de la page favories
router.post("/favories",(req,res) => {
    if (typeof (req.headers.cookie) === "undefined") {
        res.redirect("/login");
    }
    let reqCookies = req.headers.cookie.split(";");
    let cookieUser = "";
    for (let i = 0; i < reqCookies.length; i++) {
        if (reqCookies[i].startsWith("utilisateur")) {
            let results = reqCookies[i].split("=");
            cookieUser = results[1];
        }
    }

    request_data.request("del_data",cookieUser,req.body.id_fav).then((val) => {
        request_data.request("get_data", cookieUser).then((result) => {
            request_music.request("get_musics", "", "", result.favories).then((values) => {
                res.render('profile.ejs', {
                    page: "favories",
                    user_datas: values
                });
            });
        });


    });
});


//retour de la page search
router.post("/search",(req,res) => {
    if (typeof (req.headers.cookie) === "undefined") {
        res.redirect("/login");
    }
    let reqCookies = req.headers.cookie.split(";");
    let cookieUser = "";
    for (let i = 0; i < reqCookies.length; i++) {
        if (reqCookies[i].startsWith("utilisateur")) {
            let results = reqCookies[i].split("=");
            cookieUser = results[1];
        }
    }
    console.log(req.body);
    if(typeof(req.body.id_fav) !== undefined && req.body.action === "add") {
        request_data.request("add_data",cookieUser,req.body.id_fav).then();
    } else {
        request_data.request("del_data",cookieUser,req.body.id_fav).then();
    }
    let user_datas = null;

    request_data.request("get_data",cookieUser).then((value) => {
        user_datas = value;
    })

    request_music.request("search_music",req.body.artist_search, req.body.title_search).then((result) => {

        let datas = [];
        if (user_datas !== null) {
            for (let i = 0; i < result.length; i++) {
                if (user_datas !== 1 && user_datas.favories.includes(result[i].id)) {
                    datas[i] = true;
                } else {
                    datas[i] = false;
                }
            }
        }

        res.render('profile.ejs', {
            page : "search",
            titre : req.body.title_search,
            artiste : req.body.artist_search,
            result : result,
            user_datas : datas
        });
    });
});

//retour de la page settings, on change les paramètres qui sont changés
router.post("/settings", (req,res) => {
    if (typeof (req.headers.cookie) === "undefined") {
        res.redirect("/login");
    }
    let reqCookies = req.headers.cookie.split(";");
    let cookieUser = "";
    for (let i = 0; i < reqCookies.length; i++) {
        if (reqCookies[i].startsWith("utilisateur")) {
            let results = reqCookies[i].split("=");
            cookieUser = results[1];
        }
    }

    if (req.body.infos_change) {
        request_user.request("infos_change", "","","",cookieUser,[req.body.age,req.body.sexe,req.body.departement,req.body.pays]).then((value) => {
            if(!value) {
                res.render("profile.ejs", {page : "settings"});
            }
            res.render("profile.ejs", {page : "settings",mes_erreurs : "db exec problem"});
        });

    } else if (req.body.pass_change) {
        res.redirect("/change_pass");
    } else if (req.body.pseudo_change) {
            if (req.body.pseudo.length < 3) {
                res.render("profile.ejs", {page : "settings",mes_erreurs : "pseudo invalid"});
            } else {
                request_user.request("pseudo_change","","","",cookieUser,req.body.pseudo).then((value) =>{
                    if(!value) {
                        res.render("profile.ejs", {page : "settings"});
                    }
                 res.render("profile.ejs", {page : "settings",mes_erreurs : "db exec problem"});
             });
            }
        } else if (req.body.mail_change) {
            if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.mail))) {
                res.render("profile.ejs", {page : "settings",mes_erreurs : "mail invalid"});
            } else {
                request_user.request("mail_change","","","",cookieUser,req.body.mail).then((value) => {
                    if(!value) {
                        res.render("profile.ejs", {page : "settings"});
                    }
                    res.render("profile.ejs", {page : "settings", mes_erreurs : "db exec problem"});
                });
            }
        }
})

router.get("/change_pass", (req,res) => {
    res.render('password_change_profile.ejs')

})


/*
router.post("/",[
    check('firstName')
        .isLength({ min: 1 })
        .withMessage('Please enter a name'),
    check('lastName')
        .isLength({ min: 1 })
        .withMessage('Please enter a lastName'),
],(req,res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        res.render('index2.ejs',{user: undefined});
    } else {
        console.log(req.body);
        console.log(errors);
        res.render('index2.ejs', {user: "erreur ! pas de saisie suffisante"});
    }});

router.get ('/2', (req, res) => {
    res.render('index2.ejs');

});

router.get('/login',
    (req,res) => {
    res.render('login.ejs');
    })

router.post('/2',[
    check('firstName')
        .isLength({ min: 1 })
        .withMessage('Please enter a name'),
    check('lastName')
        .isLength({ min: 1 })
        .withMessage('Please enter a lastName'),
],(req,res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        res.render('index2.ejs',{user: undefined});
    } else {
        console.log(req.body);
        console.log(errors);
        res.render('index2.ejs', {user: "erreur ! pas de saisie suffisante"});
    }});

router.post("/login",[
    check('firstName')
        .isLength({ min: 1 })
        .withMessage('Please enter a name'),
    check('lastName')
        .isLength({ min: 1 })
        .withMessage('Please enter a lastName'),
],(req,res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        res.render('login.ejs',{user: undefined});
    } else {
        console.log(req.body);
        console.log(errors);
        res.render('login.ejs',{user: "erreur ! pas de saisie suffisante"});
    }

});
*/


module.exports = router;