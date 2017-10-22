// #docregion
const ngtools = require('@ngtools/webpack');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    main: [
      './src/universal/app-server.module.ts',
      './src/universal/server.ts'
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node',
  output: {
    path: __dirname + '/dist',
    filename: 'server.js'
  },
  plugins: [
    // compile with AOT
    new ngtools.AotPlugin({
      tsConfigPath: './tsconfig.universal.json'
    }),

    // copy assets to the output (/dist) folder
    new CopyWebpackPlugin([
      {from: 'src/index-universal.html'},
      {from: 'src/styles.css'},
      {from: 'node_modules/core-js/client/shim.min.js'},
      {from: 'node_modules/zone.js/dist/zone.min.js'},
  ])
  ],
  module: {
    rules: [
      { test: /\.css$/,  loader: 'raw-loader' },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.ts$/,   loader: '@ngtools/webpack' }
    ]
  }
}
