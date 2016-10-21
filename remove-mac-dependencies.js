/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The fsevents package is required when building on Mac, but will cause npm install to
 * fail when building on Windows or Linux. This script removes the dependency.
 */

fs = require('fs')

transformJSONFile('package.json', function(package) { delete package.devDependencies.fsevents; });
transformJSONFile(
    'npm-shrinkwrap.json', function(shrinkwrap) { delete shrinkwrap.dependencies.fsevents });

// tranforms the json in a file and writes contents back to file system
function transformJSONFile(fileName, objectTransformer) {
  // logs if the attempt to write the file was a success
  var logCompletionStatus = function(err) {
    if (err) {
      console.log(err);
      return;
    }

    console.log(fileName + ' updated');
  };

  // process the file contents, write it back to the file system
  var transformDataAndWriteResult = function(err, data) {
    if (err) {
      console.log(err);
      return;
    }

    var parsedObject = JSON.parse(data);
    objectTransformer(parsedObject);

    fs.writeFile(fileName, JSON.stringify(parsedObject, null, '  '), logCompletionStatus);
  };

  fs.readFile(fileName, 'utf8', transformDataAndWriteResult);
}