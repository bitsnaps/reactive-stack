var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var webpack = require('webpack');
const config = require('./webpack.config.js');
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
require('dotenv').config();

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var app = express();

const compiler = webpack(config);

// serve webpack bundle output
// app.use(require('webpack-dev-middleware')(compiler, {
//   publicPath: config.output.publicPath,
//   stats: {
//     colors: true,
//     chunks: false
//   }
// }));
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

// enable hot-reload and state-preserving
// compilation error display
// app.use(require('webpack-hot-middleware')(compiler));
app.use(webpackHotMiddleware(compiler));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
// app.use(express.static(path.join(__dirname, '/dist')));


app.use('/api', indexRouter);
// app.use('/users', usersRouter);

app.get('/admin', function (req, res){
  res.sendFile(path.join(__dirname, '/public/admin.html'))
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

// const PORT = 5000;// process.env.PORT || 5000;
//
// app.listen(PORT, function () {
//   console.log(`Listening on http://localhost:${PORT}`)
// })

module.exports = app;
