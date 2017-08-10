const ExampleZipper = require('./exampleZipper');
const path = require('canonical-path');

const EXAMPLES_PATH = path.join(__dirname, '../../content/examples');
const ZIPS_PATH = path.join(__dirname, '../../src/generated/zips');

new ExampleZipper(EXAMPLES_PATH, ZIPS_PATH);
