const express = require ('express');
const {check, validationResult, Result} = require('express-validator');
const router = express.Router ();
const request_user = require('../db_discuss/noSQL_users');
const request_data = require('../db_discuss/noSQL_user_data');
const request_music = require('../db_discuss/noSQL_music');


//======================================================================================================================
//router.get

//--------------------------------------------------
//sur le path /login -> ouverture de la page de connexion
router.get('/login', (req, res) => {
    res.clearCookie("utilisateur");
    res.render('login.ejs');
});

//--------------------------------------------------
//sur le path /signup -> ouverture de la page d'inscription
router.get('/signup', (req, res) => {
    res.clearCookie("utilisateur");
    res.render('signup.ejs');
});

//--------------------------------------------------
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

//--------------------------------------------------
//affiche la page settings
router.get("/settings", (req, res) => {
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
    request_user.request("get_user_info", '', '', '', cookieUser).then((result) => {
        res.render('profile.ejs', {
            user_datas:result[1],
            page: "settings"
        });

    });
});

//--------------------------------------------------
//affiche la page de changement de mot de passe
router.get("/password", (req, res) => {
    if (typeof (req.headers.cookie) === "undefined") {
        res.redirect("/login");
    }
    res.render('password_change_profile.ejs');
});

//--------------------------------------------------
//affiche la page de recherche de musique
router.get("/search", (req, res) => {
    if (typeof (req.headers.cookie) === "undefined") {
        res.redirect("/login");
    }
    res.render('profile.ejs', {
        page: "search"
    });
});

//--------------------------------------------------
//affiche la page de recommendation de musique
router.get("/recommendation", (req, res) => {
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
            res.render('recommendation.ejs', {
                user_recoms: values
            });
        });
    });
});

