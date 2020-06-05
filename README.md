# Reactive Stack

A simple example for Reactive Full Stack eCommerce web app for each layer:
- Database: rethinkdb
- Backend: Express.js & Rxjs
- Frontend: Vue & RxJs & Reveal

```
npx express-generator --view=ejs
npm install dotenv --save
npm install rx rxjs --save
npm install nodemon --save-dev

# babel-*  & webpack loaders...
npm install babel-polyfill babel-loader babel-preset-es2015 --save-dev
```

```
npx gitignore node
echo rethinkdb_data >> .gitignore
```

### Run the app
```
# run the db
rethinkdb

# run the app
npm run dev
```

### TODO:
- Clean up and remove duplicated code
- Use marblejs instead of express
- Use VueX & event bus
- Use Vuetify & Vuelidate
