module.exports = (gulp) => () => {
  gulp.src('docs/src/**/*').pipe(gulp.dest('dist/docs'));
};
