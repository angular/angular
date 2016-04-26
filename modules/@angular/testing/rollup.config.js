
export default {
  entry: '../../../dist/packages-dist/testing/esm/testing.js',
  dest: '../../../dist/packages-dist/testing/esm/testing.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.testing',
  globals: {
    '@angular/facade': 'ng.facade',
    '@angular/core': 'ng.core',
    '@angular/compiler': 'ng.compiler',
    '@angular/common': 'ng.common',
    '@angular/platform-browser': 'ng.platformBrowser'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
