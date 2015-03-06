import { bind } from 'angular2/di';
import { JsonFileReporter } from './common';

export * from './common';
export { SeleniumWebDriverAdapter } from './src/webdriver/selenium_webdriver_adapter';

var fs = require('fs');

// Note: Can't do the `require` call in a facade as it can't be loaded into the browser!
JsonFileReporter.BINDINGS.push(
  bind(JsonFileReporter.WRITE_FILE).toValue(writeFile)
);

function writeFile(filename, content) {
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
