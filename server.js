const express = require('express');
const cors = require('cors');
const app = express();
const catalog = require('./catalogData');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/',function (req,res) {
    res.render('index');
});
app.get('/:id',function (req,res) {
    res.redirect('/');
});
app.get('/api/products', function (req, res) {

    res.status(200).send(catalog);
});

app.listen(3000);