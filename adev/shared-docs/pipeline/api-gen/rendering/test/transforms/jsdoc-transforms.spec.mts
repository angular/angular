/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setCurrentSymbol, setSymbols} from '../../symbol-context.mjs';
import {addHtmlAdditionalLinks} from '../../transforms/jsdoc-transforms.mjs';

// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
describe('jsdoc transforms', () => {
  it('should transform links', () => {
    setCurrentSymbol('Router');
    setSymbols(
      Object.fromEntries([
        ['Route', 'test'],
        ['Router', 'test'],
        ['Router.someMethod', 'test'],
        ['Router.someMethodWithParenthesis', 'test'],
        ['FormGroup', 'test'],
        ['FormGroup.someMethod', 'test'],
      ]),
    );

    const entry = addHtmlAdditionalLinks({
      jsdocTags: [
        {
          name: 'see',
          comment: '[Angular](https://angular.io)',
        },
        {
          name: 'see',
          comment: '[Angular](https://angular.io "Angular")',
        },
        {
          name: 'see',
          comment: '{@link Route}',
        },
        {
          name: 'see',
          comment: '{@link Route Something else}',
        },
        {
          name: 'see',
          comment: '{@link #someMethod}',
        },
        {
          name: 'see',
          comment: '{@link #someMethodWithParenthesis()}',
        },
        {
          name: 'see',
          comment: '{@link someMethod()}',
        },
        {
          name: 'see',
          comment: '{@link FormGroup.someMethod()}',
        },
        {
          name: 'see',
          comment: '{@link https://angular.dev/api/core/ApplicationRef}',
        },
        {
          name: 'see',
          comment: '{@link https://angular.dev}',
        },
        {
          name: 'see',
          comment: '{@link /cli/build ng build}',
        },
        {
          name: 'see',
          comment: '{@link /ecosystem/rxjs-interop/output-interop Output Interop}',
        },
      ],
      moduleName: 'test',
    });

    expect(entry.additionalLinks[0]).toEqual({
      label: 'Angular',
      url: 'https://angular.io',
      title: undefined,
    });

    expect(entry.additionalLinks[1]).toEqual({
      label: 'Angular',
      url: 'https://angular.io',
      title: 'Angular',
    });

    expect(entry.additionalLinks[2]).toEqual({
      label: 'Route',
      url: '/api/test/Route',
    });

    expect(entry.additionalLinks[3]).toEqual({
      label: 'Something else',
      url: '/api/test/Route',
    });

    expect(entry.additionalLinks[4]).toEqual({
      label: 'someMethod',
      url: '/api/test/Router#someMethod',
    });
    expect(entry.additionalLinks[5]).toEqual({
      label: 'someMethodWithParenthesis()',
      url: '/api/test/Router#someMethodWithParenthesis',
    });
    expect(entry.additionalLinks[6]).toEqual({
      label: 'someMethod()',
      url: '/api/test/Router#someMethod',
    });
    expect(entry.additionalLinks[7]).toEqual({
      label: 'FormGroup.someMethod()',
      url: '/api/test/FormGroup#someMethod',
    });

    expect(entry.additionalLinks[8]).toEqual({
      label: 'ApplicationRef',
      url: 'https://angular.dev/api/core/ApplicationRef',
    });
    expect(entry.additionalLinks[9]).toEqual({
      label: 'angular.dev',
      url: 'https://angular.dev',
    });

    expect(entry.additionalLinks[10]).toEqual({
      label: 'ng build',
      url: '/cli/build',
    });

    expect(entry.additionalLinks[11]).toEqual({
      label: 'Output Interop',
      url: '/ecosystem/rxjs-interop/output-interop',
    });
  });

  it('should throw on invalid relatie @link', () => {
    const entryFn = () =>
      addHtmlAdditionalLinks({
        jsdocTags: [
          {
            name: 'see',
            comment: '{@link cli/build ng build}',
          },
        ],
        moduleName: 'test',
      });

    expect(entryFn).toThrowError(/Forbidden relative link: cli\/build ng build/);
  });
});