//--------------------------------------------------
router.get("/testPY", (req, res) => {
    const {exec} = require('child_process');
    let fichierEtArgs = 'python3.7'
        + ' recommandationparvoisinetcontenue.py "Si Vos QuerésµYerba Brava"';
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


//======================================================================================================================
//router.post

//--------------------------------------------------
//retour de la page login quand l'utilisateur essaye de se connecter
router.post("/login", [
    check('pseudo').isLength({min: 3}).withMessage('pseudo_size'),
], (req, res) => {
    res.clearCookie("utilisateur");
    const errors = validationResult(req);
    let result = [1];
    if (errors.isEmpty()) {
        request_user.request("login", req.body.pseudo, "", req.body.password).then((value) => {
            result = value;
            if (result[0] === 0) {
                res.cookie("utilisateur", result[1], {
                    maxAge: 3600 * 1000
                });
                res.redirect("/favories");
            } else {
                res.render("login.ejs", {
                    error_list: [
                        "unknown"
                    ],
                    data_list: [
                        req.body.pseudo
                    ]
                });
            }
        });
    } else {
        let erreurs = [];
        if (!errors.isEmpty()) {
            console.log(errors);
            for (const i of errors.array()) {
                erreurs.push(i.msg);
            }
        }
        res.render('login.ejs', {
            error_list: erreurs,
            data_list: [
                req.body.pseudo
            ]
        });
    }
});

//--------------------------------------------------
//retour de la page signup quand un utilisateur essaye de creer un compte
router.post('/signup', [
    check('mail').isLength({min: 1}).withMessage('mail invalid'),
    check('mail').isEmail().withMessage('mail not well formed'),

    check('pseudo').isLength({min: 3}).withMessage('pseudo invalid'),

], (req, res) => {
    res.clearCookie("utilisateur");
    const errors = validationResult(req);
    let retour = [0];
    if (errors.isEmpty()) {
        request_user.request("signup", req.body.pseudo, req.body.mail, req.body.password).then((retour) => {
            if (!retour[0]) {
                res.cookie("utilisateur", retour[1], {maxAge: 3600 * 1000});
                res.render('profile.ejs', {
                    page: "favories"
                });
            } else {
                res.render("signup.ejs", {
                    error_list: [
                        "pseudo-mail already used"
                    ]
                });
            }
        });
    } else {
        let erreurs = [];
        if (!errors.isEmpty()) {
            for (const i of errors.array()) {
                erreurs[i] = i.msg;
            }
        }
        res.render('signup.ejs', {
            error_list: erreurs
        });
    }
});

//--------------------------------------------------
//retour de la page favories
router.post("/favories", (req, res) => {
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
    request_data.request("del_data", cookieUser, req.body.id_fav).then((val) => {
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

//--------------------------------------------------
//retour de la page search
router.post("/search", (req, res) => {
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
    if (typeof (req.body.id_fav) !== undefined && req.body.action === "add") {
        request_data.request("add_data", cookieUser, req.body.id_fav).then((value) => {
            endPostSearch(req, res, cookieUser);
        });
    } else {
        request_data.request("del_data", cookieUser, req.body.id_fav).then((value) => {
            endPostSearch(req, res, cookieUser);
        });
    }
});
//fin de retour de la page search
function endPostSearch(req, res, cookieUser) {

    let user_datas = null;
    request_data.request("get_data", cookieUser).then((value) => {
        user_datas = value;

        request_music.request("search_music", req.body.artist_search, req.body.title_search).then((result) => {
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
                page: "search",
                titre: req.body.title_search,
                artiste: req.body.artist_search,
                result: result,
                user_datas: datas
            });
        });
    });
}

//--------------------------------------------------
//retour de la page settings, on change les paramètres qui sont changés
router.post("/settings", (req, res) => {
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
        request_user.request("infos_change", "", "", "", cookieUser, [req.body.age, req.body.sexe, req.body.departement, req.body.pays]).then((value) => {
            if (!value) {
                request_user.request("get_user_info", '', '', '', cookieUser).then((result) => {
                    res.render('profile.ejs', {
                        user_datas: result[1],
                        page: "settings"
                    });
                });
            } else {
                request_user.request("get_user_info", '', '', '', cookieUser).then((result) => {
                    res.render('profile.ejs', {
                        user_datas: result[1],
                        page: "settings",
                        error_list: [
                            "db exec problem"
                        ]
                    });
                });
            }
        });
    } else if (req.body.pass_change) {
        res.redirect("/password");
    } else if (req.body.pseudo_change) {
        if (req.body.pseudo.length < 3) {
            request_user.request("get_user_info", '', '', '', cookieUser).then((result) => {
                res.render('profile.ejs', {
                    user_datas: result[1],
                    page: "settings",
                    error_list: [
                        "pseudo invalid"
                    ]
                });
            });
        } else {
            request_user.request("pseudo_change", "", "", "", cookieUser, req.body.pseudo).then((value) => {
                if (!value) {
                    request_user.request("get_user_info", '', '', '', cookieUser).then((result) => {
                        res.render('profile.ejs', {
                            user_datas: result[1],
                            page: "settings"
                        });
                    });
                } else {
                    request_user.request("get_user_info", '', '', '', cookieUser).then((result) => {
                        res.render('profile.ejs', {
                            user_datas: result[1],
                            page: "settings",
                            error_list: [
                                "db exec problem"
                            ]
                        });
                    });
                }
            });
        }
    } else if (req.body.mail_change) {
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.mail))) {
            request_user.request("get_user_info", '', '', '', cookieUser).then((result) => {
                res.render('profile.ejs', {
                    user_datas: result[1],
                    page: "settings",
                    error_list: [
                        "mail invalid"
                    ]
                });
            });
        } else {
            request_user.request("mail_change", "", "", "", cookieUser, req.body.mail).then((value) => {
                if (!value) {
                    request_user.request("get_user_info", '', '', '', cookieUser).then((result) => {
                        res.render('profile.ejs', {
                            user_datas: result[1],
                            page: "settings"
                        });
                    });
                } else {
                    request_user.request("get_user_info", '', '', '', cookieUser).then((result) => {
                        res.render('profile.ejs', {
                            user_datas: result[1],
                            page: "settings",
                            error_list: [
                                "db exec problem"
                            ]
                        });
                    });
                }
            });
        }
    }
});

//--------------------------------------------------
//retour de la page de changement de mot de passe
router.post("/password", (req, res) => {
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
    if (req.body.password !== "" && req.body.password.length >= 8) {
        request_user.request("pass_change",'','','',cookieUser,req.body.password).then((value ) => {
            if (!value) {
                res.redirect("/settings");
            } else {
                res.render("password_change_profile.ejs", {
                    error_list: [
                        "pass_change_error"
                    ]
                });
            }
        });
    } else {
        res.render("password_change_profile.ejs", {
            error_list: [
                "pass_change_error"
            ]
        });
    }

});


module.exports = router;


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