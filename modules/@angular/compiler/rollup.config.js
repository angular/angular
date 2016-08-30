
export default {
  entry: '../../../dist/packages-dist/compiler/index.js',
  dest: '../../../dist/packages-dist/compiler/bundles/compiler.umd.js',
  format: 'umd',
  moduleName: 'ng.compiler',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
