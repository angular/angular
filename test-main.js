/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Tun on full stack traces in errors to help debugging
Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100;

// Cancel Karma's synchronous start,
// we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function() {};

window.isNode = false;
window.isBrowser = true;

System.config({
  baseURL: '/base',
  defaultJSExtensions: true,
  map: {
    'benchpress/*': 'dist/js/dev/es5/benchpress/*.js',
    '@angular': 'dist/all/@angular',
    'domino': 'dist/all/@angular/empty.js',
    'url': 'dist/all/@angular/empty.js',
    'xhr2': 'dist/all/@angular/empty.js',
    '@angular/platform-server/src/domino_adapter': 'dist/all/@angular/empty.js',
    'angular-in-memory-web-api': 'dist/all/@angular/misc/angular-in-memory-web-api',
    'rxjs': 'node_modules/rxjs',
  },
  packages: {
    '@angular/core/src/render3': {main: 'index.js', defaultExtension: 'js'},
    '@angular/core/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/core': {main: 'index.js', defaultExtension: 'js'},
    '@angular/animations/browser/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/animations/browser': {main: 'index.js', defaultExtension: 'js'},
    '@angular/animations/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/animations': {main: 'index.js', defaultExtension: 'js'},
    '@angular/compiler/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
    '@angular/common/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/common/http/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/common/http': {main: 'index.js', defaultExtension: 'js'},
    '@angular/common': {main: 'index.js', defaultExtension: 'js'},
    '@angular/forms': {main: 'index.js', defaultExtension: 'js'},
    '@angular/misc/angular-in-memory-web-api': {main: 'index.js', defaultExtension: 'js'},
    // remove after all tests imports are fixed
    '@angular/facade': {main: 'index.js', defaultExtension: 'js'},
    '@angular/router/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/router': {main: 'index.js', defaultExtension: 'js'},
    '@angular/localize/src/utils': {main: 'index.js', defaultExtension: 'js'},
    '@angular/localize/src/localize': {main: 'index.js', defaultExtension: 'js'},
    '@angular/localize/init': {main: 'index.js', defaultExtension: 'js'},
    '@angular/localize': {main: 'index.js', defaultExtension: 'js'},
    '@angular/upgrade/static/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/upgrade/static': {main: 'index.js', defaultExtension: 'js'},
    '@angular/upgrade': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser/animations/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser/animations': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser-dynamic/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser-dynamic': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-server/init': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-server/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-server': {main: 'index.js', defaultExtension: 'js'},
    '@angular/private/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/elements': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/ajax': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/operators': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/testing': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/websocket': {main: 'index.js', defaultExtension: 'js'},
    'rxjs': {main: 'index.js', defaultExtension: 'js'},
  }
});


// Load browser-specific CustomElement polyfills, set up the test injector, import all the specs,
// execute their `main()` method and kick off Karma (Jasmine).
Promise
    .resolve()

    // Load browser-specific polyfills for custom elements.
    .then(function() {
      return loadCustomElementsPolyfills();
    })

    // Load necessary testing packages.
    .then(function() {
      return Promise.all([
        System.import('@angular/core/testing'),
        System.import('@angular/platform-browser-dynamic/testing'),
        System.import('@angular/platform-browser/animations')
      ]);
    })

    // Set up the test injector.
    .then(function(mods) {
      var coreTesting = mods[0];
      var pbdTesting = mods[1];
      var pbAnimations = mods[2];

      coreTesting.TestBed.initTestEnvironment(
          [pbdTesting.BrowserDynamicTestingModule, pbAnimations.NoopAnimationsModule],
          pbdTesting.platformBrowserDynamicTesting());
    })

    // Import all the specs and execute their `main()` method.
    .then(function() {
      return Promise.all(Object
                             .keys(window.__karma__.files)  // All files served by Karma.
                             .filter(onlySpecFiles)
                             .map(window.file2moduleName)  // Normalize paths to module names.
                             .map(function(path) {
                               return System.import(path).then(function(module) {
                                 if (module.hasOwnProperty('main')) {
                                   throw new Error('main() in specs are no longer supported');
                                 }
                               });
                             }));
    })

    // Kick off karma (Jasmine).
    .then(
        function() {
          __karma__.start();
        },
        function(error) {
          console.error(error);
        });


