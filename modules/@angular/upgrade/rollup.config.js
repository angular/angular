
export default {
  entry: '../../../dist/packages-dist/upgrade/esm/upgrade.js',
  dest: '../../../dist/packages-dist/upgrade/esm/upgrade.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.upgrade',
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
