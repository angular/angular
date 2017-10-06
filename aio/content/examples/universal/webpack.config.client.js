// #docregion
const ngtools = require('@ngtools/webpack');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: {
    main: [ './src/main.ts' ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: __dirname + '/dist',
    filename: 'client.js'
  },
  plugins: [
    // compile with AOT
    new ngtools.AotPlugin({
      tsConfigPath: './tsconfig.client.json'
    }),

    // minify
    new UglifyJSPlugin()
  ],
  module: {
    rules: [
      { test: /\.css$/,  loader: 'raw-loader' },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.ts$/,   loader: '@ngtools/webpack' }
    ]
  }
}
