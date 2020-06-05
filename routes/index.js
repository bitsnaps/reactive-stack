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
      // return r.table('products').changes().run(connection);
    }).then(cursor => {
      /*
          cursor.each((err, row) => {
            if (err) throw err;
            const product = row.new_val;
            if (product)
              console.log(product.name+' changed.');
        })
        */
    });

/* GET home page. */
router.get('/', async (req, res, next) => {
  // const products = await r.table('products')/*.orderBy(r.desc('date'))*/.run(connection)
  //     .then(cursor => cursor.toArray());
  // console.log(products);
  // res.render('index', { products: products });

  return await getProducts()
    .toPromise()
    .then(
      products => res.json(products),
      err => res.status(500).json(err.message)
    );

  // res.render('index', { products: products });
  // res.send(products);
});

router.get('/search/:key?', async (req, res, next) => {
  return await getProducts( req.query.key )
    .toPromise()
    .then(
      products => res.json(products),
      err => res.status(500).json(err.message)
    );
});

// Query for a product
router.get('/product', async (req, res, next) => {
  return await getProduct(req.query.id)
    .toPromise()
    .then(
      product => res.json(product),
      err => res.status(500).json(err.message)
    );
});

// Add a product to a Cart
router.get('/cart/add', async (req, res, next) => {
  var qte = parseInt(req.query.qte) || 1;
  return await updateProduct(req.query.id,{
    // here you can use conditional update for better realtime experience
    stock: r.row('stock').add( - qte )
  }).toPromise()
  .then(
    product => res.json(product),
    err => res.status(500).json(err.message)
  );
});

// Remove a product from a Cart
router.get('/cart/remove', async (req, res, next) => {
  return await updateProduct(req.query.id,{
    stock: r.row('stock').add( parseInt(req.query.qte) )
  }).toPromise()
  .then(
    product => res.json(product),
    err => res.status(500).json(err.message)
  );
});

/* Save products cart to the database */
router.post('/save', async (req, res, next) => {
  var products = [];
  var total = 0.0
  req.body.cart.forEach( product => {
    products.push({
        id: product.id,
        qte: product.quantity
    });
    // just for test (it shouldn't be persistent anyway)
    total += parseInt(product.quantity) * parseFloat(product.price)
  });
  var cart = {
    date: new Date(),
    products: products,
    total: total,
    status: 'Pending'
  }

  return await r.table('carts').insert(cart).run(connection)
      .then(() => res.json(cart));

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
  await getCarts()
    .toPromise()
    .then(
      jsonCarts => res.json(jsonCarts),
      err => res.status(500).json(err.message)
    );
});

//  Update Cart Status
router.post('/carts/checkout', async (req, res, next) => {
  var id = req.body.id
  await r.table('carts')
    .get(id)
    .update({
      status: 'Completed'
    }, {
      returnChanges: true
    })
    .run(connection, (err, result) => {
      if (err) throw err;
      res.json(result)
    })
});

router.post('/carts/cancel', async (req, res, next) => {
  var id = req.body.id
  await r.table('carts')
    .get(id)
    .update({
      status: 'Pending'
    }, {
      returnChanges: true
    })
    .run(connection, (err, result) => {
      if (err) throw err;
      res.json(result)
    })
});

// Create a product
router.post('/product/create', async (req, res, next) => {
  await r.table('products')
    .insert(req.body)
    .run(connection, (err, result) => {
      if (err) throw err;
      res.status(204).send()
    })
});

// Delete a product by id
router.post('/product/delete', async (req, res, next) => {
  await r.table('products')
    .get(req.body.id)
    .delete()
    .run(connection, (err, result) => {
      if (err) throw err;
      res.status(204).send()
    })
});


router.delete('/carts/:id', async (req, res, next) => {
  var id = req.params.id
  await r.table('carts')
    .get(id)
    .delete()
    .run(connection, (err, result) => {
      if (err) throw err;
      res.status(204).send()
    })
});

