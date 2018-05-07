/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Check the coding standards and programming errors
module.exports = (gulp) => () => {
  const tslint = require('gulp-tslint');
  // Built-in rules are at https://palantir.github.io/tslint/rules/
  const path = require('path');
  return gulp
      .src([
        // TODO(vicb): add .js files when supported
        // see https://github.com/palantir/tslint/pull/1515
        './modules/**/*.ts',
        './modules/**/*.js',
        './packages/**/*.ts',
        './packages/**/*.js',
        './tools/**/*.ts',
        './tools/**/*.js',
        './*.ts',

        // Ignore node_modules directories
        '!**/node_modules/**',

        // Ignore built files directories
        '!**/built/**',
        '!**/dist/**',

        // Ignore special files
        '!**/*.externs.js',

        // Ignore generated files due to lack of copyright header
        // TODO(alfaproject): make generated files lintable
        '!**/*.d.ts',
        '!**/*.ngfactory.ts',
      ])
      .pipe(tslint({
        configuration: path.resolve(__dirname, '../../tslint.json'),
        formatter: 'prose',
      }))
      .pipe(tslint.report({emitError: true}));
};
