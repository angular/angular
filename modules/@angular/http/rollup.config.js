
export default {
  entry: '../../../dist/packages-dist/http/esm/http.js',
  dest: '../../../dist/packages-dist/http/esm/http.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.http',
  globals: {
    '@angular/facade': 'ng.facade',
    '@angular/core': 'ng.core',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser',
    'rxjs/Observable': 'Rx.Observable'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
