var gulp = require('gulp');
var inlineNg2Template = require('gulp-inline-ng2-template');


/**
 * DO NOT ADD EXTRA TASKS HERE.
 *
 * gulp is only used temporarily in order to perform HTML and CSS in-lining for publishing.
 * Eventually the CLI should support this.
 *
 * See https://github.com/angular/angular-cli/issues/296
 *
 */

gulp.task('inline-resources', function(){
  gulp.src('./dist/components/**/*.js')
      .pipe(inlineNg2Template({base: './dist', target: 'es5'}))
      .pipe(gulp.dest('./dist/components'));
});
