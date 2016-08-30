export default {
  entry: '../../../dist/packages-dist/platform-webworker-dynamic/index.js',
  dest: '../../../dist/packages-dist/platform-webworker-dynamic/bundles/platform-webworker-dynamic.umd.js',
  format: 'umd',
  moduleName: 'ng.platformWebworkerDynamic',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-webworker': 'ng.platformWebworker',
    'rxjs/Subject': 'Rx',
    'rxjs/observable/PromiseObservable': 'Rx', // this is wrong, but this stuff has changed in rxjs b.6 so we need to fix it when we update.
    'rxjs/operator/toPromise': 'Rx.Observable.prototype',
    'rxjs/Observable': 'Rx'
  }
}
