/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

module.exports = function (config) {
  require('./karma-dist-jasmine.conf.js')(config);
  require('./sauce.conf')(config, ['SL_IOS9']);
};
