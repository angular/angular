
export default {
  entry: '../../../dist/packages-dist/router/esm/router.js',
  dest: '../../../dist/packages-dist/router/esm/router.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.router',
  globals: {
    '@angular/facade': 'ng.facade',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/platform-browser': 'ng.platformBrowser'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
