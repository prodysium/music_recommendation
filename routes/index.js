const express = require ('express');
const {check, validationResult, Result} = require('express-validator');
const router = express.Router ();
const request = require('../db_discuss/noSQL');


//sur le path /login -> ouverture de la page de connexion
router.get ('/login', (req, res) => {
    res.render('login.ejs');
});

router.post("/login", [
    check('pseudo').isLength({ min: 3 }).withMessage('pseudo invalid'),

    check('password').isLength({ min: 8 }).withMessage('password invalid'),
],(req,res) => {
    const errors = validationResult(req);
    let result = 1;
    if (errors.isEmpty()) {

        console.log(req.body);

        request.request("login",req.body.pseudo,"",req.body.password).then((value) => {
            result = value;
        if (result === 0) {
            res.render('profile.ejs', {page : "favories"});
        } else {
            res.render("login.ejs", {mes_erreurs: "pseudo-password unknown"});
        }
        });

    } else
{
    console.log(errors.array());
    let erreurs = [];
    if (!errors.isEmpty()) {
        for (const i of errors.array()) {
            erreurs[i] = i.msg;
        }
    }
    res.render('login.ejs', {mes_erreurs: erreurs});
}});


//sur le path /signup -> ouverture de la page d'inscription
router.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

//retour de la page signup
router.post('/signup',[
    check('mail').isLength({ min: 1 }).withMessage('mail invalid'),
    check('mail').isEmail().withMessage('mail not well formed'),

    check('pseudo').isLength({ min: 3 }).withMessage('pseudo invalid'),

    check('password').isLength({ min: 8 }).withMessage('password invalid'),

],(req,res) => {
    const errors = validationResult(req);
    let retour = 0;
    if (errors.isEmpty()) {
        console.log(errors.array());
        console.log(req.body);

        retour = request.request("signup",req.body.pseudo,req.body.mail,req.body.password).then();
        if (!retour) {
            res.render('profile.ejs', {page : "favories"});
        } else {
            res.render("signup.ejs", {mes_erreurs : "pseudo-mail already used"});
        }

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

router.post("/settings", (req,res) => {
    console.log(req.body);
    if (req.body.pass_change) {
        res.redirect("/change_pass");
    } else {
        res.redirect("/favories");
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