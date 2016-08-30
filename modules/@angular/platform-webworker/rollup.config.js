
export default {
  entry: '../../../dist/packages-dist/platform-webworker/index.js',
  dest: '../../../dist/packages-dist/platform-webworker/bundles/platform-webworker.umd.js',
  format: 'umd',
  moduleName: 'ng.platformWebworker',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/platform-browser': 'ng.platformBrowser',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  }
}
