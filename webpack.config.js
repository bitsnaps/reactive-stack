const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const config = {
  entry: {
    main: ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000', './src/index.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  mode: 'development',
  target: 'web',
  // target: 'node',
  // node: {
    // Need this when working with express, otherwise the build fails
  //   __dirname: false,   // if you don't put this is, __dirname
  //   __filename: false,  // and __filename return blank or /
  // },
  // externals: [nodeExternals()], // Need this to avoid error when working with Express
  module: {
    rules: [
        /*{
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
          options: {
            emitWarning: true,
            failOnError: false,
            failOnWarning: false
          }
        },*/
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          // Transpiles ES6-8 into ES5
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/,
        },
        {
          // Loads the javacript into html template provided.
          // Entry point is set below in HtmlWebPackPlugin in Plugins
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
              options: { minimize: true }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            // 'style-loader',
            'vue-style-loader',
            'css-loader'
          ]
        },

    ]
  },
  resolve: {
    extensions: [
      '.vue',
      '.js',
      // '.json'
    ],
    mainFiles: ["index"],
		alias: {
			"images": path.resolve(__dirname, "..", "client", "img"),
			"vue$": "vue/dist/vue.common.js"
		}
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebPackPlugin({
      // appMountId: 'app',
      template: "./src/index.html",
      // filename: "index.html",
      // excludeChunks: [ ]
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};

module.exports = config;
