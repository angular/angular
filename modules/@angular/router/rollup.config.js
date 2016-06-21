export default {
  entry: '../../../dist/packages-dist/router/esm/index.js',
  dest: '../../../dist/packages-dist/router/esm/router.umd.js',
  format: 'umd',
  moduleName: 'ng.router',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',

    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/BehaviorSubject': 'Rx',
    'rxjs/Observer': 'Rx',
    'rxjs/Subscription': 'Rx',

    'rxjs/observable/PromiseObservable': 'Rx', // this is wrong, but this stuff has changed in rxjs b.6 so we need to fix it when we update.
    'rxjs/operator/toPromise': 'Rx.Observable.prototype',
    'rxjs/operator/map': 'Rx.Observable.prototype',
    'rxjs/operator/mergeMap': 'Rx.Observable.prototype',
    'rxjs/operator/mergeAll': 'Rx.Observable.prototype',
    'rxjs/operator/every': 'Rx.Observable.prototype',
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}