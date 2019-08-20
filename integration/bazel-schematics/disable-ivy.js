/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const fs = require('fs');
const configPath = 'demo/tsconfig.json';
const config = {
  ...JSON.parse(fs.readFileSync(configPath, 'utf8')),
  "angularCompilerOptions": {
    "enableIvy": false,
  },
};
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
