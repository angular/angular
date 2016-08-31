export default {
  entry: '../../../dist/packages-dist/platform-browser-dynamic/testing/index.js',
  dest: '../../../dist/packages-dist/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
  format: 'umd',
  moduleName: 'ng.platformBrowserDynamic.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/core/testing': 'ng.core.testing',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    '@angular/compiler/testing': 'ng.compiler.testing',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser/testing': 'ng.platformBrowser.testing',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
    'rxjs/Subject': 'Rx',
    'rxjs/observable/PromiseObservable': 'Rx', // this is wrong, but this stuff has changed in rxjs b.6 so we need to fix it when we update.
    'rxjs/operator/toPromise': 'Rx.Observable.prototype',
    'rxjs/Observable': 'Rx'
  }
}
