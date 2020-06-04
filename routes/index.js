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
      err => res.status(500).json(err.message)
    );

  // res.render('index', { products: products });
  // res.send(products);
});

function getProducts() {
  return Rx.Observable.of(r.table('products')
    .orderBy(r.desc('date'))
    .run(connection)
    .then(cursor => cursor.toArray())
  );
}

/* Show the  product view. */
router.get('/product', async (req, res, next) => {
  await r.table('products')
    .get(req.query.id)
    .run(connection, function (err, product){
      if (err) throw err;
      // dummy stock
      product.stock = Math.floor(Math.random()*10);
      // res.render('product', { product: product });
      res.json(product);
    });
});

/* Save products cart to the database */
router.post('/save', async (req, res, next) => {
  var cart = req.body.cart
  var products = [];
  cart.forEach( product => {
    products.push({
        id: product.id,
        date: new Date(),
        qte: 1
    });
  });

  await r.table('carts').insert(products).run(connection)
      .then(() => res.json(products));

  // r.table('carts').insert(cart).run(connection)
  //     .then(() => res.redirect('/'));
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

router.get('/carts', async (req, res, next) => {
  const carts = await getCarts()
    .toPromise()
    .then(
      carts => res.json(carts),
      err => res.status(500).json(err.message)
    );
});

function getCarts() {
  return Rx.Observable.of(r.table('carts')
    .orderBy(r.desc('date'))
    .run(connection)
    .then(cursor => cursor.toArray())
  );
}

router.delete('/carts/:id', async (req, res, next) => {
  console.log(req.params.id);
  // var id = '990bc097-3364-4add-a3b2-b44fc2a46334'// req.body.id
  var id = req.params.id
  await r.table('carts')
    .get(id)
    .delete()
    .run(connection, (err, result) => {
      if (err) throw err;
      res.status(204).send()
    })

});

module.exports = router;
