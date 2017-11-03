const path = require('path');
const StackblitzBuilder = require('./builder');

const EXAMPLES_PATH = path.join(__dirname, '../../content/examples');
const LIVE_EXAMPLES_PATH = path.join(__dirname, '../../src/generated/live-examples');

new StackblitzBuilder(EXAMPLES_PATH, LIVE_EXAMPLES_PATH).build();