function loadCustomElementsPolyfills() {
  var loadedPromise = Promise.resolve();

  // The custom elements polyfill relies on `MutationObserver`.
  if (!window.MutationObserver) {
    loadedPromise = loadedPromise
                        .then(function() {
                          return System.import('node_modules/mutation-observer/index.js');
                        })
                        .then(function(MutationObserver) {
                          window.MutationObserver = MutationObserver;
                        });
  }

  // The custom elements polyfill relies on `Object.setPrototypeOf()`.
  if (!Object.setPrototypeOf) {
    var getDescriptor = function getDescriptor(obj, prop) {
      var descriptor;
      while (obj && !descriptor) {
        descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        obj = Object.getPrototypeOf(obj);
      }
      return descriptor || {};
    };
    var setPrototypeOf = function setPrototypeOf(obj, proto) {
      for (var prop in proto) {
        if (!obj.hasOwnProperty(prop)) {
          Object.defineProperty(obj, prop, getDescriptor(proto, prop));
        }
      }
      return obj;
    };

    Object.defineProperty(setPrototypeOf, '$$shimmed', {value: true});
    Object.setPrototypeOf = setPrototypeOf;
  }

  // The custom elements polyfill will patch properties and methods on `(HTML)Element` and `Node`
  // (among others), including `(HTML)Element#innerHTML` and `Node#removeChild()`:
  // https://github.com/webcomponents/custom-elements/blob/4f7072c0dbda4beb505d16967acfffd33337b325/src/Patch/Element.js#L28-L73
  // https://github.com/webcomponents/custom-elements/blob/4f7072c0dbda4beb505d16967acfffd33337b325/src/Patch/Node.js#L105-L120
  // The patched `innerHTML` setter and `removeChild()` method will try to traverse the DOM (via
  // `nextSibling` and `parentNode` respectively), which leads to infinite loops when testing
  // `HtmlSanitizer` with cloberred elements on browsers that do not support the `<template>`
  // element:
  // https://github.com/angular/angular/blob/213baa37b0b71e72d00ad7b606ebfc2ade06b934/packages/platform-browser/src/security/html_sanitizer.ts#L29-L38
  // To avoid that, we "unpatch" these properties/methods and apply the patch only for the relevant
  // `@angular/elements` tests.
  var patchConfig = {'innerHTML': ['Element', 'HTMLElement'], 'removeChild': ['Node']};
  var patchTargets = {};
  var originalDescriptors = {};
  if (!window.customElements) {
    Object.keys(patchConfig).forEach(function(prop) {
      patchConfig[prop]
          .map(function(name) {
            return window[name].prototype;
          })
          .some(function(candidatePatchTarget) {
            var candidateOriginalDescriptor =
                Object.getOwnPropertyDescriptor(candidatePatchTarget, prop);

            if (candidateOriginalDescriptor) {
              patchTargets[prop] = candidatePatchTarget;
              originalDescriptors[prop] = candidateOriginalDescriptor;
              return true;
            }
          });
    });
  }

  var polyfillPath = !window.customElements ?
      // Load custom elements polyfill.
      'node_modules/@webcomponents/custom-elements/custom-elements.min.js' :
      // Allow ES5 functions as custom element constructors.
      'node_modules/@webcomponents/custom-elements/src/native-shim.js';

  loadedPromise = loadedPromise
                      .then(function() {
                        return System.import(polyfillPath);
                      })
                      .then(function() {
                        // `packages/compiler/test/schema/schema_extractor.ts` relies on
                        // `HTMLElement.name`, but custom element polyfills will replace
                        // `HTMLElement` with an anonymous function.
                        Object.defineProperty(HTMLElement, 'name', {value: 'HTMLElement'});

                        // Create helper functions on `window` for patching/restoring
                        // properties/methods.
                        Object.keys(patchConfig).forEach(function(prop) {
                          var patchMethod = '$$patch_' + prop;
                          var restoreMethod = '$$restore_' + prop;

                          if (!patchTargets[prop]) {
                            // No patching detected. Create no-op functions.
                            window[patchMethod] = window[restoreMethod] = function() {};
                          } else {
                            var patchTarget = patchTargets[prop];
                            var originalDescriptor = originalDescriptors[prop];
                            var patchedDescriptor =
                                Object.getOwnPropertyDescriptor(patchTarget, prop);

                            window[patchMethod] = function() {
                              Object.defineProperty(patchTarget, prop, patchedDescriptor);
                            };
                            window[restoreMethod] = function() {
                              Object.defineProperty(patchTarget, prop, originalDescriptor);
                            };

                            // Restore `prop`. The patch will be manually applied only during the
                            // `@angular/elements` tests that need it.
                            window[restoreMethod]();
                          }
                        });
                      });

  return loadedPromise;
}

function onlySpecFiles(path) {
  return /_spec\.js$/.test(path);
}
