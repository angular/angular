/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = function(config) {
  require('./karma-dist-jasmine.conf.js')(config);
  require('./sauce.conf')(config, [
    'SL_IOS9', 'SL_CHROME', 'SL_FIREFOX_54', 'SL_SAFARI8', 'SL_SAFARI9', 'SL_SAFARI10', 'SL_IOS8',
    'SL_IOS9', 'SL_IOS10', 'SL_IE11', 'SL_MSEDGE15', 'SL_ANDROID4.4', 'SL_ANDROID5.1'
  ])
};
