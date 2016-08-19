import gulp = require('gulp');
const karma = require('karma');
import path = require('path');
import gulpMerge = require('merge2');

import {PROJECT_ROOT} from '../constants';


gulp.task(':build:test:vendor', function() {
  const npmVendorFiles = [
    '@angular', 'core-js/client', 'hammerjs', 'rxjs', 'systemjs/dist', 'zone.js/dist'
  ];

  return gulpMerge(
    npmVendorFiles.map(function(root) {
      const glob = path.join(root, '**/*.+(js|js.map)');
      return gulp.src(path.join('node_modules', glob))
        .pipe(gulp.dest(path.join('dist/vendor', root)));
    }));
});

gulp.task('test', [':build:test:vendor', 'build:components'], function(done: () => void) {
  new karma.Server({
    configFile: path.join(PROJECT_ROOT, 'test/karma.conf.js')
  }, done).start();
});

gulp.task('test:single-run', [':build:test:vendor', 'build:components'], function(done: () => void) {
  new karma.Server({
    configFile: path.join(PROJECT_ROOT, 'test/karma.conf.js'),
    singleRun: true
  }, done).start();
});

