
export default {
  entry: '../../../dist/packages-dist/common/testing/index.js',
  dest: '../../../dist/packages-dist/common/bundles/common-testing.umd.js',
  format: 'umd',
  moduleName: 'ng.common.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  }
}
