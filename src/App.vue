<template>
  <div id="app">
    <div class="reveal">
      <div class="slides">
        <section id="main">

          <header class="header">
            <nav class="nav">
              <ul class="nav-links">
                <li class="link">
                  <a href="#" @click="toggleCart">Cart {{ cart.length > 0 ? `(${cart.length})` :'' }}</a>
                </li>
              </ul>
            </nav>
            <slot></slot>
          </header>

          <ul class="list">
            <li v-for="(product, index) in products" :key="index" class="product">
                <span class="product-name">
                  {{ product.name }}
                </span>
              <div class="product-price">
                <span>$ {{ product.price }}, 00</span>
              </div>

              <div class="button-actions">
                <button :class="'btn btn-large btn-'+(productInCart(product)?'danger':'success')"
                  @click="addOrRemoveProduct(product)">
                  {{ productInCart(product)?'Remove from Cart':'Add to Cart' }}
                </button>
                <!-- <button class="btn btn-large btn-info" @click="addFavorites(product)">
                  add to favorits
                </button> -->
              </div>

            </li>
          </ul>

          <transition name="fade">
            <div class="modal" v-show="dialog">
              <h4>Details</h4>
              <span v-if="this.cartIsEmpty()">
                Your Cart is Empty!
              </span>
              <div class="product-list" v-if="!this.cartIsEmpty()">
                <ul class="list">
                  <li v-for="(product, index) in this.cart" :key="index" class="product">
                    {{ product.name }} X 1
                  </li>
                </ul>
                <p>Total: {{ this.getCartTotal() }}</p>
              </div>
              <div class="button-actions">
                <button class="btn btn-large btn-danger" @click="toggleCart">
                  Close
                </button>
              </div>
            </div>
          </transition>

        </section>

        <section>

          <section id="cart">
            <div class="product-table" v-if="!this.cartIsEmpty()">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Qte</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(product, index) in this.cart" :key="index" class="product">
                    <td>{{ product.name }}</td>
                    <td>{{ product.price }}</td>
                    <td>{{ 1 }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2"></td>
                    <td>Total: {{ this.getCartTotal() }}</td>
                  </tr>
                </tfoot>
              </table>
              <div class="button-actions" style="position: absolute;bottom: -25px;right: 140px;">
                <button class="btn btn-large btn-info" @click="saveCart">Save</button>
              </div>
            </div>

          </section>

          <section id="checkout">
            <div class="cart-table" v-if="this.carts.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Qte</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(cart, index) in this.carts" :key="index" class="cart">
                    <td>{{ cart.id }}</td>
                    <td>{{ cart.date }}</td>
                    <td>{{ cart.qte }}</td>
                    <td> <button class="btn btn-small btn-danger" @click="removeProductFromCart(cart)">X</button> </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2"></td>
                    <td>Total: {{ this.carts.length }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </section>

          <section>Vertical Slide 3</section>
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
    addOrRemoveProduct(product) {
      var index = this.cart.indexOf(product)
      if (index >= 0){
        this.cart.splice(index, 1)
      } else {
        this.addProduct(product)
      }
    },
    addProduct(product) {
      this.$http.get(URL_ENDPOINT+'/product?id='+product.id).then(response => {
        // check for stock availability
        console.log(response.body.stock);
        if (response.body.stock > 0){
          this.cart.push(product)
        } else {
          alert('Product Out of Stock!')
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
    getCartTotal(){
      var total = 0
      return this.cart
        .map( p => total += parseFloat(p.price) )
        .reduce(p => total)
    },
    saveCart(){
      this.$http.post(URL_ENDPOINT+'/save', {
        cart: this.cart
      }).then(response => {
        // console.log(response.body);
        Reveal.down();
      }, response => {
          console.log('Error: ', response)
      }).catch(error => {
        console.log(error)
      })
    },
    loadCart() {
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
    removeProductFromCart(cart){
        this.$http.delete(URL_ENDPOINT+ '/carts/'+ cart.id)
        .then(response => {
          var index = this.carts.indexOf(cart)
          this.carts.splice(index, 1)
        }, response => {
            console.log('Error: ', response)
        }).catch(error => {
          console.log(error)
        })

    }
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
        console.log('query products availability');
        //...
      } else if (event.currentSlide.id === 'checkout'){
        this.loadCart()
      }
    } );

    this.$http.get(URL_ENDPOINT).then(response => {
      if (this.products.length == 0){
        Observable.of(response.body)
        .flatMap( p => p)
        // filter out available/stock...
        // .filter( p => p.price > 300 )
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

.product-price {
  font-size: .6em;
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
  display: flex;
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
  max-width: 500px;
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

</style>
