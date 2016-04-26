
export default {
  entry: '../../../dist/packages-dist/platform-browser/esm/platform_browser.js',
  dest: '../../../dist/packages-dist/platform-browser/esm/platform-browser.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.platformBrowser',
  globals: {
    '@angular/facade': 'ng.facade',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
