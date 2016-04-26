
export default {
  entry: '../../../dist/packages-dist/core/esm/core.js',
  dest: '../../../dist/packages-dist/core/esm/core.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.core',
  globals: {
    '@angular/facade': 'ng.facade'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}

