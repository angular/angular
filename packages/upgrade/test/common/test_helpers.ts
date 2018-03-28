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
    files: ['angular/angular.js', 'angular-mocks/angular-mocks.js'],
  },
];

export function createWithEachNg1VersionFn(setNg1: typeof setAngularJSGlobal) {
  return (specSuite: () => void) => ng1Versions.forEach(({label, files}) => {
    describe(`[AngularJS v${label}]`, () => {
      beforeAll(done => {
        // Load AngularJS before running tests.
        files
            .reduce(
                (prev, file) => prev.then(() => new Promise<void>((resolve, reject) => {
                                            const script = document.createElement('script');
                                            script.src = `base/node_modules/${file}`;
                                            script.onerror = reject;
                                            script.onload = () => {
                                              document.body.removeChild(script);
                                              resolve();
                                            };
                                            document.body.appendChild(script);
                                          })),
                Promise.resolve())
            .then(() => setNg1((window as any).angular))
            .then(done, done.fail);
      });

      afterAll(() => {
        // In these tests we are loading different versions of AngularJS on the same window.
        // AngularJS leaves an "expandoId" property on `document`, which can trick subsequent
        // `window.angular` instances into believing an app is already bootstrapped.
        (window as any).angular.element(document).removeData();

        // Remove AngularJS to leave a clean state for subsequent tests.
        setNg1(undefined);
        delete (window as any).angular;
      });

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
