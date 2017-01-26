/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const Package = require('dgeni').Package;

module.exports = function testPackage(packageName, mockTemplateEngine) {

  const pkg = new Package('mock_' + packageName, [require('../' + packageName)]);

  // provide a mock log service
  pkg.factory('log', function() { return require('dgeni/lib/mocks/log')(false); });

  if (mockTemplateEngine) {
    pkg.factory('templateEngine', function() { return {}; });
  }

  return pkg;
};
