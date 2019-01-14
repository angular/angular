/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AttributeMarker} from '@angular/compiler/src/core';
import {setup} from '@angular/compiler/test/aot/test_util';

import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from '../../../compiler/src/compiler';
import {decimalDigest} from '../../../compiler/src/i18n/digest';
import {extractMessages} from '../../../compiler/src/i18n/extractor_merger';
import {HtmlParser} from '../../../compiler/src/ml_parser/html_parser';

import {compile, expectEmit} from './mock_compile';

const angularFiles = setup({
  compileAngular: false,
  compileFakeCore: true,
  compileAnimations: false,
});

const htmlParser = new HtmlParser();

const diff = (a: Set<string>, b: Set<string>): Set<string> =>
    new Set([...Array.from(a)].filter(x => !b.has(x)));

const extract = (from: string, regex: any, transformFn: (match: any[]) => any) => {
  const result = new Set<string>();
  let item;
  while ((item = regex.exec(from)) !== null) {
    result.add(transformFn(item));
  }
  return result;
};

// verify that we extracted all the necessary translations
// and their ids match the ones extracted via 'ng xi18n'
const verifyTranslationIds =
    (source: string, output: string, exceptions = {},
     interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG) => {
      const parseResult = htmlParser.parse(source, 'path:://to/template', true);
      const extractedIdToMsg = new Map<string, any>();
      const extractedIds = new Set<string>();
      const generatedIds = new Set<string>();
      const msgs = extractMessages(parseResult.rootNodes, interpolationConfig, [], {});
      msgs.messages.forEach(msg => {
        const id = msg.id || decimalDigest(msg);
        extractedIds.add(id);
        extractedIdToMsg.set(id, msg);
      });
      const regexp = /const\s*MSG_EXTERNAL_(.+?)\s*=\s*goog\.getMsg/g;
      const ids = extract(output, regexp, v => v[1]);
      ids.forEach(id => { generatedIds.add(id.split('$$')[0]); });
      const delta = diff(extractedIds, generatedIds);
      if (delta.size) {
        // check if we have ids in exception list
        const outstanding = diff(delta, new Set(Object.keys(exceptions)));
        if (outstanding.size) {
          throw new Error(`
        Extracted and generated IDs don't match, delta:
        ${JSON.stringify(Array.from(delta))}
      `);
        }
      }
      return true;
    };

// verify that placeholders in translation string match
// placeholders object defined as goog.getMsg function argument
const verifyPlaceholdersIntegrity = (output: string) => {
  const extactTranslations = (from: string) => {
    const regex = /const\s*(.*?)\s*=\s*goog\.getMsg\("(.*?)",?\s*(.*?)\)/g;
    return extract(from, regex, v => [v[2], v[3]]);
  };
  const extractPlaceholdersFromBody = (body: string) => {
    const regex = /{\$(.*?)}/g;
    return extract(body, regex, v => v[1]);
  };
  const extractPlaceholdersFromArgs = (args: string) => {
    const regex = /\s+"(.+?)":\s*".*?"/g;
    return extract(args, regex, v => v[1]);
  };
  const translations = extactTranslations(output);
  translations.forEach((translation) => {
    const bodyPhs = extractPlaceholdersFromBody(translation[0]);
    const argsPhs = extractPlaceholdersFromArgs(translation[1]);
    if (bodyPhs.size !== argsPhs.size || diff(bodyPhs, argsPhs).size) {
      return false;
    }
  });
  return true;
};

const getAppFilesWithTemplate = (template: string, args: any = {}) => ({
  app: {
    'spec.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        selector: 'my-component',
        ${args.preserveWhitespaces ? 'preserveWhitespaces: true,' : ''}
        ${args.interpolation ? 'interpolation: ' + JSON.stringify(args.interpolation) + ', ' : ''}
        template: \`${template}\`
      })
      export class MyComponent {}

      @NgModule({declarations: [MyComponent]})
      export class MyModule {}
    `
  }
});

const maybePrint = (output: string, verbose: boolean) => {
  if (!verbose) return;
  // tslint:disable-next-line
  console.log(`
========== Generated output: ==========
${output}
=======================================
  `);
};

const verify = (input: string, output: string, extra: any = {}): void => {
  const files = getAppFilesWithTemplate(input, extra.inputArgs);
  const opts = (i18nUseExternalIds: boolean) =>
      ({i18nUseExternalIds, ...(extra.compilerOptions || {})});

  // invoke with file-based prefix translation names
  let result = compile(files, angularFiles, opts(false));
  maybePrint(result.source, extra.verbose);
  expect(verifyPlaceholdersIntegrity(result.source)).toBe(true);
  expectEmit(result.source, output, 'Incorrect template');

  if (extra.skipIdBasedCheck) return;

  // invoke with translation names based on external ids
  result = compile(files, angularFiles, opts(true));
  maybePrint(result.source, extra.verbose);
  const interpolationConfig = extra.inputArgs && extra.inputArgs.interpolation ?
      InterpolationConfig.fromArray(extra.inputArgs.interpolation) :
      undefined;
  expect(verifyTranslationIds(input, result.source, extra.exceptions, interpolationConfig))
      .toBe(true);
  expect(verifyPlaceholdersIntegrity(result.source)).toBe(true);
  expectEmit(result.source, output, 'Incorrect template');
};

