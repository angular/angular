const ngtools = require('@ngtools/webpack');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
// #docregion entry
  entry: {
    main: [
      './src/universal/app-server.module.ts',
      './src/universal/server.ts'
    ]
  },
// #enddocregion entry
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node',
// #docregion output
  output: {
    path: 'src/dist',
    filename: 'server.js'
  },
// #enddocregion output
// #docregion plugins
  plugins: [
    new ngtools.AotPlugin({
      tsConfigPath: './tsconfig-universal.json'
    })
  ],
// #enddocregion plugins
// #docregion rules
  module: {
    rules: [
      { test: /\.css$/, loader: 'raw-loader' },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.ts$/, loader: '@ngtools/webpack' }
    ]
  }
// #enddocregion rules
}
