declare var System: any;


(function(global) {

  writeScriptTag('/all/playground/vendor/es6-shim.js');
  writeScriptTag('/all/playground/vendor/zone.js');
  writeScriptTag('/all/playground/vendor/long-stack-trace-zone.js');
  writeScriptTag('/all/playground/vendor/system.src.js');
  writeScriptTag('/all/playground/vendor/Reflect.js');
  writeScriptTag('/all/playground/vendor/rxjs/bundles/Rx.js', 'playgroundBootstrap()');
  global.playgroundBootstrap = playgroundBootstrap;

  function playgroundBootstrap() {
    // check query param
    var useBundles = location.search.indexOf('bundles=false') == -1;
    if (useBundles) {
      System.config({
        map: {
          'index': 'index.js',
          '@angular/core': '/packages-dist/core/core.umd.js',
          '@angular/common': '/packages-dist/common/common.umd.js',
          '@angular/compiler': '/packages-dist/compiler/compiler.umd.js',
          '@angular/platform-browser': '/packages-dist/platform-browser/platform-browser.umd.js',
          '@angular/http': '/packages-dist/http/http.umd.js',
          '@angular/upgrade': '/packages-dist/upgrade/upgrade.umd.js',
          '@angular/router': '/packages-dist/router/router.umd.js',
          '@angular/router-deprecated': '/packages-dist/router-deprecated/router-deprecated.umd.js',
          '@angular/core/src/facade': '/all/@angular/core/src/facade',
          'rxjs': location.pathname.replace(/index\.html$/, '') + 'rxjs'
        },
        packages: {
          'app': {defaultExtension: 'js'},
          '@angular/core/src/facade': {defaultExtension: 'js'}
        }
      });
    } else {
      console.warn(
          "Not using the Angular bundles. Don't use this configuration for e2e/performance tests!");

      System.config({
        map: {'index': 'index.js', '@angular': '/all/@angular'},
        packages: {
          // 'app': {
          //   main: 'index.js',
          //   defaultExtension: 'js'
          // },
          '@angular/core': {main: 'index.js', defaultExtension: 'js'},
          '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
          '@angular/common': {main: 'index.js', defaultExtension: 'js'},
          '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
          '@angular/router': {main: 'index.js', defaultExtension: 'js'},
          // 'rxjs': {
          //   defaultExtension: 'js'
          // }
        }
      });
    }


    // BOOTSTRAP the app!
    System.import('index').then(function(m) { m.main(); }, console.error.bind(console));
  }


  function writeScriptTag(scriptUrl, onload?) {
    document.write(`<script src="${scriptUrl}" onload="${onload}"></script>`);
  }
}(window));
