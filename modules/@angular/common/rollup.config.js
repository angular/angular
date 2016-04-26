
export default {
  entry: '../../../dist/packages-dist/common/esm/common.js',
  dest: '../../../dist/packages-dist/common/esm/common.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.common',
  globals: {
    '@angular/facade': 'ng.facade',
    '@angular/core': 'ng.core'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
