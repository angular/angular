
export default {
  entry: '../../../dist/packages-dist/platform-server/index.js',
  dest: '../../../dist/packages-dist/platform-server/bundles/platform-server.umd.js',
  format: 'umd',
  moduleName: 'ng.platformServer',
  globals: {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser'
  }
}
