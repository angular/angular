export default {
  entry: '../../../dist/packages-dist/platform-webworker-dynamic/index.js',
  dest: '../../../dist/packages-dist/platform-webworker-dynamic/bundles/platform-webworker-dynamic.umd.js',
  format: 'umd',
  moduleName: 'ng.platformWebworkerDynamic',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
    '@angular/platform-webworker': 'ng.platformWebworker'
  }
}
