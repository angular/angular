
export default {
  entry: '../../../dist/packages-dist/core/testing/index.js',
  dest: '../../../dist/packages-dist/core/bundles/core-testing.umd.js',
  format: 'umd',
  moduleName: 'ng.core.testing',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  }
}

