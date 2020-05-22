var express = require('express');
var router = express.Router();
const r = require('rethinkdb');


let connection;
r.connect({host: process.env.DB_HOST || 'localhost', port: process.env.DB_PORT || 28015, db: process.env.DB_NAME ||'test'})
    .then(conn => {
      connection = conn;
    });

/* GET home page. */
router.get('/', async (req, res, next) => {
  const products = await r.table('products')/*.orderBy(r.desc('date'))*/.run(connection)
      .then(cursor => cursor.toArray());
  // console.log(products);
  res.render('index', { products: products });
});

/* Show the view to create a new product. */
router.get('/new', (req, res, next) => {
  res.render('new');
});

/* Show the  product view. */
router.get('/product', (req, res, next) => {
  r.table('products')
    .get(req.query.id)
    .run(connection, function (err, product){
      if (err) throw err;
      res.render('product', { product: product });
    });
});

/* Save a new product to the database */
router.post('/new', async (req, res, next) => {
    const product = {
        name: req.body.name,
        price: req.body.price,
        date: new Date(),
    };
  r.table('products').insert(product).run(connection)
      .then(() => res.redirect('/'));
});

router.post('/delete', async (req, res) => {
  r.table('products')
    .get(req.body.id)
    .delete()
    .run(connection)
    .then(() => res.redirect('/'))
    .catch( error => response.send( error ) );
});

module.exports = router;
