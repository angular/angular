export default {
  entry: '../../../dist/packages-dist/platform-browser-dynamic/index.js',
  dest: '../../../dist/packages-dist/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
  format: 'umd',
  moduleName: 'ng.platformBrowserDynamic',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser'
  }
}
