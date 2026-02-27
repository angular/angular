const path = require('path');
const tsNode = require('ts-node');

tsNode.register({
  project: path.join(__dirname, 'tsconfig.json'),
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
