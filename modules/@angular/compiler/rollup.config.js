
export default {
  entry: '../../../dist/packages-dist/compiler/esm/compiler.js',
  dest: '../../../dist/packages-dist/compiler/esm/compiler.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.compiler',
  globals: {
    '@angular/facade': 'ng.facade',
    '@angular/core': 'ng.core'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
