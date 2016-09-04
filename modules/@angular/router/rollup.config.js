export default {
  entry: '../../../dist/packages-dist/router/index.js',
  dest: '../../../dist/packages-dist/router/bundles/router.umd.js',
  format: 'umd',
  moduleName: 'ng.router',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/platform-browser': 'ng.platformBrowser',

    'rxjs/BehaviorSubject': 'Rx',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/Subscription': 'Rx',
    'rxjs/util/EmptyError': 'Rx',

    'rxjs/observable/from': 'Rx.Observable',
    'rxjs/observable/fromPromise': 'Rx.Observable',
    'rxjs/observable/forkJoin': 'Rx.Observable',
    'rxjs/observable/of': 'Rx.Observable',

    'rxjs/operator/toPromise': 'Rx.Observable.prototype',
    'rxjs/operator/map': 'Rx.Observable.prototype',
    'rxjs/operator/mergeAll': 'Rx.Observable.prototype',
    'rxjs/operator/concatAll': 'Rx.Observable.prototype',
    'rxjs/operator/mergeMap': 'Rx.Observable.prototype',
    'rxjs/operator/reduce': 'Rx.Observable.prototype',
    'rxjs/operator/every': 'Rx.Observable.prototype',
    'rxjs/operator/first': 'Rx.Observable.prototype',
    'rxjs/operator/catch': 'Rx.Observable.prototype',
    'rxjs/operator/last': 'Rx.Observable.prototype'
  },
  plugins: [
  ]
}
