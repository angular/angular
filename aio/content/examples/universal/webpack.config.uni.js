// #docplaster
const ngtools = require('@ngtools/webpack');
const webpack = require('webpack');

module.exports = {
	devtool: 'source-map',
// #docregion entry
	entry: {
		main: ['./src/uni/app.server.module.ts', './src/uni/server-aot.ts']
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
			tsConfigPath: './tsconfig-uni.json'
		})
	],
// #enddocregion plugins
// #docregion rules
	module: {
		rules: [
    		{ test: /\.css$/, loader: 'raw-loader' },
      		{ test: /\.html$/, loader: 'raw-loader' },
      		{ test: /\.ts$/, loader: '@ngtools/webpack' } // use ngtools loader for typescript
		]
	}
// #enddocregion rules
}
