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

  // Serve the examples
  examples: (gulp) => () => {
    const connect = require('gulp-connect');
    const cors = require('cors');
    const path = require('path');

    connect.server({
      root: path.resolve(__dirname, '../../dist/examples'),
      port: 8001,
      livereload: false,
      open: false,
      middleware: (connect, opt) => [cors()],
    });
  }

};
