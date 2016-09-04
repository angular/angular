
export default {
  entry: '../../../dist/packages-dist/platform-browser/testing/index.js',
  dest: '../../../dist/packages-dist/platform-browser/bundles/platform-browser-testing.umd.js',
  format: 'umd',
  moduleName: 'ng.platformBrowser.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/platform-browser': 'ng.platformBrowser'
  }
}