// delete all products (dummy)
router.get('/delete', async (req, res, next) => {
  await r.table('products')
    .delete()
    .run(connection, (err, result) => {
      if (err) throw err;
      res.status(204).send()
    })
});

// Create some products (dummy)
router.get('/create', async (req, res, next) => {
  const products = [
        {
          name: 'Smartphone Xiaomi Mi A1 dual Android one 7.1',
          price: 1199,
          image: 'https://images-americanas.b2w.io/produtos/01/00/sku/29296/2/29296259G1.jpg',
          stock: 3,
          stars: 0,
          totalReviews: 0,
          details: 'As powerful as it is beautiful, 2 cameras, 1 perfect portrait. 12MP＋12MP wide-angle/telephoto, 2x optical zoom, 1.25µm large pixels.',
        },
        {
          name: 'Smartphone Moto G 5S Dual Chip Android 7.0',
          price: 929,
          image: 'https://images-americanas.b2w.io/produtos/01/00/item/132474/0/132474081G1.png',
          stock: 0,
          stars: 1.5,
          totalReviews: 11,
          details: 'Moto G (5th Gen) G5 - 4G LTE Dual Sim XT1671 32GB FingerPrint Octa-core Factory Unlocked Smartphone International Version - (Gold)',
        },
        {
          name: 'iPhone 8 Dourado 64GB Tela 4.7" IOS 11',
          price: 3949,
          image: 'https://images-americanas.b2w.io/produtos/01/00/item/132651/7/132651745G1.jpg',
          stock: 1,
          stars: 1,
          totalReviews: 2,
          details: 'IP67 water and dust resistant (maximum depth of 1 meter up to 30 minutes), 12MP camera with OIS and 4K video, 7MP FaceTime HD camera with Retina Flash.',
        },
        {
          name: 'Smartphone Samsung Galaxy S7 Edge',
          price: 1943,
          image: 'https://images-americanas.b2w.io/produtos/01/00/item/125911/8/125911828G1.png',
          stock: 2,
          stars: 5,
          totalReviews: 310,
          details: 'Beautifully designed inside and out, the Samsung Galaxy S7 edge exceeds your expectations. The slim dual-edge design ensures a great fit and feel whether in your hands or your pocket.',
        },
        {
          name: 'Smartphone Motorola Moto G6 Plus',
          price: 1699,
          image: 'https://images-americanas.b2w.io/produtos/01/00/item/133453/1/133453185G1.jpg',
          stock: 4,
          stars: 2.9,
          totalReviews: 42,
          details: 'he Motorola Moto G6 Plus is a good Android smartphone , great for photos, that can satisfy even the most demanding of users.',
        },
        {
          name: 'Smartphone Motorola Moto Z3 Play',
          price: 2999,
          image: 'https://images-submarino.b2w.io/produtos/01/00/item/133666/1/133666164G1.jpg',
          stock: 3,
          stars: 0.5,
          totalReviews: 1,
          details: "Smartphone + much more: it's time for something more than a smartphone, The moto z3 play brings features that go far beyond today's smartphones.",
        },
      ]

  await r.table('products')
    .insert(products)
    .run(connection, (err, result) => {
      if (err) throw err;
      res.status(200).json(result)
    })
});


/* Rx Queries */

function getProducts(key = '') {
    return Rx.Observable.of(r.table('products')
      .filter(function(product){
        return product('name').match(`(?i)${key}`)
      })
      .orderBy(r.desc('date'))
      .run(connection)
      .then(cursor => cursor.toArray())
    );
}

function getProduct(id) {
  return Rx.Observable.of(r.table('products')
    .get(id)
    .run(connection)
    .then(product => product)
  );
}

function updateProduct(id, values) {
  return Rx.Observable.of(r.table('products')
    .get(id)
    .update(values, {
      returnChanges: true
    })
    .run(connection)
    .then(product => product)
  );
}

function getCarts() {
  return Rx.Observable.of(r.table('carts')
    .orderBy(r.desc('date'))
    .run(connection)
    .then(cursor => cursor.toArray())
  );
}

module.exports = router;
