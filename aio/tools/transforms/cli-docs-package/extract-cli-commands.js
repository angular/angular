const shelljs = require('shelljs');
const {resolve}  = require('canonical-path');
const {CONTENTS_PATH} = require('../config');

shelljs.cd(resolve(CONTENTS_PATH, 'cli-src'));
shelljs.exec('git clean -Xfd');
shelljs.exec('yarn install');
