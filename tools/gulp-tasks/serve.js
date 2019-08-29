/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = {

  // Serve the built files
  default: (gulp) => () => {
    const connect = require('gulp-connect');
    const cors = require('cors');
    const path = require('path');

    connect.server({
      root: path.resolve(__dirname, '../../dist'),
      port: 8000,
      livereload: false,
      open: false,
      middleware: (connect, opt) => [cors()],
    });
  },

};
