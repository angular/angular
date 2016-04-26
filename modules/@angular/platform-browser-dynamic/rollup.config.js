
export default {
  entry: '../../../dist/packages-dist/platform-browser-dynamic/esm/platform_browser_dynamic.js',
  dest: '../../../dist/packages-dist/platform-browser-dynamic/esm/platform-browser-dynamic.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.platformBrowserDynamic',
  globals: {
    '@angular/facade': 'ng.facade',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
