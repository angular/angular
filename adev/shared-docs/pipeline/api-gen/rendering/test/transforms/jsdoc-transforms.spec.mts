/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initHighlighter} from '../../../../shared/shiki.mjs';
import {setHighlighterInstance} from '../../shiki/shiki.mjs';
import {setCurrentSymbol, setSymbolMembers, setSymbols} from '../../symbol-context.mjs';
import {setDefinedRoutes} from '../../defined-routes-context.mjs';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlUsageNotes,
  setEntryFlags,
} from '../../transforms/jsdoc-transforms.mjs';

// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
describe('jsdoc transforms', () => {
  beforeAll(async () => {
    setHighlighterInstance(await initHighlighter());
  });

  afterEach(() => {
    setDefinedRoutes([]);
  });

  describe('addHtmlAdditionalLinks', () => {
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

    it('should convert backticks to code tags in markdown links', () => {
      const entry = addHtmlAdditionalLinks({
        jsdocTags: [
          {
            name: 'see',
            comment:
              '[Host view using `ViewContainerRef.createComponent`](guide/components/programmatic-rendering#host-view-using-viewcontainerrefcreatecomponent)',
          },
          {
            name: 'see',
            comment:
              '[Popup attached to `document.body` with `createComponent` + `hostElement`](guide/components/programmatic-rendering#popup-attached-to-documentbody-with-createcomponent--hostelement)',
          },
          {
            name: 'see',
            comment: '[Method with `backticks` in title](https://example.com "Title with `code`")',
          },
        ],
        moduleName: 'test',
      });

      expect(entry.additionalLinks[0]).toEqual({
        label: 'Host view using <code>ViewContainerRef.createComponent</code>',
        url: 'guide/components/programmatic-rendering#host-view-using-viewcontainerrefcreatecomponent',
        title: undefined,
      });

      expect(entry.additionalLinks[1]).toEqual({
        label:
          'Popup attached to <code>document.body</code> with <code>createComponent</code> + <code>hostElement</code>',
        url: 'guide/components/programmatic-rendering#popup-attached-to-documentbody-with-createcomponent--hostelement',
        title: undefined,
      });

      expect(entry.additionalLinks[2]).toEqual({
        label: 'Method with <code>backticks</code> in title',
        url: 'https://example.com',
        title: 'Title with `code`',
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

    it('should throw on a miscased absolute @link to a known API symbol', () => {
      setSymbols({RouterModule: 'router'});

      const entryFn = () =>
        addHtmlAdditionalLinks({
          jsdocTags: [
            {
              name: 'see',
              comment: '{@link /api/router/routerModule#forRoot forRoot}',
            },
          ],
          moduleName: 'test',
        });

      expect(entryFn).toThrowError(/Broken link.*Did you mean \/api\/router\/RouterModule/);
    });

    it('should throw on an unknown #member fragment for a known API symbol', () => {
      setSymbols({RouterModule: 'router'});
      setSymbolMembers(new Map([['RouterModule', new Set(['forRoot', 'forChild'])]]));

      const entryFn = () =>
        addHtmlAdditionalLinks({
          jsdocTags: [
            {
              name: 'see',
              comment: '{@link /api/router/RouterModule#forBogus forBogus}',
            },
          ],
          moduleName: 'test',
        });

      expect(entryFn).toThrowError(/Broken link.*RouterModule has no member named 'forBogus'/);
    });

    it('should throw on a miscased #member fragment for a known API symbol', () => {
      setSymbols({RouterModule: 'router'});
      setSymbolMembers(new Map([['RouterModule', new Set(['forRoot', 'forChild'])]]));

      const entryFn = () =>
        addHtmlAdditionalLinks({
          jsdocTags: [
            {
              name: 'see',
              comment: '{@link /api/router/RouterModule#forroot forRoot}',
            },
          ],
          moduleName: 'test',
        });

      expect(entryFn).toThrowError(/Broken link.*Did you mean #forRoot/);
    });

    it('should accept a valid #member fragment', () => {
      setSymbols({RouterModule: 'router'});
      setSymbolMembers(new Map([['RouterModule', new Set(['forRoot', 'forChild'])]]));

      const entry = addHtmlAdditionalLinks({
        jsdocTags: [
          {
            name: 'see',
            comment: '{@link /api/router/RouterModule#forRoot forRoot}',
          },
        ],
        moduleName: 'test',
      });

      expect(entry.additionalLinks[0]).toEqual({
        label: 'forRoot',
        url: '/api/router/RouterModule#forRoot',
      });
    });

    it('should accept known API section anchors as valid fragments', () => {
      // `#usage-notes`, `#description`, `#api`, `#pipe-usage` are emitted by the API page
      // template (`SectionHeading`) and are always present, even if they aren't members.
      setSymbols({ChangeDetectorRef: 'core'});
      setSymbolMembers(
        new Map([['ChangeDetectorRef', new Set(['detectChanges', 'markForCheck'])]]),
      );

      const entry = addHtmlAdditionalLinks({
        jsdocTags: [
          {
            name: 'see',
            comment: '{@link /api/core/ChangeDetectorRef#usage-notes Change detection usage}',
          },
        ],
        moduleName: 'test',
      });

      expect(entry.additionalLinks[0].url).toBe('/api/core/ChangeDetectorRef#usage-notes');
    });

    it('should throw on a /guide/ link to an unknown page', () => {
      setDefinedRoutes(['guide/signals/effect', 'guide/signals/effect#use-cases-for-effects']);

      const entryFn = () =>
        addHtmlAdditionalLinks({
          jsdocTags: [
            {
              name: 'see',
              comment: '{@link /guide/signals/non-existent Effect}',
            },
          ],
          moduleName: 'test',
        });

      expect(entryFn).toThrowError(/Broken link.*Unknown guide page guide\/signals\/non-existent/);
    });

    it('should throw on a /guide/ link with an unknown #fragment', () => {
      setDefinedRoutes([
        'guide/signals/effect',
        'guide/signals/effect#use-cases-for-effects',
        'guide/signals/effect#injection-context',
      ]);

      const entryFn = () =>
        addHtmlAdditionalLinks({
          jsdocTags: [
            {
              name: 'see',
              comment: '{@link /guide/signals/effect#effect-cleanup-functions Effect cleanup}',
            },
          ],
          moduleName: 'test',
        });

      expect(entryFn).toThrowError(
        /Broken link.*Page guide\/signals\/effect has no heading with id 'effect-cleanup-functions'/,
      );
    });

    it('should throw on a /guide/ link with a miscased #fragment and suggest the correct id', () => {
      setDefinedRoutes(['guide/signals/effect', 'guide/signals/effect#use-cases-for-effects']);

      const entryFn = () =>
        addHtmlAdditionalLinks({
          jsdocTags: [
            {
              name: 'see',
              comment: '{@link /guide/signals/effect#Use-Cases-For-Effects Use cases}',
            },
          ],
          moduleName: 'test',
        });

      expect(entryFn).toThrowError(/Broken link.*Did you mean #use-cases-for-effects/);
    });

    it('should accept a valid /guide/ link with a known #fragment', () => {
      setDefinedRoutes([
        'guide/signals/effect',
        'guide/signals/effect#use-cases-for-effects',
        'guide/signals/effect#injection-context',
      ]);

      const entry = addHtmlAdditionalLinks({
        jsdocTags: [
          {
            name: 'see',
            comment: '{@link /guide/signals/effect#injection-context Injection context}',
          },
        ],
        moduleName: 'test',
      });

      expect(entry.additionalLinks[0].url).toBe('/guide/signals/effect#injection-context');
    });

    it('should throw on a markdown @see link to an unknown /guide/ page', () => {
      setDefinedRoutes(['guide/di', 'guide/di/creating-and-using-services']);

      const entryFn = () =>
        addHtmlAdditionalLinks({
          jsdocTags: [
            {
              name: 'see',
              comment: '[No Existing services guide](guide/di/non-existent-page)',
            },
          ],
          moduleName: 'test',
        });

      expect(entryFn).toThrowError(/Broken link.*Unknown guide page guide\/di\/non-existent-page/);
    });

    it('should throw on a markdown @see link with an unknown #fragment', () => {
      setDefinedRoutes(['guide/di', 'guide/di#dependency-injection-in-angular']);

      const entryFn = () =>
        addHtmlAdditionalLinks({
          jsdocTags: [
            {
              name: 'see',
              comment: '[DI guide](guide/di#non-existent-section)',
            },
          ],
          moduleName: 'test',
        });

      expect(entryFn).toThrowError(
        /Broken link.*Page guide\/di has no heading with id 'non-existent-section'/,
      );
    });
  });

  describe('addHtmlDescription', () => {
    it('should throw on a broken markdown /guide/ link in the description', () => {
      setDefinedRoutes([
        'guide/directives/structural-directives',
        'guide/directives/structural-directives#structural-directive-shorthand',
      ]);

      const entryFn = () =>
        addHtmlDescription({
          description:
            'See the [shorthand form](guide/directives/structural-directives#bogus-anchor) for details.',
          moduleName: 'common',
        });

      expect(entryFn).toThrowError(
        /Broken link.*Page guide\/directives\/structural-directives has no heading with id 'bogus-anchor'/,
      );
    });

    it('should throw on a broken markdown /guide/ link in @usageNotes', () => {
      setDefinedRoutes(['guide/signals', 'guide/signals#computed-signals']);

      const entryFn = () =>
        addHtmlUsageNotes({
          jsdocTags: [
            {
              name: 'usageNotes',
              comment: 'Read the [signals guide](guide/signals/non-existent) for context.',
            },
          ],
        });

      expect(entryFn).toThrowError(/Broken link.*Unknown guide page guide\/signals\/non-existent/);
    });

    it('should accept a valid markdown /guide/ link in the description', () => {
      setDefinedRoutes([
        'guide/directives/structural-directives',
        'guide/directives/structural-directives#structural-directive-shorthand',
      ]);

      const entry = addHtmlDescription({
        description:
          'See the [shorthand form](guide/directives/structural-directives#structural-directive-shorthand) for details.',
        moduleName: 'common',
      });

      expect(entry.htmlDescription).toContain('shorthand form');
    });

    it('should parse markdown in descriptions', () => {
      setSymbols(
        Object.fromEntries([
          ['Route', 'test'],
          ['Router', 'angular/router'],
          ['Router.someMethod', 'test'],
          ['Router.someMethodWithParenthesis', 'test'],
          ['FormGroup', 'test'],
          ['FormGroup.someMethod', 'test'],
        ]),
      );

      const entry = addHtmlDescription({
        description: `
\`\`\`angular-ts
import { Router } from '@angular/router';

function setupRouter() {
  const router = inject(Router);
}
\`\`\`
      `,
        moduleName: 'test',
      });

      // Should have some shiki variables (meaning the description was highlighted).
      expect(entry.htmlDescription).toContain('--shiki');

      // Having docs-code means that the description was parsed and formatted correctly (by the shared marked renderer)
      expect(entry.htmlDescription).toContain('class="docs-code"');

      expect(entry.htmlDescription).toContain('/api/angular/router/Router');
    });

    it('should transform entry with different description & description tag', () => {
      const entry = addHtmlDescription({
        'description':
          "Enables interop with the browser's `Navigation` API for router navigations.",
        'jsdocTags': [
          {
            'name': 'description',
            'comment': 'This feature is _highly_ experimental ...',
          },
        ],
        'moduleName': 'platform-browser',
      });

      expect(entry.htmlDescription).toBe(`<p>This feature is <em>highly</em> experimental ...</p>`);
      expect(entry.shortHtmlDescription).toBe(
        `<p>Enables interop with the browser's <code>Navigation</code> API for router navigations.</p>`,
      );
    });
  });

  it('should only mark as deprecated if all overloads are deprecated', () => {
    const entry = setEntryFlags({
      name: 'Injectable',
      jsdocTags: [
        {'name': 'see', 'comment': '[Introduction to Services and DI](guide/di)'},
        {
          'name': 'see',
          'comment': '[Creating and using services](guide/di/creating-and-using-services)',
        },
      ],
      signatures: [
        {
          'parameters': [],
          'jsdocTags': [{'name': 'see', 'comment': '[Introduction to Services and DI](guide/di)'}],
        },
        {
          'parameters': [],
          'jsdocTags': [
            {
              'name': 'deprecated',
              'comment':
                "The `providedIn: NgModule` or `providedIn:'any'` options are deprecated. Please use the other signatures.",
            },
          ],
        },
      ],
    } as any);

    expect(entry.deprecated).toEqual(undefined);

    const deprecatedEntry = setEntryFlags({
      name: 'Injectable',
      jsdocTags: [
        {'name': 'see', 'comment': '[Introduction to Services and DI](guide/di)'},
        {
          'name': 'see',
          'comment': '[Creating and using services](guide/di/creating-and-using-services)',
        },
      ],
      signatures: [
        {
          'parameters': [],
          'jsdocTags': [
            {'name': 'see', 'comment': '[Introduction to Services and DI](guide/di)'},
            {'name': 'deprecated', 'comment': '19.0 something something'},
          ],
        },
        {
          'parameters': [],
          'jsdocTags': [{'name': 'deprecated', 'comment': '19.0 something something'}],
        },
      ],
    } as any);

    // It's deprecated by
    expect(deprecatedEntry.deprecated).toEqual({version: '19.0'});
  });
});
