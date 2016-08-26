'use strict';

const connect = require('gulp-connect');
const cors = require('cors');

console.log(`Serving ${process.env.RUNFILES}`);

connect.server({
  root: `${process.env.RUNFILES}`,
  port: 8000,
  livereload: false,
  open: false,
  middleware: (connect, opt) => [cors()],
});
