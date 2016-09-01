
export default {
  entry: '../../../dist/packages-dist/core/index.js',
  dest: '../../../dist/packages-dist/core/bundles/core.umd.js',
  format: 'umd',
  moduleName: 'ng.core',
  globals: {
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  }
}

