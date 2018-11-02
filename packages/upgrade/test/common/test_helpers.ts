/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {setAngularJSGlobal} from '@angular/upgrade/src/common/angular1';


const ng1Versions = [
  {
    label: '1.5',
    files: ['angular-1.5/angular.js', 'angular-mocks-1.5/angular-mocks.js'],
  },
  {
    label: '1.6',
    files: ['angular-1.6/angular.js', 'angular-mocks-1.6/angular-mocks.js'],
  },
  {
    label: '1.7',
    files: ['angular/angular.js', 'angular-mocks/angular-mocks.js'],
  },
];

export function createWithEachNg1VersionFn(setNg1: typeof setAngularJSGlobal) {
  return (specSuite: () => void) => ng1Versions.forEach(({label, files}) => {
    describe(`[AngularJS v${label}]`, () => {
      // Problem:
      // As soon as `angular-mocks.js` is loaded, it runs `beforeEach` and `afterEach` to register
      // setup/tear down callbacks. Jasmine 2.9+ does not allow `beforeEach`/`afterEach` to be
      // nested inside a `beforeAll` call (only inside `describe`).
      // Hacky work-around:
      // Patch the affected jasmine methods while loading `angular-mocks.js` (inside `beforeAll`) to
      // capture the registered callbacks. Also, inside the `describe` call register a callback with
      // each affected method that runs all captured callbacks.
      // (Note: Currently, async callbacks are not supported, but that should be OK, since
      // `angular-mocks.js` does not use them.)
      const methodsToPatch = ['beforeAll', 'beforeEach', 'afterEach', 'afterAll'];
      const methodCallbacks = methodsToPatch.reduce<{[name: string]: any[]}>(
          (aggr, method) => ({...aggr, [method]: []}), {});
      const win = window as any;

      function patchJasmineMethods(): () => void {
        const originalMethods: {[name: string]: any} = {};

        methodsToPatch.forEach(method => {
          originalMethods[method] = win[method];
          win[method] = (cb: any) => methodCallbacks[method].push(cb);
        });

        return () => methodsToPatch.forEach(method => win[method] = originalMethods[method]);
      }

      beforeAll(done => {
        const restoreJasmineMethods = patchJasmineMethods();
        const onSuccess = () => {
          restoreJasmineMethods();
          done();
        };
        const onError = (err: any) => {
          restoreJasmineMethods();
          done.fail(err);
        };

        // Load AngularJS before running tests.
        files
            .reduce(
                (prev, file) => prev.then(() => new Promise<void>((resolve, reject) => {
                                            const script = document.createElement('script');
                                            script.async = true;
                                            script.onerror = reject;
                                            script.onload = () => {
                                              document.body.removeChild(script);
                                              resolve();
                                            };
                                            script.src = `base/ngdeps/node_modules/${file}`;
                                            document.body.appendChild(script);
                                          })),
                Promise.resolve())
            .then(() => setNg1(win.angular))
            .then(onSuccess, onError);

        // When Saucelabs is flaky, some browsers (esp. mobile) take some time to load and execute
        // the AngularJS scripts. Specifying a higher timeout here, reduces flaky-ness.
      }, 60000);

      afterAll(() => {
        // `win.angular` will not be defined if loading the script in `berofeAll()` failed. In that
        // case, avoid causing another error in `afterAll()`, because the reporter only shows the
        // most recent error (thus hiding the original, possibly more informative, error message).
        if (win.angular) {
          // In these tests we are loading different versions of AngularJS on the same window.
          // AngularJS leaves an "expandoId" property on `document`, which can trick subsequent
          // `window.angular` instances into believing an app is already bootstrapped.
          win.angular.element.cleanData([document]);
        }

        // Remove AngularJS to leave a clean state for subsequent tests.
        setNg1(undefined);
        delete win.angular;
      });

      methodsToPatch.forEach(method => win[method](function() {
                               // Run the captured callbacks. (Async callbacks not supported.)
                               methodCallbacks[method].forEach(cb => cb.call(this));
                             }));

      specSuite();
    });
  });
}

export function html(html: string): Element {
  // Don't return `body` itself, because using it as a `$rootElement` for ng1
  // will attach `$injector` to it and that will affect subsequent tests.
  const body = document.body;
  body.innerHTML = `<div>${html.trim()}</div>`;
  const div = document.body.firstChild as Element;

  if (div.childNodes.length === 1 && div.firstChild instanceof HTMLElement) {
    return div.firstChild;
  }

  return div;
}

export function multiTrim(text: string | null | undefined, allSpace = false): string {
  if (typeof text == 'string') {
    const repl = allSpace ? '' : ' ';
    return text.replace(/\n/g, '').replace(/\s+/g, repl).trim();
  }
  throw new Error('Argument can not be undefined.');
}

export function nodes(html: string) {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return Array.prototype.slice.call(div.childNodes);
}

export const withEachNg1Version = createWithEachNg1VersionFn(setAngularJSGlobal);
