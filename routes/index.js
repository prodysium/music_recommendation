const express = require ('express');
const {check, validationResult, Result} = require('express-validator');
const signup = require("../db_discuss/signup");
const noSQL = require("../db_discuss/noSQL");
const router = express.Router ();


//sur le path /login -> ouverture de la page de connexion
router.get ('/login', (req, res) => {
    res.render('login.ejs');

});

//sur le path /signup -> ouverture de la page d'inscription
router.get('/signup', (req, res) => {
    res.render('signup.ejs');
})

//retour de la page signup
router.post('/signup',[
    check('mail').isLength({ min: 1 }).withMessage('Please Enter a valid Mail'),
    check('mail').isEmail().withMessage('Email is not well formed'),

    check('pseudo').isLength({ min: 3 }).withMessage('Please Enter a valid Pseudo'),

    check('password').isLength({ min: 8 }).withMessage('Please Enter a valid Password'),

],(req,res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        console.log(errors.array());
        console.log(req.body);
        noSQL.connection(req.body.mail, req.body.pseudo, req.body.password).then();
        //noSQL.addUser(client, req.body.mail, req.body.pseudo, req.body.password);
        //noSQL.disconnection(client);

        //res.render('index.ejs');
        res.render('signup.ejs');

    } else {
        console.log(errors.array());
        let erreurs = [];
        if (!errors.isEmpty()) {
            for (const i of errors.array()) {
                erreurs[i] = i.msg;
            }
        }
        res.render('signup.ejs', {mes_erreurs : erreurs});
    }});

router.get("/favories",(req,res) => {
    res.render('profile.ejs', {page : "favories"});
});

router.get("/settings",(req,res) => {
    res.render('profile.ejs', {page : "settings"});
});

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