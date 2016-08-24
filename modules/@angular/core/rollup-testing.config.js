
export default {
  entry: '../../../dist/packages-dist/core/testing/index.js',
  dest: '../../../dist/packages-dist/core/bundles/core-testing.umd.js',
  format: 'umd',
  moduleName: 'ng.core.testing',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Subject': 'Rx',
    'rxjs/observable/PromiseObservable': 'Rx', // this is wrong, but this stuff has changed in rxjs b.6 so we need to fix it when we update.
    'rxjs/operator/toPromise': 'Rx.Observable.prototype',
    'rxjs/Observable': 'Rx'
  }
}

