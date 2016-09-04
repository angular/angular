
export default {
  entry: '../../../dist/packages-dist/http/index.js',
  dest: '../../../dist/packages-dist/http/bundles/http.umd.js',
  format: 'umd',
  moduleName: 'ng.http',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  }
}
