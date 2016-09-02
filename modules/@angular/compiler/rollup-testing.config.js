
export default {
  entry: '../../../dist/packages-dist/compiler/testing/index.js',
  dest: '../../../dist/packages-dist/compiler/bundles/compiler-testing.umd.js',
  format: 'umd',
  moduleName: 'ng.compiler.testing',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/core/testing': 'ng.core.testing',
    '@angular/compiler': 'ng.compiler',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  }
}
