export default {
  entry: '../../../dist/packages-dist/router/testing/index.js',
  dest: '../../../dist/packages-dist/router/bundles/router-testing.umd.js',
  format: 'umd',
  moduleName: 'ng.router.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/common/testing': 'ng.common.testing',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/router': 'ng.router'
  }
}
