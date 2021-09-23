const express = require ('express');
const {check, validationResult} = require('express-validator');

const router = express.Router ();

router.get ('/', (req, res) => {
    res.render('index2.ejs');

});

router.post('/',[
    check('firstName')
        .isLength({ min: 1 })
        .withMessage('Please enter a name'),
    check('lastName')
        .isLength({ min: 1 })
        .withMessage('Please enter a lastName'),
],(req,res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        res.send('Merci pour votre inscription!');
    } else {
        console.log(req.body);
        res.render('index2.ejs');
    }
});



module.exports = router;