<template>
  <div id="app">
    <div class="reveal">
      <div class="slides">
        <section id="main">

          <!-- navbar header -->
          <header class="header">
            <nav class="nav">
              <ul class="nav-links">
                <li class="link">
                  <a href="/admin">Administration</a>
                </li>
                <li class="link">
                  <a href="#" @click="toggleCart">Cart {{ this.cartIsEmpty() ?'': `(${this.getCartTotalCount()})` }}</a>
                </li>
              </ul>
            </nav>
            <slot></slot>
          </header>

          <!-- main product list -->
          <ul class="product-list list card-container">
            <li v-for="(product, index) in this.products" :key="index" class="product">
                <span class="product-image">
                  <img :id="'img-'+product.id" :src="product.image" @error="loadThumbnail(product.id)" alt="" width="140px">
                </span>
                <div class="product-box">
                  <span class="product-name">
                    {{ product.name }}
                  </span>
                  <div class="product-price text-large">
                    <span>$ {{ product.price }}, 00 (Qte: {{ product.stock}})</span>
                  </div>
                  <span class="product-details">
                    {{ product.details }}
                  </span>
                  <div class="button-actions">
                    <button :class="'btn btn-large btn-'+(productAvailable(product)?'success':'danger')"
                      @click="addProduct(product)">
                      {{ productAvailable(product)?'Add to Cart':'Out of Stock!' }}
                    </button>
                    <!-- <button class="btn btn-large btn-info" @click="addFavorites(product)">
                      add to favorits
                    </button> -->
                  </div>
                </div>

            </li>
          </ul>

          <!-- modal dialog -->
          <transition name="fade">
            <div class="modal" v-show="dialog">
              <h5>Details</h5>
              <span v-if="this.cartIsEmpty()">
                Your Cart is Empty!
              </span>
              <div class="product-list" v-if="!this.cartIsEmpty()">
                <table class="product-table-cart">
                  <tbody>
                    <tr v-for="(product, index) in this.cart" :key="index" class="product-cart">
                      <td>{{ product.name }}</td>
                      <td>{{ product.quantity }} X {{ product.price }}</td>
                      <td><strong>{{ (product.quantity * product.price) }}</strong></td>
                      <td><a href="#" @click="removeProduct(product)">Remove</a> </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="text-large">
                      <td colspan="2" class="pull-right">Total:</td>
                      <td><strong>{{ this.getCartTotal() }}</strong></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>

              </div>
              <div class="button-actions">
                <button class="btn btn-large btn-danger" @click="toggleCart">
                  Close
                </button>
              </div>
            </div>
          </transition>

        </section><!-- #main -->

        <section>

          <section id="cart">
            <div v-if="this.cartIsEmpty()">
              <h1>Your Cart is Empty</h1>
              <a href="#" @click="moveLeft()">back to Home</a>
              <!-- <br>
              <a href="#" @click="goBack()">Go Back</a> -->
            </div>
            <div class="product-table text-small" v-if="!this.cartIsEmpty()">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qte</th>
                    <th>Total</th>
                    <th>Availability</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(product, index) in this.cart" :key="index" class="product">
                    <td>{{ product.name }}</td>
                    <td>{{ product.price }}</td>
                    <td>{{ product.quantity }}</td>
                    <td>{{ product.quantity * product.price }}</td>
                    <td>{{ product.stock > 0? 'Availabile':'Out of Stock!' }}</td>
                    <td> <button class="btn btn-small btn-danger" @click="removeProduct(product)">X</button> </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td class="pull-right" colspan="3">Total:</td>
                    <td><strong>{{ this.getCartTotal() }}</strong></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              <div class="button-actions" style="position: absolute;bottom: -25px;right: 140px;">
                <button class="btn btn-large btn-info" @click="saveCart">Save</button>
              </div>
            </div>

          </section><!-- #cart -->

          <section id="checkout">
            <div v-if="this.carts.length == 0">
              <h1>You do not have history</h1>
              <a href="#" @click="goBack()">Go Back</a>
            </div>
            <div class="cart-table text-small" v-if="this.carts.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Nbr of Products</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(cart, index) in this.carts" :key="index" class="cart">
                    <td>{{ new Date(Date.parse(cart.date)).toLocaleString() }}</td>
                    <td>{{ cart.products.length }}</td>
                    <td>{{ cart.total }}</td>
                    <td>{{ cart.status }}</td>
                    <td><a href="#" v-if="cart.status==='Pending'" @click="checkoutCart(cart)">Checkout</a></td>
                    <td><a href="#" v-if="cart.status==='Completed'" @click="cancelCart(cart)">Cancel</a></td>
                    <td><a href="#" @click="deleteCart(cart)">Delete</a></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" class="pull-right">Total:</td>
                    <td><strong>{{ this.getTotalCarts() }}</strong></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </section><!-- #checkout -->

          <section id="confirmed">
            <div v-if="this.carts.length > 0">
              <h1>Thank you for your purchase!</h1>
              <p>You have {{ this.totalCompletedCarts() }} Completed Cart.</p>
              <a href="#" @click="goBack()">Go Back</a>
            </div>
          </section><!-- #confirmed -->

        </section>

      </div>
    </div>
  </div>
