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

router.get('/delete', async (req, res, next) => {
  await r.table('products')
    .delete()
    .run(connection, (err, result) => {
      if (err) throw err;
      res.status(204).send()
    })
});

router.get('/create', async (req, res, next) => {
  const products = [
        {
          name: 'Smartphone Xiaomi Mi A1 dual Android one 7.1',
          price: 1199,
          image: 'https://images-americanas.b2w.io/produtos/01/00/sku/29296/2/29296259G1.jpg',
          stock: 0,
          stars: 0,
          totalReviews: 0,
          details: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
        },
        {
          name: 'Smartphone Moto G 5S Dual Chip Android 7.0',
          price: 929,
          image: 'https://images-americanas.b2w.io/produtos/01/00/item/132474/0/132474081G1.png',
          stock: 5,
          stars: 1.5,
          totalReviews: 11,
          details: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
        },
        {
          name: 'iPhone 8 Dourado 64GB Tela 4.7" IOS 11',
          price: 3949,
          image: 'https://images-americanas.b2w.io/produtos/01/00/item/132651/7/132651745G1.jpg',
          stock: 1,
          stars: 1,
          totalReviews: 2,
          details: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
        },
        {
          name: 'Smartphone Samsung Galaxy S7 Edge',
          price: 1943,
          image: 'https://images-americanas.b2w.io/produtos/01/00/item/125911/8/125911828G1.png',
          stock: 2,
          stars: 5,
          totalReviews: 310,
          details: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
        },
        {
          name: 'Smartphone Motorola Moto G6 Plus',
          price: 1699,
          image: 'https://images-americanas.b2w.io/produtos/01/00/item/133453/1/133453185G1.jpg',
          stock: 4,
          stars: 2.9,
          totalReviews: 42,
          details: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
        },
        {
          name: 'Smartphone Motorola Moto Z3 Play',
          price: 2999,
          image: 'https://images-submarino.b2w.io/produtos/01/00/item/133666/1/133666164G1.jpg',
          stock: 3,
          stars: 0.5,
          totalReviews: 1,
          details: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s',
        },
      ]

  await r.table('products')
    .insert(products)
    .run(connection, (err, result) => {
      if (err) throw err;
      res.status(200).json(result)
    })
});

module.exports = router;
