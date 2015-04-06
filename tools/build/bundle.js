var gulp = require('gulp');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var insert = require('gulp-insert');

module.exports.bundle = function(buildConfig, moduleName, outputFile, outputConfig){
  // loading it earlier interfers with custom traceur.
  var Builder = require('systemjs-builder');
  var builder = new Builder();
  builder.config(buildConfig);
  return builder.build(moduleName, outputFile, outputConfig);
}


module.exports.modify = function(srcs, concatName) {
  return gulp.src(srcs)
    .pipe(concat(concatName))
    .pipe(replace('sourceMappingURL', 'sourceMappingURLDisabled'))  // TODO: add concat for sourceMaps
}
