var util = require('./util');
var file2moduleName = require('./file2modulename');
var through2 = require('through2');
var path = require('path');

module.exports = function(gulp, plugins, config) {
  return function() {
    return gulp.src(config.src)
      .pipe(util.insertSrcFolder(plugins, config.srcFolderInsertion, config.modulesFolder))
      .pipe(through2.obj(function(file, enc, done) {
        var fileName = file.relative;
        var moduleName = file2moduleName(fileName);
        var moduleNameWithoutPath = path.basename(moduleName);
        var scripts = util.filterByFile(config.scriptsPerFolder, fileName).map(function(script) {
          var scriptTag;
          if (script.src) {
            scriptTag = '<script src="'+script.src+'" type="'+script.mimeType+'"></script>';
          } else {
            scriptTag = '<script type="'+script.mimeType+'">'+script.inline+'</script>';
          }
          return scriptTag
            .replace('$MODULENAME_WITHOUT_PATH$', moduleNameWithoutPath)
            .replace('$MODULENAME$', moduleName)
        }).join('\n');
        file.contents = new Buffer(file.contents.toString().replace('$SCRIPTS$', scripts));
        this.push(file);
        done();
      }))
      .pipe(gulp.dest(config.dest));
    };
};

