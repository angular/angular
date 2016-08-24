
export default {
  entry: '../../../dist/packages-dist/http/testing/index.js',
  dest: '../../../dist/packages-dist/http/testing.js',
  format: 'umd',
  moduleName: 'ng.core',
  globals: {
    'rxjs/Subject': 'Rx',
    'rxjs/observable/PromiseObservable': 'Rx', // this is wrong, but this stuff has changed in rxjs b.6 so we need to fix it when we update.
    'rxjs/operator/toPromise': 'Rx.Observable.prototype',
    'rxjs/Observable': 'Rx'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
<<<<<<< 780f4419d356dfc6d02ac98c0c8b40b33dae998b

=======
>>>>>>> all but platform dynamic working
