var util = require('./util');
var gulpTraceur = require('../transpiler/gulp-traceur');
var file2moduleName = require('./file2modulename');
var mergeStreams = require('event-stream').merge;

module.exports = function(gulp, plugins, config) {
  return function() {
    var transpile = gulp.src(config.src)
      .pipe(plugins.rename({extname: '.'+config.outputExt}))
      .pipe(util.insertSrcFolder(plugins, config.srcFolderInsertion, config.modulesFolder))
      .pipe(gulpTraceur(
        config.options,
        file2moduleName)
      )
      .pipe(gulp.dest(config.dest));

    var copy = gulp.src(config.copy)
      .pipe(plugins.rename({extname: '.'+config.outputExt}))
        .pipe(util.insertSrcFolder(plugins, config.srcFolderInsertion, config.modulesFolder))
      .pipe(gulp.dest(config.dest));

    return mergeStreams(transpile, copy);
  };
};
