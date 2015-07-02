/// <reference path="../angular2/typings/node/node.d.ts" />

import {bind} from 'angular2/di';
import {Options} from './common';

export * from './common';
export {SeleniumWebDriverAdapter} from './src/webdriver/selenium_webdriver_adapter';

var fs = require('fs');

// TODO(tbosch): right now we bind the `writeFile` method
// in benchpres/benchpress.es6. This does not work for Dart,
// find another way...
// Note: Can't do the `require` call in a facade as it can't be loaded into the browser
// for our unit tests via karma.
Options.DEFAULT_BINDINGS.push(bind(Options.WRITE_FILE).toValue(writeFile));

function writeFile(filename, content): Promise<any> {
  return new Promise(function(resolve, reject) {
    fs.writeFile(filename, content, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  })
}
