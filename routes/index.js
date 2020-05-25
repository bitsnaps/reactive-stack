var express = require('express');
var router = express.Router();
var Rx = require('rx');
const r = require('rethinkdb');


let connection;
r.connect({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 28015,
  db: process.env.DB_NAME ||'test'
})
    .then(conn => {
      connection = conn;
      // We set up a changefeed on "products" table
      return r.table('products').changes().run(connection);
    }).then(cursor => {
          cursor.each((err, row) => {
            if (err) throw err;
            const product = row.new_val;
            if (product)
              console.log(product.name+' changed.');
        })
    });

/* GET home page. */
router.get('/', async (req, res, next) => {
  // const products = await r.table('products')/*.orderBy(r.desc('date'))*/.run(connection)
  //     .then(cursor => cursor.toArray());
  // console.log(products);
  // res.render('index', { products: products });

  const products = await getProducts()
    .toPromise()
    .then(
      products => res.json(products),
      err => res.status(500).send(err.message)
    );

  // res.render('index', { products: products });
  res.send(products);
});

function getProducts() {
  return Rx.Observable.of(r.table('products')
    .orderBy(r.desc('date'))
    .run(connection)
    .then(cursor => cursor.toArray())
    );
}

/* Show the view to create a new product. */
// router.get('/new', (req, res, next) => {
//   res.render('new');
// });

/* Show the  product view. */
router.get('/product', (req, res, next) => {
  r.table('products')
    .get(req.query.id)
    .run(connection, function (err, product){
      if (err) throw err;
      // res.render('product', { product: product });
      res.json(product);
    });
});

/* Save a new product to the database */
// router.post('/new', async (req, res, next) => {
//     const product = {
//         name: req.body.name,
//         price: req.body.price,
//         date: new Date(),
//     };
//   r.table('products').insert(product).run(connection)
//       .then(() => res.redirect('/'));
// });

// router.post('/delete', async (req, res) => {
//   r.table('products')
//     .get(req.body.id)
//     .delete()
//     .run(connection)
//     .then(() => res.redirect('/'))
//     .catch( error => response.send( error ) );
// });

module.exports = router;
