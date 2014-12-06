var path = require('path');

module.exports = function(gulp, plugins, config) {
  return function() {
    return gulp.src(config.src)
      .pipe(gulp.dest(path.join(config.dest, 'deps')));
  };
};
