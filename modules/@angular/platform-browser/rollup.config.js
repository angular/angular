
export default {
  entry: '../../../dist/packages-dist/platform-browser/index.js',
  dest: '../../../dist/packages-dist/platform-browser/bundles/platform-browser.umd.js',
  format: 'umd',
  moduleName: 'ng.platformBrowser',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common'
  }
}
