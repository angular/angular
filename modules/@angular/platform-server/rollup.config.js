
export default {
  entry: '../../../dist/packages-dist/platform-server/esm/platform_server.js',
  dest: '../../../dist/packages-dist/platform-server/esm/platform-server.umd.js',
  sourceMap: true,
  format: 'umd',
  moduleName: 'ng.platformServer',
  globals: {
    '@angular/facade': 'ng.facade',
    '@angular/core': 'ng.core',
    '@angular/compiler': 'ng.compiler',
    '@angular/platform-browser': 'ng.platformBrowser'
  },
  plugins: [
//    nodeResolve({ jsnext: true, main: true }),
  ]
}
