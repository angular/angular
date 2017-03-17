const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const rimraf = require('rimraf');

const EXAMPLES_PATH = path.join(__dirname + '/../content/examples');
const OLD_AIO_PATH = path.join(__dirname + '/../../../angular.io/public/docs/_examples');
const E2E_TEST_FILENAME = 'e2e-spec.ts'

// Not really to ignore, but they need a different processing
const SPECIAL_EXAMPLES = [
  'cb-ts-to-js'
].map(example => {
  return `${OLD_AIO_PATH}/${example}`;
});
const EXAMPLES_TO_IGNORE = [
  `${OLD_AIO_PATH}/homepage-*`
]
.concat(SPECIAL_EXAMPLES)
.map(e => `!${e}`);

console.log('Deleting examples...');
rimraf.sync(EXAMPLES_PATH);

let examplesPath = globby.sync([OLD_AIO_PATH + '/*', ...EXAMPLES_TO_IGNORE], { dot: true });

console.log('Copying examples');
examplesPath.map(example => {
  const originalPath = example;
  const name = example.split('/').pop();
  const isDirectory = fs.lstatSync(example).isDirectory();

  if (isDirectory) {
    // not all examples have a ts folder, for example _boilerplate
    if (fs.existsSync(path.join(example, '/ts'))) {
      example = path.join(example, '/ts');
    }

    const dest = path.join(EXAMPLES_PATH, name);

    fs.copySync(example, dest);

    // There are also e2e specs to copy
    try {
      fs.copySync(path.join(originalPath, E2E_TEST_FILENAME), path.join(dest, E2E_TEST_FILENAME));
    } catch (e) {
    }

  } else {
    fs.copySync(originalPath, path.join(EXAMPLES_PATH, name));
  }
});

SPECIAL_EXAMPLES.map(example => {
  const name = example.split('/').pop();
  fs.copySync(example, path.join(EXAMPLES_PATH, name));
});


