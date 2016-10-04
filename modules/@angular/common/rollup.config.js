
export default {
  entry: '../../../dist/packages-dist/common/index.js',
  dest: '../../../dist/packages-dist/common/bundles/common.umd.js',
  format: 'umd',
  moduleName: 'ng.common',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  }
}
