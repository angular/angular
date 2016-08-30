
export default {
  entry: '../../../dist/packages-dist/forms/index.js',
  dest: '../../../dist/packages-dist/forms/bundles/forms.umd.js',
  format: 'umd',
  moduleName: 'ng.forms',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/observable/fromPromise': 'Rx.Observable',
    'rxjs/operator/toPromise': 'Rx.Observable.prototype'
  }
}