</template>

<script>
import Reveal from 'reveal.js/dist/reveal'
var Rx = require('rx')
// import { interval } from 'rxjs'
var Observable = Rx.Observable

const URL_ENDPOINT = 'http://localhost:3000/api'

export default {
  name: 'app',
  components: {
  },
  data (){
    return {
      // counter: Number,
      products: [],
      cart: [],
      carts: [],
      // favorites: [],
      dialog: false,
      selection: 1,
      cartDetails: Object
    }
  },
  subscriptions: function () {
    return {
      // counter: interval(800),
    }
  },
  components: {
    // HelloWorld
  },
  methods: {
    removeProduct(product) {
      var index = this.cart.indexOf(product)
      if (index >= 0){
        // update stock
        this.updateStock(product)
        // remove the the product
        this.cart.splice(index, 1)
      }
    },
    updateStock(product){
      this.$http.get(URL_ENDPOINT+'/cart/remove?id='+product.id+'&qte='+product.quantity).then(response => {
        var new_val = response.body.changes[0].new_val
        if (new_val.stock > 0){
          product.stock = new_val.stock
        } else {
          console.log(`Product: ${product.id} Out of Stock!`)
        }
      }, response => {
            console.log('Error: ', response)
      }).catch(error => {
          console.log(error)
      })
    },
    addProduct(product) {
      var qte = 1
      // check for stock availability (can be done on the server side for better experience)
      if (!this.productAvailable(product)){
        alert('Product Out of Stock!')
        return
      }
      this.$http.get(URL_ENDPOINT+'/cart/add?id='+product.id+ '&qte='+qte).then(response => {
        var new_val = response.body.changes[0].new_val
        // get current stock
        product.stock = new_val.stock
        // too late! we do not check current stock here coz it's already decremented

        // if new product add it to the Cart with Qte = 1
        if (!this.productInCart(product)){
          product.quantity = qte
          this.cart.push(product)
        } else {
          // otherwise increment qte
          product.quantity += qte
          var item = this.cart.find(item => item.id == product.id)
          item.quantity = product.quantity
          item.stock = product.stock
        }
      }, response => {
            console.log('Error: ', response)
      }).catch(error => {
          console.log(error)
      })
    },
    // addFavorites(product) {
    //   this.favorites.push(product);
    // },
    toggleCart(){
      this.dialog = !this.dialog
    },
    productInCart(product){
      return this.cart.indexOf(product) >= 0
    },
    cartIsEmpty(){
      return this.cart.length == 0
    },
    getCartTotalCount(){
      var qte = 0
      return this.cart
        .map( p => qte += parseInt(p.quantity) )
        .reduce(p => qte)
    },
    getCartTotal(){
      var total = 0
      return this.cart
        .map( p => total += parseFloat(p.price) * parseFloat(p.quantity) )
        .reduce(p => total)
    },
    getTotalCarts(){
      var total = 0
      return this.carts
        .map( cart => total += parseFloat(cart.total) )
        .reduce(() => total)
    },
    checkoutCart(cart){
      this.$http.post(URL_ENDPOINT+'/carts/checkout', {
        id: cart.id
      }).then(response => {
        if (response.body.changes.length > 0){
          var new_cart = response.body.changes[0].new_val
          cart.status = new_cart.status
          Reveal.down();
        }
      }, response => {
          console.log('Error: ', response)
      }).catch(error => {
        console.log(error)
      });
    },
    cancelCart(cart){
      this.$http.post(URL_ENDPOINT+'/carts/cancel', {
        id: cart.id
      }).then(response => {
        if (response.body.changes.length > 0){
          var new_cart = response.body.changes[0].new_val
          cart.status = new_cart.status
        }
      }, response => {
          console.log('Error: ', response)
      }).catch(error => {
        console.log(error)
      });

    },
    deleteCart(cart){
      if (confirm('Do you want to delete this Cart ?')){
        this.$http.delete(URL_ENDPOINT+ '/carts/'+ cart.id)
        .then(response => {
          var index = this.carts.indexOf(cart)
          if (index >= 0 ){
            this.carts.splice(index, 1)
          }
        }, response => {
            console.log('Error: ', response)
        }).catch(error => {
          console.log(error)
        });
      }
    },
    saveCart(){
      this.$http.post(URL_ENDPOINT+'/save', {
        cart: this.cart
      }).then(response => {
        this.cart = [];
        Reveal.down();
      }, response => {
          console.log('Error: ', response)
      }).catch(error => {
        console.log(error)
      })
    },
    loadOrUpdateCarts() {
      this.carts = [];
      this.$http.get(URL_ENDPOINT+'/carts').then(response => {
        Observable.of(response.body)
        .flatMap( cart => cart )
        // .filter( cart => cart.isConfirmed )
        .subscribe( cart => {
            this.carts.push(cart)
        })
      }, response => {
          console.log('Error: ', response)
      }).catch(error => {
        console.log(error)
      })
    },
    totalCompletedCarts(){
      return (this.carts.length === 0?0: this.carts.filter( c => c.status == 'Completed').length)
    },
    reloadStock() {
      this.$http.get(URL_ENDPOINT).then(response => {
        Observable.of(response.body)
        .flatMap( p => p )
        // .filter( p => p.stock > 0)
        .subscribe( product => {
          this.cart.forEach( p => {
            if (p.id === product.id){
              p.stock = product.stock
            }
          })
        })
      }, response => {
          console.log('Error: ', response)
      }).catch(error => {
        console.log(error)
      })
    },
    productAvailable(product){
      return product.stock > 0
    },
    loadThumbnail(id){
      document.getElementById('img-'+id).src = '/img/placeholder.png'
    },
    moveLeft(){
      Reveal.left();
    },
    goBack(){
      Reveal.prev();
    }
  },
  created() {
    //
  },
  mounted() {

    Reveal.initialize(/*{
      controls: true,
      progress: true,
      history: true,
      center: true,
      // default/cube/page/concave/zoom/linear/fade/none
      transition: 'none',
    }*/);

    Reveal.on('slidechanged', event => {
      // event.previousSlide, event.currentSlide, event.indexh, event.indexv
      if (event.currentSlide.id === 'cart'){
        this.reloadStock()

      } else if (event.currentSlide.id === 'checkout'){
        this.loadOrUpdateCarts()

      }
    } );

    this.$http.get(URL_ENDPOINT).then(response => {
      if (this.products.length == 0){
        Observable.of(response.body)
        .flatMap( p => p)
        // filter out available/stock...
        // .filter( p => p.price > 300 )
        // .filter( p => p.stock > 0 )
        .subscribe( p => {
          this.products.push(p)
        })
      }
      // response.body.forEach((p) => { this.products.push(p) })
      // this.products = response.body

    }, response => {
        console.log('Error: ', response)
    }).catch(error => {
      console.log(error)
    })

  }
}
</script>