describe('i18n support in the view compiler', () => {

  describe('element attributes', () => {
    it('should add the meaning and description as JsDoc comments', () => {
      const input = `
        <div i18n="meaningA|descA@@idA">Content A</div>
        <div i18n-title="meaningB|descB@@idB" title="Title B">Content B</div>
        <div i18n-title="meaningC" title="Title C">Content C</div>
        <div i18n-title="meaningD|descD" title="Title D">Content D</div>
        <div i18n-title="meaningE@@idE" title="Title E">Content E</div>
        <div i18n-title="@@idF" title="Title F">Content F</div>
        <div i18n-title="[BACKUP_MESSAGE_ID:idH]desc@@idG" title="Title G">Content G</div>
      `;

      const output = `
        /**
         * @desc descA
         * @meaning meaningA
         */
        const $MSG_EXTERNAL_idA$ = goog.getMsg("Content A");
        /**
         * @desc descB
         * @meaning meaningB
         */
        const $MSG_EXTERNAL_idB$ = goog.getMsg("Title B");
        const $_c0$ = ["title", $MSG_EXTERNAL_idB$];
        /**
         * @desc meaningC
         */
        const $MSG_EXTERNAL_4978592519614169666$$APP_SPEC_TS_3$ = goog.getMsg("Title C");
        const $_c1$ = ["title", $MSG_EXTERNAL_4978592519614169666$$APP_SPEC_TS_3$];
        /**
         * @desc descD
         * @meaning meaningD
         */
        const $MSG_EXTERNAL_5200291527729162531$$APP_SPEC_TS_5$ = goog.getMsg("Title D");
        const $_c2$ = ["title", $MSG_EXTERNAL_5200291527729162531$$APP_SPEC_TS_5$];
        /**
         * @desc meaningE
         */
        const $MSG_EXTERNAL_idE$$APP_SPEC_TS_7$ = goog.getMsg("Title E");
        const $_c3$ = ["title", $MSG_EXTERNAL_idE$$APP_SPEC_TS_7$];
        const $MSG_EXTERNAL_idF$$APP_SPEC_TS_9$ = goog.getMsg("Title F");
        const $_c4$ = ["title", $MSG_EXTERNAL_idF$$APP_SPEC_TS_9$];
        /**
         * @desc [BACKUP_MESSAGE_ID:idH]desc
         */
        const $MSG_EXTERNAL_idG$$APP_SPEC_TS_11$ = goog.getMsg("Title G");
        const $_c5$ = ["title", $MSG_EXTERNAL_idG$$APP_SPEC_TS_11$];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $MSG_EXTERNAL_idA$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(2, "div");
            $r3$.ɵi18nAttributes(3, $_c0$);
            $r3$.ɵtext(4, "Content B");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(5, "div");
            $r3$.ɵi18nAttributes(6, $_c1$);
            $r3$.ɵtext(7, "Content C");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(8, "div");
            $r3$.ɵi18nAttributes(9, $_c2$);
            $r3$.ɵtext(10, "Content D");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(11, "div");
            $r3$.ɵi18nAttributes(12, $_c3$);
            $r3$.ɵtext(13, "Content E");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(14, "div");
            $r3$.ɵi18nAttributes(15, $_c4$);
            $r3$.ɵtext(16, "Content F");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(17, "div");
            $r3$.ɵi18nAttributes(18, $_c5$);
            $r3$.ɵtext(19, "Content G");
            $r3$.ɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });

    it('should not create translations for empty attributes', () => {
      const input = `
        <div id="static" i18n-title="m|d" title></div>
      `;

      const output = `
        const $_c0$ = ["id", "static", "title", ""];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelement(0, "div", $_c0$);
          }
        }
      `;

      verify(input, output);
    });

    it('should translate static attributes', () => {
      const input = `
        <div id="static" i18n-title="m|d" title="introduction"></div>
      `;

      const output = `
        const $_c0$ = ["id", "static"];
        /**
         * @desc d
         * @meaning m
         */
        const $MSG_EXTERNAL_8809028065680254561$$APP_SPEC_TS_1$ = goog.getMsg("introduction");
        const $_c1$ = ["title", $MSG_EXTERNAL_8809028065680254561$$APP_SPEC_TS_1$];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $_c0$);
            $r3$.ɵi18nAttributes(1, $_c1$);
            $r3$.ɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });

    it('should support interpolation', () => {
      const input = `
        <div id="dynamic-1"
          i18n-title="m|d" title="intro {{ valueA | uppercase }}"
          i18n-aria-label="m1|d1" aria-label="{{ valueB }}"
          i18n-aria-roledescription aria-roledescription="static text"
        ></div>
        <div id="dynamic-2"
          i18n-title="m2|d2" title="{{ valueA }} and {{ valueB }} and again {{ valueA + valueB }}"
          i18n-aria-roledescription aria-roledescription="{{ valueC }}"
        ></div>
      `;

      const output = String.raw `
        const $_c0$ = ["id", "dynamic-1"];
        const $MSG_EXTERNAL_5526535577705876535$$APP_SPEC_TS_1$ = goog.getMsg("static text");
        /**
         * @desc d
         * @meaning m
         */
        const $MSG_EXTERNAL_8977039798304050198$$APP_SPEC_TS_2$ = goog.getMsg("intro {$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        /**
         * @desc d1
         * @meaning m1
         */
        const $MSG_EXTERNAL_7432761130955693041$$APP_SPEC_TS_3$ = goog.getMsg("{$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $_c1$ = [
          "aria-roledescription", $MSG_EXTERNAL_5526535577705876535$$APP_SPEC_TS_1$,
          "title", $MSG_EXTERNAL_8977039798304050198$$APP_SPEC_TS_2$,
          "aria-label", $MSG_EXTERNAL_7432761130955693041$$APP_SPEC_TS_3$
        ];
        const $_c2$ = ["id", "dynamic-2"];
        /**
         * @desc d2
         * @meaning m2
         */
        const $MSG_EXTERNAL_7566208596013750546$$APP_SPEC_TS_6$ = goog.getMsg("{$interpolation} and {$interpolation_1} and again {$interpolation_2}", {
          "interpolation": "\uFFFD0\uFFFD",
          "interpolation_1": "\uFFFD1\uFFFD",
          "interpolation_2": "\uFFFD2\uFFFD"
        });
        const $MSG_EXTERNAL_6639222533406278123$$APP_SPEC_TS_7$ = goog.getMsg("{$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $_c3$ = [
          "title", $MSG_EXTERNAL_7566208596013750546$$APP_SPEC_TS_6$,
          "aria-roledescription", $MSG_EXTERNAL_6639222533406278123$$APP_SPEC_TS_7$
        ];
        …
        consts: 5,
        vars: 8,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $_c0$);
            $r3$.ɵpipe(1, "uppercase");
            $r3$.ɵi18nAttributes(2, $_c1$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(3, "div", $_c2$);
            $r3$.ɵi18nAttributes(4, $_c3$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(1, 0, ctx.valueA)));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueB));
            $r3$.ɵi18nApply(2);
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueA));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueB));
            $r3$.ɵi18nExp($r3$.ɵbind((ctx.valueA + ctx.valueB)));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueC));
            $r3$.ɵi18nApply(4);
          }
        }
      `;

      verify(input, output);
    });

    it('should support interpolation with custom interpolation config', () => {
      const input = `
        <div i18n-title="m|d" title="intro {% valueA | uppercase %}"></div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_8977039798304050198$ = goog.getMsg("intro {$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $_c0$ = ["title", $MSG_EXTERNAL_8977039798304050198$];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵpipe(1, "uppercase");
            $r3$.ɵi18nAttributes(2, $_c0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(1, 0, ctx.valueA)));
            $r3$.ɵi18nApply(2);
          }
        }
      `;
      verify(input, output, {inputArgs: {interpolation: ['{%', '%}']}});
    });

    it('should correctly bind to context in nested template', () => {
      const input = `
        <div *ngFor="let outer of items">
          <div i18n-title="m|d" title="different scope {{ outer | uppercase }}"></div>
        </div>
      `;

      const output = String.raw `
        const $_c0$ = ["ngFor", "", ${AttributeMarker.SelectOnly}, "ngForOf"];
        /**
         * @desc d
         * @meaning m
         */
        const $MSG_EXTERNAL_8538466649243975456$$APP_SPEC_TS__1$ = goog.getMsg("different scope {$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $_c1$ = ["title", $MSG_EXTERNAL_8538466649243975456$$APP_SPEC_TS__1$];
        function MyComponent_div_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵpipe(2, "uppercase");
            $r3$.ɵi18nAttributes(3, $_c1$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            const $outer_r1$ = ctx.$implicit;
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(2, 0, $outer_r1$)));
            $r3$.ɵi18nApply(3);
          }
        }
        …
        consts: 1,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵtemplate(0, MyComponent_div_0_Template, 4, 3, "div", $_c0$);
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(0, "ngForOf", $r3$.ɵbind(ctx.items));
          }
        }
      `;

      verify(input, output);
    });

    it('should support interpolation', () => {
      const input = `
        <div id="dynamic-1"
          i18n-title="m|d" title="intro {{ valueA | uppercase }}"
          i18n-aria-label="m1|d1" aria-label="{{ valueB }}"
          i18n-aria-roledescription aria-roledescription="static text"
        ></div>
        <div id="dynamic-2"
          i18n-title="m2|d2" title="{{ valueA }} and {{ valueB }} and again {{ valueA + valueB }}"
          i18n-aria-roledescription aria-roledescription="{{ valueC }}"
        ></div>
      `;

      const output = String.raw `
        const $_c0$ = ["id", "dynamic-1"];
        const $MSG_EXTERNAL_5526535577705876535$$APP_SPEC_TS_1$ = goog.getMsg("static text");
        /**
         * @desc d
         * @meaning m
         */
        const $MSG_EXTERNAL_8977039798304050198$$APP_SPEC_TS_2$ = goog.getMsg("intro {$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        /**
         * @desc d1
         * @meaning m1
         */
        const $MSG_EXTERNAL_7432761130955693041$$APP_SPEC_TS_3$ = goog.getMsg("{$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $_c1$ = [
          "aria-roledescription", $MSG_EXTERNAL_5526535577705876535$$APP_SPEC_TS_1$,
          "title", $MSG_EXTERNAL_8977039798304050198$$APP_SPEC_TS_2$,
          "aria-label", $MSG_EXTERNAL_7432761130955693041$$APP_SPEC_TS_3$
        ];
        const $_c2$ = ["id", "dynamic-2"];
        /**
         * @desc d2
         * @meaning m2
         */
        const $MSG_EXTERNAL_7566208596013750546$$APP_SPEC_TS_6$ = goog.getMsg("{$interpolation} and {$interpolation_1} and again {$interpolation_2}", {
          "interpolation": "\uFFFD0\uFFFD",
          "interpolation_1": "\uFFFD1\uFFFD",
          "interpolation_2": "\uFFFD2\uFFFD"
        });
        const $MSG_EXTERNAL_6639222533406278123$$APP_SPEC_TS_7$ = goog.getMsg("{$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $_c3$ = [
          "title", $MSG_EXTERNAL_7566208596013750546$$APP_SPEC_TS_6$,
          "aria-roledescription", $MSG_EXTERNAL_6639222533406278123$$APP_SPEC_TS_7$
        ];
        …
        consts: 5,
        vars: 8,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $_c0$);
            $r3$.ɵpipe(1, "uppercase");
            $r3$.ɵi18nAttributes(2, $_c1$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(3, "div", $_c2$);
            $r3$.ɵi18nAttributes(4, $_c3$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(1, 0, ctx.valueA)));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueB));
            $r3$.ɵi18nApply(2);
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueA));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueB));
            $r3$.ɵi18nExp($r3$.ɵbind((ctx.valueA + ctx.valueB)));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueC));
            $r3$.ɵi18nApply(4);
          }
        }
      `;

      verify(input, output);
    });

    it('should correctly bind to context in nested template', () => {
      const input = `
        <div *ngFor="let outer of items">
          <div i18n-title="m|d" title="different scope {{ outer | uppercase }}"></div>
        </div>
      `;

      const output = String.raw `
        const $_c0$ = ["ngFor", "", ${AttributeMarker.SelectOnly}, "ngForOf"];
        /**
         * @desc d
         * @meaning m
         */
        const $MSG_EXTERNAL_8538466649243975456$$APP_SPEC_TS__1$ = goog.getMsg("different scope {$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $_c1$ = ["title", $MSG_EXTERNAL_8538466649243975456$$APP_SPEC_TS__1$];
        function MyComponent_div_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵpipe(2, "uppercase");
            $r3$.ɵi18nAttributes(3, $_c1$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            const $outer_r1$ = ctx.$implicit;
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(2, 0, $outer_r1$)));
            $r3$.ɵi18nApply(3);
          }
        }
        …
        consts: 1,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵtemplate(0, MyComponent_div_0_Template, 4, 3, "div", $_c0$);
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(0, "ngForOf", $r3$.ɵbind(ctx.items));
          }
        }
      `;

      verify(input, output);
    });

    it('should work correctly when placed on i18n root node', () => {
      const input = `
        <div i18n i18n-title="m|d" title="Element title">Some content</div>
      `;

      const output = String.raw `
        /**
         * @desc d
         * @meaning m
         */
        const $MSG_EXTERNAL_7727043314656808423$$APP_SPEC_TS_1$ = goog.getMsg("Element title");
        const $_c0$ = ["title", $MSG_EXTERNAL_7727043314656808423$$APP_SPEC_TS_1$];
        const $MSG_EXTERNAL_4969674997806975147$$APP_SPEC_TS_0$ = goog.getMsg("Some content");
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nAttributes(1, $_c0$);
            $r3$.ɵi18n(2, $MSG_EXTERNAL_4969674997806975147$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });
  });

  describe('nested nodes', () => {
    it('should not produce instructions for empty content', () => {
      const input = `
        <div i18n></div>
        <div i18n>  </div>
        <div i18n>

        </div>
      `;

      const output = String.raw `
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelement(0, "div");
            $r3$.ɵelement(1, "div");
            $r3$.ɵelement(2, "div");
          }
        }
      `;

      const exceptions = {
        '6524085439495453930': 'No translation is produced for empty content (whitespaces)',
        '814405839137385666': 'No translation is produced for empty content (line breaks)'
      };
      verify(input, output, {exceptions});
    });

    it('should properly escape quotes in content', () => {
      const input = `
        <div i18n>Some text 'with single quotes', "with double quotes" and without quotes.</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_4924931801512133405$$APP_SPEC_TS_0$ = goog.getMsg("Some text 'with single quotes', \"with double quotes\" and without quotes.");
      `;

      verify(input, output);
    });

    it('should handle i18n attributes with plain-text content', () => {
      const input = `
        <div i18n>My i18n block #1</div>
        <div>My non-i18n block #1</div>
        <div i18n>My i18n block #2</div>
        <div>My non-i18n block #2</div>
        <div i18n>My i18n block #3</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS_0$ = goog.getMsg("My i18n block #1");
        const $MSG_EXTERNAL_2413150872298537152$$APP_SPEC_TS_1$ = goog.getMsg("My i18n block #2");
        const $MSG_EXTERNAL_5023003143537152794$$APP_SPEC_TS_2$ = goog.getMsg("My i18n block #3");
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(2, "div");
            $r3$.ɵtext(3, "My non-i18n block #1");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(4, "div");
            $r3$.ɵi18n(5, $MSG_EXTERNAL_2413150872298537152$$APP_SPEC_TS_1$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(6, "div");
            $r3$.ɵtext(7, "My non-i18n block #2");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(8, "div");
            $r3$.ɵi18n(9, $MSG_EXTERNAL_5023003143537152794$$APP_SPEC_TS_2$);
            $r3$.ɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });

    it('should support named interpolations', () => {
      const input = `
        <div i18n>Some value: {{ valueA // i18n(ph="PH_A") }}</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_2817319788724342848$$APP_SPEC_TS_0$ = goog.getMsg("Some value: {$phA}", {
          "phA": "\uFFFD0\uFFFD"
        });
        …
        consts: 2,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $MSG_EXTERNAL_2817319788724342848$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueA));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should support interpolation with custom interpolation config', () => {
      const input = `
        <div i18n>{% valueA %}</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_6749967533321674787$ = goog.getMsg("{$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $MSG_EXTERNAL_6749967533321674787$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueA));
            $r3$.ɵi18nApply(1);
          }
        }
      `;
      verify(input, output, {inputArgs: {interpolation: ['{%', '%}']}});
    });

    it('should handle i18n attributes with bindings in content', () => {
      const input = `
        <div i18n>My i18n block #{{ one }}</div>
        <div i18n>My i18n block #{{ two | uppercase }}</div>
        <div i18n>My i18n block #{{ three + four + five }}</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_572579892698764378$$APP_SPEC_TS_0$ = goog.getMsg("My i18n block #{$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $MSG_EXTERNAL_609623417156596326$$APP_SPEC_TS_1$ = goog.getMsg("My i18n block #{$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $MSG_EXTERNAL_3998119318957372120$$APP_SPEC_TS_2$ = goog.getMsg("My i18n block #{$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        …
        consts: 7,
        vars: 5,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $MSG_EXTERNAL_572579892698764378$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(2, "div");
            $r3$.ɵi18n(3, $MSG_EXTERNAL_609623417156596326$$APP_SPEC_TS_1$);
            $r3$.ɵpipe(4, "uppercase");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(5, "div");
            $r3$.ɵi18n(6, $MSG_EXTERNAL_3998119318957372120$$APP_SPEC_TS_2$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.one));
            $r3$.ɵi18nApply(1);
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(4, 0, ctx.two)));
            $r3$.ɵi18nApply(3);
            $r3$.ɵi18nExp($r3$.ɵbind(((ctx.three + ctx.four) + ctx.five)));
            $r3$.ɵi18nApply(6);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle i18n attributes with bindings and nested elements in content', () => {
      const input = `
        <div i18n>
          My i18n block #{{ one }}
          <span>Plain text in nested element</span>
        </div>
        <div i18n>
          My i18n block #{{ two | uppercase }}
          <div>
            <div>
              <span>
                More bindings in more nested element: {{ nestedInBlockTwo }}
              </span>
            </div>
          </div>
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_7905233330103651696$$APP_SPEC_TS_0$ = goog.getMsg(" My i18n block #{$interpolation} {$startTagSpan}Plain text in nested element{$closeTagSpan}", {
          "interpolation": "\uFFFD0\uFFFD",
          "startTagSpan": "\uFFFD#2\uFFFD",
          "closeTagSpan": "\uFFFD/#2\uFFFD"
        });
        const $MSG_EXTERNAL_5788821996131681377$$APP_SPEC_TS_1$ = goog.getMsg(" My i18n block #{$interpolation} {$startTagDiv}{$startTagDiv}{$startTagSpan} More bindings in more nested element: {$interpolation_1} {$closeTagSpan}{$closeTagDiv}{$closeTagDiv}", {
          "interpolation": "\uFFFD0\uFFFD",
          "startTagDiv": "[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]",
          "startTagSpan": "\uFFFD#8\uFFFD",
          "interpolation_1": "\uFFFD1\uFFFD",
          "closeTagSpan": "\uFFFD/#8\uFFFD",
          "closeTagDiv": "[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]"
        });
        const $I18N_EXTERNAL_5788821996131681377$$APP_SPEC_TS_1$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_5788821996131681377$$APP_SPEC_TS_1$);
        …
        consts: 9,
        vars: 5,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_EXTERNAL_7905233330103651696$$APP_SPEC_TS_0$);
            $r3$.ɵelement(2, "span");
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(3, "div");
            $r3$.ɵi18nStart(4, $I18N_EXTERNAL_5788821996131681377$$APP_SPEC_TS_1$);
            $r3$.ɵpipe(5, "uppercase");
            $r3$.ɵelementStart(6, "div");
            $r3$.ɵelementStart(7, "div");
            $r3$.ɵelement(8, "span");
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.one));
            $r3$.ɵi18nApply(1);
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(5, 0, ctx.two)));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.nestedInBlockTwo));
            $r3$.ɵi18nApply(4);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle i18n attributes with bindings in content and element attributes', () => {
      const input = `
        <div i18n>
          My i18n block #1 with value: {{ valueA }}
          <span i18n-title title="Span title {{ valueB }} and {{ valueC }}">
            Plain text in nested element (block #1)
          </span>
        </div>
        <div i18n>
          My i18n block #2 with value {{ valueD | uppercase }}
          <span i18n-title title="Span title {{ valueE }}">
            Plain text in nested element (block #2)
          </span>
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_4782264005467235841$$APP_SPEC_TS_1$ = goog.getMsg("Span title {$interpolation} and {$interpolation_1}", {
          "interpolation": "\uFFFD0\uFFFD",
          "interpolation_1": "\uFFFD1\uFFFD"
        });
        const $_c0$ = ["title", $MSG_EXTERNAL_4782264005467235841$$APP_SPEC_TS_1$];
        const $MSG_EXTERNAL_4446430594603971069$$APP_SPEC_TS_0$ = goog.getMsg(" My i18n block #1 with value: {$interpolation} {$startTagSpan} Plain text in nested element (block #1) {$closeTagSpan}", {
          "interpolation": "\uFFFD0\uFFFD",
          "startTagSpan": "\uFFFD#2\uFFFD",
          "closeTagSpan": "\uFFFD/#2\uFFFD"
        });
        const $MSG_EXTERNAL_2719594642740200058$$APP_SPEC_TS_4$ = goog.getMsg("Span title {$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        const $_c1$ = ["title", $MSG_EXTERNAL_2719594642740200058$$APP_SPEC_TS_4$];
        const $MSG_EXTERNAL_2778714953278357902$$APP_SPEC_TS_3$ = goog.getMsg(" My i18n block #2 with value {$interpolation} {$startTagSpan} Plain text in nested element (block #2) {$closeTagSpan}", {
          "interpolation": "\uFFFD0\uFFFD",
          "startTagSpan": "\uFFFD#7\uFFFD",
          "closeTagSpan": "\uFFFD/#7\uFFFD"
        });
        …
        consts: 9,
        vars: 7,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_EXTERNAL_4446430594603971069$$APP_SPEC_TS_0$);
            $r3$.ɵelementStart(2, "span");
            $r3$.ɵi18nAttributes(3, $_c0$);
            $r3$.ɵelementEnd();
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(4, "div");
            $r3$.ɵi18nStart(5, $MSG_EXTERNAL_2778714953278357902$$APP_SPEC_TS_3$);
            $r3$.ɵpipe(6, "uppercase");
            $r3$.ɵelementStart(7, "span");
            $r3$.ɵi18nAttributes(8, $_c1$);
            $r3$.ɵelementEnd();
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueB));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueC));
            $r3$.ɵi18nApply(3);
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueA));
            $r3$.ɵi18nApply(1);
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.valueE));
            $r3$.ɵi18nApply(8);
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(6, 0, ctx.valueD)));
            $r3$.ɵi18nApply(5);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle i18n attributes in nested templates', () => {
      const input = `
        <div>
          Some content
          <div *ngIf="visible">
            <div i18n>
              Some other content {{ valueA }}
              <div>
                More nested levels with bindings {{ valueB | uppercase }}
              </div>
            </div>
          </div>
        </div>
      `;

      const output = String.raw `
        const $_c0$ = [${AttributeMarker.SelectOnly}, "ngIf"];
        const $MSG_EXTERNAL_7679414751795588050$$APP_SPEC_TS__1$ = goog.getMsg(" Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$closeTagDiv}", {
          "interpolation": "\uFFFD0\uFFFD",
          "startTagDiv": "\uFFFD#3\uFFFD",
          "interpolation_1": "\uFFFD1\uFFFD",
          "closeTagDiv": "\uFFFD/#3\uFFFD"
        });
        …
        function MyComponent_div_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵi18nStart(2, $MSG_EXTERNAL_7679414751795588050$$APP_SPEC_TS__1$);
            $r3$.ɵelement(3, "div");
            $r3$.ɵpipe(4, "uppercase");
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.valueA));
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(4, 0, $ctx_r0$.valueB)));
            $r3$.ɵi18nApply(2);
          }
        }
        …
        consts: 3,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵtext(1, " Some content ");
            $r3$.ɵtemplate(2, MyComponent_div_2_Template, 5, 4, "div", $_c0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(2, "ngIf", $r3$.ɵbind(ctx.visible));
          }
        }
      `;

      verify(input, output);
    });

    it('should ignore i18n attributes on self-closing tags', () => {
      const input = `
        <img src="logo.png" i18n />
        <img src="logo.png" i18n *ngIf="visible" />
        <img src="logo.png" i18n *ngIf="visible" i18n-title title="App logo #{{ id }}" />
      `;

      const output = String.raw `
        const $_c0$ = ["src", "logo.png"];
        const $_c1$ = [${AttributeMarker.SelectOnly}, "ngIf"];
        function MyComponent_img_1_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelement(0, "img", $_c0$);
          }
        }
        const $MSG_EXTERNAL_2367729185105559721$ = goog.getMsg("App logo #{$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        const $_c2$ = ["title", $MSG_EXTERNAL_2367729185105559721$];
        function MyComponent_img_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "img", $_c0$);
            $r3$.ɵi18nAttributes(1, $_c2$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            const $ctx_r1$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r1$.id));
            $r3$.ɵi18nApply(1);
          }
        }
        …
        consts: 3,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelement(0, "img", $_c0$);
            $r3$.ɵtemplate(1, MyComponent_img_1_Template, 1, 0, "img", $_c1$);
            $r3$.ɵtemplate(2, MyComponent_img_2_Template, 2, 1, "img", $_c1$);
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(1, "ngIf", $r3$.ɵbind(ctx.visible));
            $r3$.ɵelementProperty(2, "ngIf", $r3$.ɵbind(ctx.visible));
          }
        }
      `;

      verify(input, output);
    });

    it('should handle i18n context in nested templates', () => {
      const input = `
        <div i18n>
          Some content
          <div *ngIf="visible">
            Some other content {{ valueA }}
            <div>
              More nested levels with bindings {{ valueB | uppercase }}
              <div *ngIf="exists">
                Content inside sub-template {{ valueC }}
                <div>
                  Bottom level element {{ valueD }}
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="!visible">
            Some other content {{ valueE + valueF }}
            <div>
              More nested levels with bindings {{ valueG | uppercase }}
            </div>
          </div>
        </div>
      `;

      const output = String.raw `
        const $_c0$ = [${AttributeMarker.SelectOnly}, "ngIf"];
        function MyComponent_div_2_div_4_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $I18N_EXTERNAL_1221890473527419724$$APP_SPEC_TS_0$, 2);
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵelement(2, "div");
            $r3$.ɵelementEnd();
            $r3$.ɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r2$ = $r3$.ɵnextContext(2);
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r2$.valueC));
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r2$.valueD));
            $r3$.ɵi18nApply(0);
          }
        }
        function MyComponent_div_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $I18N_EXTERNAL_1221890473527419724$$APP_SPEC_TS_0$, 1);
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵelementStart(2, "div");
            $r3$.ɵpipe(3, "uppercase");
            $r3$.ɵtemplate(4, MyComponent_div_2_div_4_Template, 3, 2, "div", $_c1$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵelementProperty(4, "ngIf", $r3$.ɵbind($ctx_r0$.exists));
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.valueA));
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(3, 0, $ctx_r0$.valueB)));
            $r3$.ɵi18nApply(0);
          }
        }
        const $MSG_EXTERNAL_1221890473527419724$$APP_SPEC_TS_0$ = goog.getMsg(" Some content {$startTagDiv_2} Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$startTagDiv_1} Content inside sub-template {$interpolation_2} {$startTagDiv} Bottom level element {$interpolation_3} {$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$startTagDiv_3} Some other content {$interpolation_4} {$startTagDiv} More nested levels with bindings {$interpolation_5} {$closeTagDiv}{$closeTagDiv}", {
          "startTagDiv_2": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD",
          "closeTagDiv": "[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]",
          "startTagDiv_3": "\uFFFD*3:3\uFFFD\uFFFD#1:3\uFFFD",
          "interpolation": "\uFFFD0:1\uFFFD",
          "startTagDiv": "[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]",
          "interpolation_1": "\uFFFD1:1\uFFFD",
          "startTagDiv_1": "\uFFFD*4:2\uFFFD\uFFFD#1:2\uFFFD",
          "interpolation_2": "\uFFFD0:2\uFFFD",
          "interpolation_3": "\uFFFD1:2\uFFFD",
          "interpolation_4": "\uFFFD0:3\uFFFD",
          "interpolation_5": "\uFFFD1:3\uFFFD"
        });
        const $I18N_EXTERNAL_1221890473527419724$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_1221890473527419724$$APP_SPEC_TS_0$);
        function MyComponent_div_3_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $I18N_EXTERNAL_1221890473527419724$$APP_SPEC_TS_0$, 3);
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵelement(2, "div");
            $r3$.ɵpipe(3, "uppercase");
            $r3$.ɵelementEnd();
            $r3$.ɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r1$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind(($ctx_r1$.valueE + $ctx_r1$.valueF)));
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(3, 0, $ctx_r1$.valueG)));
            $r3$.ɵi18nApply(0);
          }
        }
        …
        consts: 4,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $I18N_EXTERNAL_1221890473527419724$$APP_SPEC_TS_0$);
            $r3$.ɵtemplate(2, MyComponent_div_2_Template, 5, 5, "div", $_c1$);
            $r3$.ɵtemplate(3, MyComponent_div_3_Template, 4, 4, "div", $_c1$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(2, "ngIf", $r3$.ɵbind(ctx.visible));
            $r3$.ɵelementProperty(3, "ngIf", $r3$.ɵbind(!ctx.visible));
          }
        }
      `;

      verify(input, output);
    });

    it('should handle i18n attribute with directives', () => {
      const input = `
        <div i18n *ngIf="visible">Some other content <span>{{ valueA }}</span></div>
      `;

      const output = String.raw `
        const $_c0$ = [${AttributeMarker.SelectOnly}, "ngIf"];
        const $MSG_EXTERNAL_119975189388320493$$APP_SPEC_TS__1$ = goog.getMsg("Some other content {$startTagSpan}{$interpolation}{$closeTagSpan}", {
          "startTagSpan": "\uFFFD#2\uFFFD",
          "interpolation": "\uFFFD0\uFFFD",
          "closeTagSpan": "\uFFFD/#2\uFFFD"
        });
        …
        function MyComponent_div_0_Template(rf, ctx) {
          if (rf & 1) {
              $r3$.ɵelementStart(0, "div");
              $r3$.ɵi18nStart(1, $MSG_EXTERNAL_119975189388320493$$APP_SPEC_TS__1$);
              $r3$.ɵelement(2, "span");
              $r3$.ɵi18nEnd();
              $r3$.ɵelementEnd();
          }
          if (rf & 2) {
              const $ctx_r0$ = $r3$.ɵnextContext();
              $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.valueA));
              $r3$.ɵi18nApply(1);
          }
        }
        …
        consts: 1,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵtemplate(0, MyComponent_div_0_Template, 3, 1, "div", $_c0$);
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(0, "ngIf", $r3$.ɵbind(ctx.visible));
          }
        }
      `;

      verify(input, output);
    });
  });

  describe('self-closing i18n instructions', () => {
    it('should be generated with text-only content', () => {
      const input = `
        <div i18n>My i18n block #1</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS_0$ = goog.getMsg("My i18n block #1");
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });

    it('should be generated for ICU-only i18n blocks', () => {
      const input = `
        <div i18n>{age, select, 10 {ten} 20 {twenty} other {other}}</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        const $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        …
        consts: 2,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.age));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should be generated within <ng-container> and <ng-template> blocks', () => {
      const input = `
        <ng-template i18n>My i18n block #1</ng-template>
        <ng-container i18n>My i18n block #2</ng-container>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_2413150872298537152$$APP_SPEC_TS_0$ = goog.getMsg("My i18n block #2");
        const $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS__1$ = goog.getMsg("My i18n block #1");
        function MyComponent_ng_template_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18n(0, $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS__1$);
          }
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵtemplate(0, MyComponent_ng_template_0_Template, 1, 0, "ng-template");
            $r3$.ɵelementContainerStart(1);
            $r3$.ɵi18n(2, $MSG_EXTERNAL_2413150872298537152$$APP_SPEC_TS_0$);
            $r3$.ɵelementContainerEnd();
          }
        }
      `;

      verify(input, output);
    });

    it('should not be generated in case we have styling instructions', () => {
      const input = `
        <span i18n class="myClass">Text #1</span>
        <span i18n style="padding: 10px;">Text #2</span>
      `;

      const output = String.raw `
        const $_c0$ = [${AttributeMarker.Classes}, "myClass"];
        const $MSG_EXTERNAL_5295701706185791735$$APP_SPEC_TS_0$ = goog.getMsg("Text #1");
        const $_c1$ = [${AttributeMarker.Styles}, "padding", "10px"];
        const $MSG_EXTERNAL_4722270221386399294$$APP_SPEC_TS_2$ = goog.getMsg("Text #2");
        …
        consts: 4,
        vars: 0,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "span", $_c0$);
            $r3$.ɵi18n(1, $MSG_EXTERNAL_5295701706185791735$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(2, "span", $_c1$);
            $r3$.ɵi18n(3, $MSG_EXTERNAL_4722270221386399294$$APP_SPEC_TS_2$);
            $r3$.ɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });
  });

  describe('ng-container and ng-template', () => {
    it('should handle single translation message using <ng-container>', () => {
      const input = `
        <ng-container i18n>Some content: {{ valueA | uppercase }}</ng-container>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_355394464191978948$$APP_SPEC_TS_0$ = goog.getMsg("Some content: {$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        …
        consts: 3,
        vars: 3,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementContainerStart(0);
            $r3$.ɵi18n(1, $MSG_EXTERNAL_355394464191978948$$APP_SPEC_TS_0$);
            $r3$.ɵpipe(2, "uppercase");
            $r3$.ɵelementContainerEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(2, 0, ctx.valueA)));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle single translation message using <ng-template>', () => {
      const input = `
        <ng-template i18n>Some content: {{ valueA | uppercase }}</ng-template>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_355394464191978948$$APP_SPEC_TS__0$ = goog.getMsg("Some content: {$interpolation}", {
          "interpolation": "\uFFFD0\uFFFD"
        });
        function MyComponent_ng_template_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18n(0, $MSG_EXTERNAL_355394464191978948$$APP_SPEC_TS__0$);
            $r3$.ɵpipe(1, "uppercase");
          } if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(1, 0, $ctx_r0$.valueA)));
            $r3$.ɵi18nApply(0);
          }
        }
        …
        consts: 1,
        vars: 0,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵtemplate(0, MyComponent_ng_template_0_Template, 2, 3, "ng-template");
          }
        }
      `;

      verify(input, output);
    });

    it('should be able to act as child elements inside i18n block', () => {
      const input = `
        <div i18n>
          <ng-template>Template content: {{ valueA | uppercase }}</ng-template>
          <ng-container>Container content: {{ valueB | uppercase }}</ng-container>
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_702706566400598764$$APP_SPEC_TS_0$ = goog.getMsg("{$startTagNgTemplate}Template content: {$interpolation}{$closeTagNgTemplate}{$startTagNgContainer}Container content: {$interpolation_1}{$closeTagNgContainer}", {
          "startTagNgTemplate": "\uFFFD*2:1\uFFFD",
          "closeTagNgTemplate": "\uFFFD/*2:1\uFFFD",
          "startTagNgContainer": "\uFFFD#3\uFFFD",
          "interpolation_1": "\uFFFD0\uFFFD",
          "closeTagNgContainer": "\uFFFD/#3\uFFFD",
          "interpolation": "\uFFFD0:1\uFFFD"
        });
        function MyComponent_ng_template_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18n(0, $MSG_EXTERNAL_702706566400598764$$APP_SPEC_TS_0$, 1);
            $r3$.ɵpipe(1, "uppercase");
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(1, 0, $ctx_r0$.valueA)));
            $r3$.ɵi18nApply(0);
          }
        }
        …
        consts: 5,
        vars: 3,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_EXTERNAL_702706566400598764$$APP_SPEC_TS_0$);
            $r3$.ɵtemplate(2, MyComponent_ng_template_2_Template, 2, 3, "ng-template");
            $r3$.ɵelementContainerStart(3);
            $r3$.ɵpipe(4, "uppercase");
            $r3$.ɵelementContainerEnd();
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(4, 0, ctx.valueB)));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle ICUs outside of translatable sections', () => {
      const input = `
        <ng-template>{gender, select, male {male} female {female} other {other}}</ng-template>
        <ng-container>{age, select, 10 {ten} 20 {twenty} other {other}}</ng-container>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        const $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS__1$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        const $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS__1$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS__1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        function MyComponent_ng_template_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18n(0, $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS__1$);
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.gender));
            $r3$.ɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵtemplate(0, MyComponent_ng_template_0_Template, 1, 1, "ng-template");
            $r3$.ɵelementContainerStart(1);
            $r3$.ɵi18n(2, $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$);
            $r3$.ɵelementContainerEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.age));
            $r3$.ɵi18nApply(2);
          }
        }
      `;

      verify(input, output);
    });

    it('should correctly propagate i18n context through nested templates', () => {
      const input = `
        <div i18n>
          <ng-template>
            Template A: {{ valueA | uppercase }}
            <ng-template>
              Template B: {{ valueB }}
              <ng-template>
                Template C: {{ valueC }}
              </ng-template>
            </ng-template>
          </ng-template>
        </div>
      `;

      const output = String.raw `
        function MyComponent_ng_template_2_ng_template_2_ng_template_1_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18n(0, $I18N_EXTERNAL_2051477021417799640$$APP_SPEC_TS_0$, 3);
          }
          if (rf & 2) {
            const $ctx_r2$ = $r3$.ɵnextContext(3);
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r2$.valueC));
            $r3$.ɵi18nApply(0);
          }
        }
        function MyComponent_ng_template_2_ng_template_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $I18N_EXTERNAL_2051477021417799640$$APP_SPEC_TS_0$, 2);
            $r3$.ɵtemplate(1, MyComponent_ng_template_2_ng_template_2_ng_template_1_Template, 1, 1, "ng-template");
            $r3$.ɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r1$ = $r3$.ɵnextContext(2);
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r1$.valueB));
            $r3$.ɵi18nApply(0);
          }
        }
        const $MSG_EXTERNAL_2051477021417799640$$APP_SPEC_TS_0$ = goog.getMsg("{$startTagNgTemplate} Template A: {$interpolation} {$startTagNgTemplate} Template B: {$interpolation_1} {$startTagNgTemplate} Template C: {$interpolation_2} {$closeTagNgTemplate}{$closeTagNgTemplate}{$closeTagNgTemplate}", {
          "startTagNgTemplate": "[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]",
          "closeTagNgTemplate": "[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]",
          "interpolation": "\uFFFD0:1\uFFFD",
          "interpolation_1": "\uFFFD0:2\uFFFD",
          "interpolation_2": "\uFFFD0:3\uFFFD"
        });
        const $I18N_EXTERNAL_2051477021417799640$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_2051477021417799640$$APP_SPEC_TS_0$);
        function MyComponent_ng_template_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $I18N_EXTERNAL_2051477021417799640$$APP_SPEC_TS_0$, 1);
            $r3$.ɵpipe(1, "uppercase");
            $r3$.ɵtemplate(2, MyComponent_ng_template_2_ng_template_2_Template, 2, 1, "ng-template");
            $r3$.ɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(1, 0, $ctx_r0$.valueA)));
            $r3$.ɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 0,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $I18N_EXTERNAL_2051477021417799640$$APP_SPEC_TS_0$);
            $r3$.ɵtemplate(2, MyComponent_ng_template_2_Template, 3, 3, "ng-template");
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });

    it('should work with ICUs', () => {
      const input = `
        <ng-container i18n>{gender, select, male {male} female {female} other {other}}</ng-container>
        <ng-template i18n>{age, select, 10 {ten} 20 {twenty} other {other}}</ng-template>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        const $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS__1$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        const $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS__1$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS__1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        function MyComponent_ng_template_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18n(0, $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS__1$);
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.age));
            $r3$.ɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementContainerStart(0);
            $r3$.ɵi18n(1, $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$);
            $r3$.ɵelementContainerEnd();
            $r3$.ɵtemplate(2, MyComponent_ng_template_2_Template, 1, 1, "ng-template");
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle self-closing tags as content', () => {
      const input = `
        <ng-container i18n>
          <img src="logo.png" title="Logo" /> is my logo #1
        </ng-container>
        <ng-template i18n>
          <img src="logo.png" title="Logo" /> is my logo #2
        </ng-template>
      `;

      const output = String.raw `
        const $_c0$ = ["src", "logo.png", "title", "Logo"];
        const $MSG_EXTERNAL_4891196282781544695$$APP_SPEC_TS_0$ = goog.getMsg("{$tagImg} is my logo #1 ", {
          "tagImg": "\uFFFD#2\uFFFD\uFFFD/#2\uFFFD"
        });
        const $MSG_EXTERNAL_461986953980355147$$APP_SPEC_TS__2$ = goog.getMsg("{$tagImg} is my logo #2 ", {
          "tagImg": "\uFFFD#1\uFFFD\uFFFD/#1\uFFFD"
        });
        function MyComponent_ng_template_3_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $MSG_EXTERNAL_461986953980355147$$APP_SPEC_TS__2$);
            $r3$.ɵelement(1, "img", $_c0$);
            $r3$.ɵi18nEnd();
          }
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementContainerStart(0);
            $r3$.ɵi18nStart(1, $MSG_EXTERNAL_4891196282781544695$$APP_SPEC_TS_0$);
            $r3$.ɵelement(2, "img", $_c0$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementContainerEnd();
            $r3$.ɵtemplate(3, MyComponent_ng_template_3_Template, 2, 0, "ng-template");
          }
        }
      `;

      verify(input, output);
    });
  });

  describe('whitespace preserving mode', () => {
    it('should keep inner content of i18n block as is', () => {
      const input = `
        <div i18n>
          Some text
          <span>Text inside span</span>
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_963542717423364282$$APP_SPEC_TS_0$ = goog.getMsg("\n          Some text\n          {$startTagSpan}Text inside span{$closeTagSpan}\n        ", {
          "startTagSpan": "\uFFFD#3\uFFFD",
          "closeTagSpan": "\uFFFD/#3\uFFFD"
        });
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵtext(0, "\n        ");
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵi18nStart(2, $MSG_EXTERNAL_963542717423364282$$APP_SPEC_TS_0$);
            $r3$.ɵelement(3, "span");
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵtext(4, "\n      ");
          }
        }
      `;

      verify(input, output, {inputArgs: {preserveWhitespaces: true}});
    });
  });

  describe('icu logic', () => {
    it('should handle single icus', () => {
      const input = `
        <div i18n>{gender, select, male {male} female {female} other {other}}</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        const $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        …
        consts: 2,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should properly escape quotes in content', () => {
      const input = `
        <div i18n>{gender, select, single {'single quotes'} double {"double quotes"} other {other}}</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_4166854826696768832$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, single {'single quotes'} double {\"double quotes\"} other {other}}");
        const $I18N_EXTERNAL_4166854826696768832$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_4166854826696768832$$APP_SPEC_TS_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
      `;

      verify(input, output);
    });

    it('should support ICU-only templates', () => {
      const input = `
        {age, select, 10 {ten} 20 {twenty} other {other}}
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        const $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$, { "VAR_SELECT": "\uFFFD0\uFFFD" });
        …
        consts: 1,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18n(0, $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$);
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.age));
            $r3$.ɵi18nApply(0);
          }
        }
      `;

      verify(input, output);
    });

    it('should generate i18n instructions for icus generated outside of i18n blocks', () => {
      const input = `
        <div>{gender, select, male {male} female {female} other {other}}</div>
        <div *ngIf="visible" title="icu only">
          {age, select, 10 {ten} 20 {twenty} other {other}}
        </div>
        <div *ngIf="available" title="icu and text">
          You have {count, select, 0 {no emails} 1 {one email} other {{{count}} emails}}.
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        const $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $_c0$ = [${AttributeMarker.SelectOnly}, "ngIf"];
        const $_c1$ = ["title", "icu only"];
        const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS__3$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        const $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS__3$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS__3$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        function MyComponent_div_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $_c1$);
            $r3$.ɵi18n(1, $I18N_EXTERNAL_8806993169187953163$$APP_SPEC_TS__3$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.age));
            $r3$.ɵi18nApply(1);
          }
        }
        const $_c2$ = ["title", "icu and text"];
        const $MSG_EXTERNAL_1922743304863699161$$APP_SPEC_TS__5$ = goog.getMsg("{VAR_SELECT, select, 0 {no emails} 1 {one email} other {{$interpolation} emails}}", {
          "interpolation": "\uFFFD1\uFFFD"
        });
        const $I18N_EXTERNAL_1922743304863699161$$APP_SPEC_TS__5$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_1922743304863699161$$APP_SPEC_TS__5$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        function MyComponent_div_3_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $_c2$);
            $r3$.ɵtext(1, " You have ");
            $r3$.ɵi18n(2, $I18N_EXTERNAL_1922743304863699161$$APP_SPEC_TS__5$);
            $r3$.ɵtext(3, ". ");
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            const $ctx_r1$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r1$.count));
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r1$.count));
            $r3$.ɵi18nApply(2);
          }
        }
        …
        consts: 4,
        vars: 3,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
            $r3$.ɵtemplate(2, MyComponent_div_2_Template, 2, 1, "div", $_c0$);
            $r3$.ɵtemplate(3, MyComponent_div_3_Template, 4, 2, "div", $_c0$);
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nApply(1);
            $r3$.ɵelementProperty(2, "ngIf", $r3$.ɵbind(ctx.visible));
            $r3$.ɵelementProperty(3, "ngIf", $r3$.ɵbind(ctx.available));
          }
        }
      `;

      verify(input, output);
    });

    it('should support interpolation with custom interpolation config', () => {
      const input = `
        <div i18n>{age, select, 10 {ten} 20 {twenty} other {{% other %}}}</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_2949673783721159566$$RAW$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {{$interpolation}}}", {
          "interpolation": "\uFFFD1\uFFFD"
        });
        const $MSG_EXTERNAL_2949673783721159566$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_2949673783721159566$$RAW$, { "VAR_SELECT": "\uFFFD0\uFFFD" });
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $MSG_EXTERNAL_2949673783721159566$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.age));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.other));
            $r3$.ɵi18nApply(1);
          }
        }
      `;
      verify(input, output, {inputArgs: {interpolation: ['{%', '%}']}});
    });

    it('should handle icus with html', () => {
      const input = `
        <div i18n>
          {gender, select, male {male - <b>male</b>} female {female <b>female</b>} other {<div class="other"><i>other</i></div>}}
          <b>Other content</b>
          <div class="other"><i>Another content</i></div>
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_2417296354340576868$$APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male - {$startBoldText}male{$closeBoldText}} female {female {$startBoldText}female{$closeBoldText}} other {{$startTagDiv}{$startItalicText}other{$closeItalicText}{$closeTagDiv}}}", {
          "startBoldText": "<b>",
          "closeBoldText": "</b>",
          "startItalicText": "<i>",
          "closeItalicText": "</i>",
          "startTagDiv": "<div class=\"other\">",
          "closeTagDiv": "</div>"
        });
        const $I18N_EXTERNAL_2417296354340576868$$APP_SPEC_TS_1$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_2417296354340576868$$APP_SPEC_TS_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $_c0$ = ["other", 1, "other", true];
        const $MSG_EXTERNAL_5791551881115084301$$APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$startBoldText}Other content{$closeBoldText}{$startTagDiv}{$startItalicText}Another content{$closeItalicText}{$closeTagDiv}", {
          "startBoldText": "\uFFFD#2\uFFFD",
          "closeBoldText": "\uFFFD/#2\uFFFD",
          "startTagDiv": "\uFFFD#3\uFFFD",
          "startItalicText": "\uFFFD#4\uFFFD",
          "closeItalicText": "\uFFFD/#4\uFFFD",
          "closeTagDiv": "\uFFFD/#3\uFFFD",
          "icu": $I18N_EXTERNAL_2417296354340576868$$APP_SPEC_TS_1$
        });
        …
        consts: 5,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_EXTERNAL_5791551881115084301$$APP_SPEC_TS_0$);
            $r3$.ɵelement(2, "b");
            $r3$.ɵelementStart(3, "div");
            $r3$.ɵelementStyling($_c0$);
            $r3$.ɵelement(4, "i");
            $r3$.ɵelementEnd();
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle icus with expressions', () => {
      const input = `
        <div i18n>{gender, select, male {male of age: {{ ageA + ageB + ageC }}} female {female} other {other}}</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_6879461626778511059$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male of age: {$interpolation}} female {female} other {other}}", {
          "interpolation": "\uFFFD1\uFFFD"
        });
        const $I18N_EXTERNAL_6879461626778511059$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_6879461626778511059$$APP_SPEC_TS_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        …
        consts: 2,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $I18N_EXTERNAL_6879461626778511059$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nExp($r3$.ɵbind(((ctx.ageA + ctx.ageB) + ctx.ageC)));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle multiple icus in one block', () => {
      const input = `
        <div i18n>
          {gender, select, male {male} female {female} other {other}}
          {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        const $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $MSG_EXTERNAL_7068143081688428291$$APP_SPEC_TS_2$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}");
        const $I18N_EXTERNAL_7068143081688428291$$APP_SPEC_TS_2$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_7068143081688428291$$APP_SPEC_TS_2$, {
          "VAR_SELECT": "\uFFFD1\uFFFD"
        });
        const $MSG_EXTERNAL_2967249209167308918$$APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$icu_1}", {
          "icu": $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$,
          "icu_1": $I18N_EXTERNAL_7068143081688428291$$APP_SPEC_TS_2$
        });
        …
        consts: 2,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $MSG_EXTERNAL_2967249209167308918$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.age));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle multiple icus that share same placeholder', () => {
      const input = `
        <div i18n>
          {gender, select, male {male} female {female} other {other}}
          <div>
            {gender, select, male {male} female {female} other {other}}
          </div>
          <div *ngIf="visible">
            {gender, select, male {male} female {female} other {other}}
          </div>
        </div>
      `;

      const output = String.raw `
        const $MSG_APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        const $I18N_APP_SPEC_TS_1$ = $r3$.ɵi18nPostprocess($MSG_APP_SPEC_TS_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $MSG_APP_SPEC_TS_2$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        const $I18N_APP_SPEC_TS_2$ = $r3$.ɵi18nPostprocess($MSG_APP_SPEC_TS_2$, {
          "VAR_SELECT": "\uFFFD1\uFFFD"
        });
        const $_c3$ = [${AttributeMarker.SelectOnly}, "ngIf"];
        const $MSG_APP_SPEC_TS__4$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        const $I18N_APP_SPEC_TS__4$ = $r3$.ɵi18nPostprocess($MSG_APP_SPEC_TS__4$, {
          "VAR_SELECT": "\uFFFD0:1\uFFFD"
        });
        const $MSG_APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$startTagDiv}{$icu}{$closeTagDiv}{$startTagDiv_1}{$icu}{$closeTagDiv}", {
          "startTagDiv": "\uFFFD#2\uFFFD",
          "closeTagDiv": "[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]",
          "startTagDiv_1": "\uFFFD*3:1\uFFFD\uFFFD#1:1\uFFFD",
          "icu": "\uFFFDI18N_EXP_ICU\uFFFD"
        });
        const $I18N_APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_APP_SPEC_TS_0$, {
          "ICU": [$I18N_APP_SPEC_TS_1$, $I18N_APP_SPEC_TS_2$, $I18N_APP_SPEC_TS__4$]
        });
        function MyComponent_div_3_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $I18N_APP_SPEC_TS_0$, 1);
            $r3$.ɵelement(1, "div");
            $r3$.ɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.gender));
            $r3$.ɵi18nApply(0);
          }
        }
        …
        consts: 4,
        vars: 3,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $I18N_APP_SPEC_TS_0$);
            $r3$.ɵelement(2, "div");
            $r3$.ɵtemplate(3, MyComponent_div_3_Template, 2, 1, "div", $_c3$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(3, "ngIf", $r3$.ɵbind(ctx.visible));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      // TODO(akushnir): this use-case is currently supported with
      // file-based prefix for translation const names. Translation statements
      // caching is required to support this use-case (FW-635) with id-based consts.
      verify(input, output, {skipIdBasedCheck: true});
    });

    it('should handle nested icus', () => {
      const input = `
        <div i18n>
          {gender, select,
            male {male of age: {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}}
            female {female}
            other {other}
          }
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_343563413083115114$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT_1, select, male {male of age: {VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}} female {female} other {other}}");
        const $I18N_EXTERNAL_343563413083115114$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_343563413083115114$$APP_SPEC_TS_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD",
          "VAR_SELECT_1": "\uFFFD1\uFFFD"
        });
        …
        consts: 2,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $I18N_EXTERNAL_343563413083115114$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.age));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      const exceptions = {
        '3052001905251380936': 'Wrapper message generated by "ng xi18n" around ICU: "  {$ICU}  "'
      };
      verify(input, output, {exceptions});
    });

    it('should handle icus in different contexts', () => {
      const input = `
        <div i18n>
          {gender, select, male {male} female {female} other {other}}
          <span *ngIf="ageVisible">
            {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}
          </span>
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        const $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $_c0$ = [${AttributeMarker.SelectOnly}, "ngIf"];
        const $MSG_EXTERNAL_7068143081688428291$$APP_SPEC_TS__3$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}");
        const $I18N_EXTERNAL_7068143081688428291$$APP_SPEC_TS__3$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_7068143081688428291$$APP_SPEC_TS__3$, {
          "VAR_SELECT": "\uFFFD0:1\uFFFD"
        });
        const $MSG_EXTERNAL_1194472282609532229$$APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$startTagSpan}{$icu_1}{$closeTagSpan}", {
          "startTagSpan": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD",
          "closeTagSpan": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD",
          "icu": $I18N_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$,
          "icu_1": $I18N_EXTERNAL_7068143081688428291$$APP_SPEC_TS__3$
        });
        function MyComponent_span_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $MSG_EXTERNAL_1194472282609532229$$APP_SPEC_TS_0$, 1);
            $r3$.ɵelement(1, "span");
            $r3$.ɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.age));
            $r3$.ɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_EXTERNAL_1194472282609532229$$APP_SPEC_TS_0$);
            $r3$.ɵtemplate(2, MyComponent_span_2_Template, 2, 1, "span", $_c2$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(2, "ngIf", $r3$.ɵbind(ctx.ageVisible));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle icus with interpolations', () => {
      const input = `
        <div i18n>
          {gender, select, male {male {{ weight }}} female {female {{ height }}} other {other}}
          <span *ngIf="ageVisible">
            {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {{ otherAge }}}}
          </span>
        </div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_7825031864601787094$$APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male {$interpolation}} female {female {$interpolation_1}} other {other}}", {
          "interpolation": "\uFFFD1\uFFFD",
          "interpolation_1": "\uFFFD2\uFFFD"
        });
        const $I18N_EXTERNAL_7825031864601787094$$APP_SPEC_TS_1$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_7825031864601787094$$APP_SPEC_TS_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $_c0$ = [${AttributeMarker.SelectOnly}, "ngIf"];
        const $MSG_EXTERNAL_2310343208266678305$$APP_SPEC_TS__3$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {$interpolation}}}", {
          "interpolation": "\uFFFD1:1\uFFFD"
        });
        const $I18N_EXTERNAL_2310343208266678305$$APP_SPEC_TS__3$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_2310343208266678305$$APP_SPEC_TS__3$, {
          "VAR_SELECT": "\uFFFD0:1\uFFFD"
        });
        const $MSG_EXTERNAL_7186042105600518133$$APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$startTagSpan}{$icu_1}{$closeTagSpan}", {
          "startTagSpan": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD",
          "closeTagSpan": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD",
          "icu": $I18N_EXTERNAL_7825031864601787094$$APP_SPEC_TS_1$,
          "icu_1": $I18N_EXTERNAL_2310343208266678305$$APP_SPEC_TS__3$
        });
        function MyComponent_span_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $MSG_EXTERNAL_7186042105600518133$$APP_SPEC_TS_0$, 1);
            $r3$.ɵelement(1, "span");
            $r3$.ɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.age));
            $r3$.ɵi18nExp($r3$.ɵbind($ctx_r0$.otherAge));
            $r3$.ɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 4,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_EXTERNAL_7186042105600518133$$APP_SPEC_TS_0$);
            $r3$.ɵtemplate(2, MyComponent_span_2_Template, 2, 2, "span", $_c2$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(2, "ngIf", $r3$.ɵbind(ctx.ageVisible));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.weight));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.height));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });

    it('should handle icus with named interpolations', () => {
      const input = `
        <div i18n>{
          gender,
          select,
            male {male {{ weight // i18n(ph="PH_A") }}}
            female {female {{ height // i18n(ph="PH_B") }}}
            other {other {{ age // i18n(ph="PH_C") }}}
        }</div>
      `;

      const output = String.raw `
        const $MSG_EXTERNAL_4853189513362404940$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male {$phA}} female {female {$phB}} other {other {$phC}}}", {
          "phA": "\uFFFD1\uFFFD",
          "phB": "\uFFFD2\uFFFD",
          "phC": "\uFFFD3\uFFFD"
        });
        const $I18N_EXTERNAL_4853189513362404940$$APP_SPEC_TS_0$ = $r3$.ɵi18nPostprocess($MSG_EXTERNAL_4853189513362404940$$APP_SPEC_TS_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        …
        consts: 2,
        vars: 4,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18n(1, $I18N_EXTERNAL_4853189513362404940$$APP_SPEC_TS_0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.gender));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.weight));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.height));
            $r3$.ɵi18nExp($r3$.ɵbind(ctx.age));
            $r3$.ɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
    });
  });

  describe('errors', () => {
    it('should throw on nested i18n sections', () => {
      const files = getAppFilesWithTemplate(`
        <div i18n><div i18n>Some content</div></div>
      `);
      expect(() => compile(files, angularFiles))
          .toThrowError(
              'Could not mark an element as translatable inside of a translatable section');
    });

  });
});
