const path = require('path');
const regularPlunker = require('./regularPlunker');
const embeddedPlunker = require('./embeddedPlunker');

const EXAMPLES_PATH = path.join(__dirname, '../../content/examples');
const LIVE_EXAMPLES_PATH = path.join(__dirname, '../../src/generated/live-examples');

regularPlunker.buildPlunkers(EXAMPLES_PATH, LIVE_EXAMPLES_PATH);
embeddedPlunker.buildPlunkers(EXAMPLES_PATH, LIVE_EXAMPLES_PATH);