<style>
@import url('../node_modules/reveal.js/dist/reveal.css');
@import url('../node_modules/reveal.js/dist/theme/white.css');

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
  height: 100vh;
}

.list li {
  list-style-type: none;
}

.header {
  width: 100%;
  height: 70px;
  background-color: #2D9CDB;
  box-sizing: border-box;
  padding: .5em;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.nav-links {
  width: 100%;
  display: inline-flex !important;
  justify-content: flex-start;
}

.link {
  list-style: none;
  padding: 0 2em;
}

.link a {
  color: #fff;
  text-decoration: none;
}

.btn {
  border: 0;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 3px;
  color: #fff;
  display: flex;
  justify-content: space-around;
  position: relative;
}

.btn-small {
  padding: .5em 2em;
}

.btn-medium {
  padding: .7em 4.5em;
}

.btn-large {
  padding: .7em 5em;
}

.btn-info {
  background-color: #2D9CDB;
}

.btn-success {
  background-color: #27AE60;
}

.btn-danger {
  background-color: #e74c3c;
}

.modal {
  width: 100%;
  max-width: 800px;
  height: auto;
  box-sizing: border-box;
  padding: 1em;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  box-shadow: 0 0 10px rgba(144,144,144,.2);
  border: 0;
  border-radius: 5px;
  line-height: 1.5em;
  opacity: 1;
  transition: all .5s;
  z-index: 1;
}

.modal button {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.fade-enter-active, .fade-leave-active {
  transition: all .7s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

ul.product-list {
  display: flex;
  flex-flow: wrap;
}

.product {
  max-height: 180px;
  flex: 1 0 48%;
  margin: 1%;
}

.product .product-name {
  font-weight: bold;
  font-size: 120%;
}

.product .product-price {
  position: relative;
  left: 80px;
}

.text-large {
  font-size: 140%;
}

.text-small {
  font-size: 70%;
}

.product-box {
  font-size: .3em;
  position: relative;
  top: -180px;
  left: 160px;
  max-width: 230px;
}

.product-table-cart {
  font-size: 40%;
}

.product-details {
  font-size: 80%
}

.product-cart {
  font-size: 120%
}

.pull-right {
  text-align: right !important;
}

</style>
