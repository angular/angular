/* tslint:disable */
// #docregion one-entry
entry: {
  app: 'src/app.ts'
}
// #enddocregion one-entry

// #docregion app-example
import { Component } from '@angular/core';

@Component({
  ...
})
export class AppComponent {}
// #enddocregion app-example

// #docregion one-output
output: {
  filename: 'app.js'
}
// #enddocregion one-output

// #docregion two-entries
entry: {
  app: 'src/app.ts',
  vendor: 'src/vendor.ts'
},

output: {
  filename: '[name].js'
}
// #enddocregion two-entries

// #docregion loaders
rules: [
  {
    test: /\.ts$/
    loader: 'awesome-typescript-loader'
  },
  {
    test: /\.css$/
    loaders: 'style-loader!css-loader'
  }
]
// #enddocregion loaders

// #docregion imports
// #docregion single-import
import { AppComponent } from './app.component.ts';
// #enddocregion single-import
import 'uiframework/dist/uiframework.css';
// #enddocregion imports

// #docregion plugins
plugins: [
  new webpack.optimize.UglifyJsPlugin()
]
// #enddocregion plugins
