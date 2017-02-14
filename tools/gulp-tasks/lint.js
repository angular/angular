// Check the coding standards and programming errors
module.exports = (gulp) => () => {
  const tslint = require('gulp-tslint');
  // Built-in rules are at
  // https://palantir.github.io/tslint/rules/
  const tslintConfig = require('../../tslint.json');
  return gulp
      .src([
        // todo(vicb): add .js files when supported
        // see https://github.com/palantir/tslint/pull/1515
        './modules/**/*.ts',
        './tools/**/*.ts',
        './*.ts',

        // Ignore TypeScript mocks because it's not managed by us
        '!./tools/@angular/tsc-wrapped/test/typescript.mocks.ts',

        // Ignore generated files due to lack of copyright header
        // todo(alfaproject): make generated files lintable
        '!**/*.d.ts',
        '!**/*.ngfactory.ts',
      ])
      .pipe(tslint({
        tslint: require('tslint').default,
        configuration: tslintConfig,
        formatter: 'prose',
      }))
      .pipe(tslint.report({emitError: true}));
};
