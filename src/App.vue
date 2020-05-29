<template>
  <div id="app">
    <div class="reveal">
      <p>Rethinked Stack {{ counter }}</p>
      <div class="slides">
        <section>
          <ul>
            <li v-for="p in this.products">
              {{ p.name }}( {{ p.price }}$ )
            </li>
          </ul>
        </section>
        <section>
          <section>Vertical Slide 1</section>
          <section>Vertical Slide 2</section>
          <section>Vertical Slide 3</section>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import Reveal from 'reveal.js/dist/reveal'
import { Observable, interval } from 'rxjs'


export default {
  name: 'app',
  data (){
    return {
      counter: Number,
      products: []
    }
  },
  subscriptions: function () {
    return {
      counter: interval(800)
    }
  },
  components: {
    // HelloWorld
  },
  mounted() {
    Reveal.initialize(/*{
      controls: true,
      progress: true,
      history: true,
      center: true,
      // default/cube/page/concave/zoom/linear/fade/none
      transition: 'none',
    }*/)

    this.$http.get('http://localhost:3000/api/').then(response => {

      this.products = response.body;
      console.log(this.products);

    }, response => {
        console.log('Error: ', response)
    });
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
</style>
