var util = require('./util');
var gulpTraceur = require('../transpiler/gulp-traceur');
var file2moduleName = require('./file2modulename');

module.exports = function(gulp, plugins, config) {
  return function() {
    return gulp.src(config.src)
      .pipe(plugins.rename({extname: '.'+config.outputExt}))
      .pipe(util.insertSrcFolder(plugins, config.srcFolderInsertion))
      .pipe(gulpTraceur(
        config.options,
        file2moduleName)
      )
      .pipe(gulp.dest(config.dest));
  };
};
