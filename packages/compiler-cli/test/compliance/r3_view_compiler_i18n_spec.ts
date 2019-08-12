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

// TODO: update translation extraction RegExp to support i18nLocalize calls once #28689 lands.
const EXTRACT_GENERATED_TRANSLATIONS_REGEXP =
    /const\s*(.*?)\s*=\s*goog\.getMsg\("(.*?)",?\s*(.*?)\)/g;

const diff = (a: Set<string>, b: Set<string>): Set<string> =>
    new Set([...Array.from(a)].filter(x => !b.has(x)));

const extract = (from: string, regex: any, transformFn: (match: any[], state: Set<any>) => any) => {
  const result = new Set<any>();
  let item;
  while ((item = regex.exec(from)) !== null) {
    result.add(transformFn(item, result));
  }
  return result;
};

// verify that we extracted all the necessary translations
// and their ids match the ones extracted via 'ng xi18n'
const verifyTranslationIds =
    (source: string, output: string, exceptions = {},
     interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG) => {
      const parseResult =
          htmlParser.parse(source, 'path:://to/template', {tokenizeExpansionForms: true});
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
  const extractTranslations = (from: string) => {
    return extract(from, EXTRACT_GENERATED_TRANSLATIONS_REGEXP, v => [v[2], v[3]]);
  };
  const extractPlaceholdersFromBody = (body: string) => {
    const regex = /{\$(.*?)}/g;
    return extract(body, regex, v => v[1]);
  };
  const extractPlaceholdersFromArgs = (args: string) => {
    const regex = /\s+"(.+?)":\s*".*?"/g;
    return extract(args, regex, v => v[1]);
  };
  const translations = extractTranslations(output);
  translations.forEach((translation) => {
    const bodyPhs = extractPlaceholdersFromBody(translation[0]);
    const argsPhs = extractPlaceholdersFromArgs(translation[1]);
    if (bodyPhs.size !== argsPhs.size || diff(bodyPhs, argsPhs).size) {
      return false;
    }
  });
  return true;
};

const verifyUniqueConsts = (output: string) => {
  extract(
      output, EXTRACT_GENERATED_TRANSLATIONS_REGEXP,
      (current: string[], state: Set<any>): string => {
        const key = current[1];
        if (state.has(key)) {
          throw new Error(`Duplicate const ${key} found in generated output!`);
        }
        return key;
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
  if (!extra.skipPathBasedCheck) {
    const result = compile(files, angularFiles, opts(false));
    maybePrint(result.source, extra.verbose);
    expect(verifyPlaceholdersIntegrity(result.source)).toBe(true);
    expect(verifyUniqueConsts(result.source)).toBe(true);
    expectEmit(result.source, output, 'Incorrect template');
  }

  // invoke with translation names based on external ids
  if (!extra.skipIdBasedCheck) {
    const result = compile(files, angularFiles, opts(true));
    maybePrint(result.source, extra.verbose);
    const interpolationConfig = extra.inputArgs && extra.inputArgs.interpolation ?
        InterpolationConfig.fromArray(extra.inputArgs.interpolation) :
        undefined;
    expect(verifyTranslationIds(input, result.source, extra.exceptions, interpolationConfig))
        .toBe(true);
    expect(verifyPlaceholdersIntegrity(result.source)).toBe(true);
    expect(verifyUniqueConsts(result.source)).toBe(true);
    expectEmit(result.source, output, 'Incorrect template');
  }
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            /**
             * @desc descA
             * @meaning meaningA
             */
            const $MSG_EXTERNAL_idA$$APP_SPEC_TS_1$ = goog.getMsg("Content A");
            $I18N_0$ = $MSG_EXTERNAL_idA$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("Content A");
        }
        const $_c2$ = [${AttributeMarker.I18n}, "title"];
        var $I18N_3$;
        if (ngI18nClosureMode) {
            /**
             * @desc descB
             * @meaning meaningB
             */
            const $MSG_EXTERNAL_idB$$APP_SPEC_TS_4$ = goog.getMsg("Title B");
            $I18N_3$ = $MSG_EXTERNAL_idB$$APP_SPEC_TS_4$;
        }
        else {
            $I18N_3$ = $r3$.ɵɵi18nLocalize("Title B");
        }
        const $_c5$ = ["title", $I18N_3$];
        var $I18N_7$;
        if (ngI18nClosureMode) {
            /**
             * @desc meaningC
             */
            const $MSG_EXTERNAL_4978592519614169666$$APP_SPEC_TS_8$ = goog.getMsg("Title C");
            $I18N_7$ = $MSG_EXTERNAL_4978592519614169666$$APP_SPEC_TS_8$;
        }
        else {
            $I18N_7$ = $r3$.ɵɵi18nLocalize("Title C");
        }
        const $_c9$ = ["title", $I18N_7$];
        var $I18N_11$;
        if (ngI18nClosureMode) {
            /**
             * @desc descD
             * @meaning meaningD
             */
            const $MSG_EXTERNAL_5200291527729162531$$APP_SPEC_TS_12$ = goog.getMsg("Title D");
            $I18N_11$ = $MSG_EXTERNAL_5200291527729162531$$APP_SPEC_TS_12$;
        }
        else {
            $I18N_11$ = $r3$.ɵɵi18nLocalize("Title D");
        }
        const $_c13$ = ["title", $I18N_11$];
        var $I18N_15$;
        if (ngI18nClosureMode) {
            /**
             * @desc meaningE
             */
            const $MSG_EXTERNAL_idE$$APP_SPEC_TS_16$ = goog.getMsg("Title E");
            $I18N_15$ = $MSG_EXTERNAL_idE$$APP_SPEC_TS_16$;
        }
        else {
            $I18N_15$ = $r3$.ɵɵi18nLocalize("Title E");
        }
        const $_c17$ = ["title", $I18N_15$];
        var $I18N_19$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_idF$$APP_SPEC_TS_20$ = goog.getMsg("Title F");
            $I18N_19$ = $MSG_EXTERNAL_idF$$APP_SPEC_TS_20$;
        }
        else {
            $I18N_19$ = $r3$.ɵɵi18nLocalize("Title F");
        }
        const $_c21$ = ["title", $I18N_19$];
        var $I18N_23$;
        if (ngI18nClosureMode) {
            /**
             * @desc [BACKUP_MESSAGE_ID:idH]desc
             */
            const $MSG_EXTERNAL_idG$$APP_SPEC_TS_24$ = goog.getMsg("Title G");
            $I18N_23$ = $MSG_EXTERNAL_idG$$APP_SPEC_TS_24$;
        }
        else {
            $I18N_23$ = $r3$.ɵɵi18nLocalize("Title G");
        }
        const $_c25$ = ["title", $I18N_23$];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(2, "div", $_c2$);
            $r3$.ɵɵi18nAttributes(3, $_c5$);
            $r3$.ɵɵtext(4, "Content B");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(5, "div", $_c6$);
            $r3$.ɵɵi18nAttributes(6, $_c9$);
            $r3$.ɵɵtext(7, "Content C");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(8, "div", $_c10$);
            $r3$.ɵɵi18nAttributes(9, $_c13$);
            $r3$.ɵɵtext(10, "Content D");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(11, "div", $_c14$);
            $r3$.ɵɵi18nAttributes(12, $_c17$);
            $r3$.ɵɵtext(13, "Content E");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(14, "div", $_c18$);
            $r3$.ɵɵi18nAttributes(15, $_c21$);
            $r3$.ɵɵtext(16, "Content F");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(17, "div", $_c22$);
            $r3$.ɵɵi18nAttributes(18, $_c25$);
            $r3$.ɵɵtext(19, "Content G");
            $r3$.ɵɵelementEnd();
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
            $r3$.ɵɵelement(0, "div", $_c0$);
          }
        }
      `;

      verify(input, output);
    });

    it('should not create translations for bound attributes', () => {
      const input = `
        <div
          [title]="title" i18n-title
          [attr.label]="label" i18n-attr.label>
        </div>
      `;

      const output = `
        const $_c0$ = [3, "title"];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelement(0, "div", $_c0$);
          }
          if (rf & 2) {
            $r3$.ɵɵproperty("title", ctx.title);
            $r3$.ɵɵattribute("label", ctx.label);
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
        const $_c0$ = ["id", "static", ${AttributeMarker.I18n}, "title"];
        var $I18N_1$;
        if (ngI18nClosureMode) {
          /**
           * @desc d
           * @meaning m
           */
          const $MSG_EXTERNAL_8809028065680254561$$APP_SPEC_TS_1$ = goog.getMsg("introduction");
          $I18N_1$ = $MSG_EXTERNAL_8809028065680254561$$APP_SPEC_TS_1$;
        }
        else {
          $I18N_1$ = $r3$.ɵɵi18nLocalize("introduction");
        }
        const $_c1$ = ["title", $I18N_1$];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $_c0$);
            $r3$.ɵɵi18nAttributes(1, $_c1$);
            $r3$.ɵɵelementEnd();
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
        const $_c0$ = ["id", "dynamic-1", ${AttributeMarker.I18n}, "aria-roledescription", "title", "aria-label"];
        var $I18N_1$;
        if (ngI18nClosureMode) {
          const $MSG_EXTERNAL_5526535577705876535$$APP_SPEC_TS_1$ = goog.getMsg("static text");
          $I18N_1$ = $MSG_EXTERNAL_5526535577705876535$$APP_SPEC_TS_1$;
        }
        else {
          $I18N_1$ = $r3$.ɵɵi18nLocalize("static text");
        }
        var $I18N_2$;
        if (ngI18nClosureMode) {
          /**
           * @desc d
           * @meaning m
           */
          const $MSG_EXTERNAL_8977039798304050198$$APP_SPEC_TS_2$ = goog.getMsg("intro {$interpolation}", {
            "interpolation": "\uFFFD0\uFFFD"
          });
          $I18N_2$ = $MSG_EXTERNAL_8977039798304050198$$APP_SPEC_TS_2$;
        }
        else {
          $I18N_2$ = $r3$.ɵɵi18nLocalize("intro {$interpolation}", {
            "interpolation": "\uFFFD0\uFFFD"
          });
        }
        var $I18N_3$;
        if (ngI18nClosureMode) {
            /**
             * @desc d1
             * @meaning m1
             */
            const $MSG_EXTERNAL_7432761130955693041$$APP_SPEC_TS_3$ = goog.getMsg("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_3$ = $MSG_EXTERNAL_7432761130955693041$$APP_SPEC_TS_3$;
        }
        else {
            $I18N_3$ = $r3$.ɵɵi18nLocalize("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        const $_c1$ = [
          "aria-roledescription", $I18N_1$,
          "title", $I18N_2$,
          "aria-label", $I18N_3$
        ];
        const $_c2$ = ["id", "dynamic-2", ${AttributeMarker.I18n}, "title", "aria-roledescription"];
        var $I18N_6$;
        if (ngI18nClosureMode) {
            /**
             * @desc d2
             * @meaning m2
             */
            const $MSG_EXTERNAL_7566208596013750546$$APP_SPEC_TS_6$ = goog.getMsg("{$interpolation} and {$interpolation_1} and again {$interpolation_2}", {
              "interpolation": "\uFFFD0\uFFFD", "interpolation_1": "\uFFFD1\uFFFD", "interpolation_2": "\uFFFD2\uFFFD"
            });
            $I18N_6$ = $MSG_EXTERNAL_7566208596013750546$$APP_SPEC_TS_6$;
        }
        else {
            $I18N_6$ = $r3$.ɵɵi18nLocalize("{$interpolation} and {$interpolation_1} and again {$interpolation_2}", {
              "interpolation": "\uFFFD0\uFFFD", "interpolation_1": "\uFFFD1\uFFFD", "interpolation_2": "\uFFFD2\uFFFD"
            });
        }
        var $I18N_7$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_6639222533406278123$$APP_SPEC_TS_7$ = goog.getMsg("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_7$ = $MSG_EXTERNAL_6639222533406278123$$APP_SPEC_TS_7$;
        }
        else {
            $I18N_7$ = $r3$.ɵɵi18nLocalize("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        const $_c3$ = [
          "title", $I18N_6$,
          "aria-roledescription", $I18N_7$
        ];
        …
        consts: 5,
        vars: 8,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $_c0$);
            $r3$.ɵɵpipe(1, "uppercase");
            $r3$.ɵɵi18nAttributes(2, $_c1$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(3, "div", $_c2$);
            $r3$.ɵɵi18nAttributes(4, $_c3$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 6, ctx.valueA))(ctx.valueB);
            $r3$.ɵɵi18nApply(2);
            $r3$.ɵɵselect(3);
            $r3$.ɵɵi18nExp(ctx.valueA)(ctx.valueB)(ctx.valueA + ctx.valueB)(ctx.valueC);
            $r3$.ɵɵi18nApply(4);
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
        const $_c0$ = [${AttributeMarker.I18n}, "title"];
        var $I18N_1$;
        if (ngI18nClosureMode) {
            /**
             * @desc d
             * @meaning m
             */
            const $MSG_EXTERNAL_8977039798304050198$ = goog.getMsg("intro {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_1$ = $MSG_EXTERNAL_8977039798304050198$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("intro {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        const $_c3$ = ["title", $I18N_1$];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $_c0$);
            $r3$.ɵɵpipe(1, "uppercase");
            $r3$.ɵɵi18nAttributes(2, $_c3$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 1, ctx.valueA));
            $r3$.ɵɵi18nApply(2);
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
        const $_c0$ = [${AttributeMarker.Template}, "ngFor", "ngForOf"];
        const $_c1$ = [${AttributeMarker.I18n}, "title"];
        var $I18N_1$;
        if (ngI18nClosureMode) {
            /**
             * @desc d
             * @meaning m
             */
            const $MSG_EXTERNAL_8538466649243975456$$APP_SPEC_TS__1$ = goog.getMsg("different scope {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_1$ = $MSG_EXTERNAL_8538466649243975456$$APP_SPEC_TS__1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("different scope {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        const $_c2$ = ["title", $I18N_1$];
        function MyComponent_div_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵelementStart(1, "div", $_c1$);
            $r3$.ɵɵpipe(2, "uppercase");
            $r3$.ɵɵi18nAttributes(3, $_c2$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $outer_r1$ = ctx.$implicit;
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(2, 1, $outer_r1$));
            $r3$.ɵɵi18nApply(3);
          }
        }
        …
        consts: 1,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 3, "div", $_c0$);
          }
          if (rf & 2) {
            $r3$.ɵɵproperty("ngForOf", ctx.items);
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
        const $_c0$ = [
          "id", "dynamic-1",
          ${AttributeMarker.I18n}, "aria-roledescription", "title", "aria-label"
        ];
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_5526535577705876535$$APP_SPEC_TS_1$ = goog.getMsg("static text");
            $I18N_1$ = $MSG_EXTERNAL_5526535577705876535$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("static text");
        }
        var $I18N_2$;
        if (ngI18nClosureMode) {
            /**
             * @desc d
             * @meaning m
             */
            const $MSG_EXTERNAL_8977039798304050198$$APP_SPEC_TS_2$ = goog.getMsg("intro {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_2$ = $MSG_EXTERNAL_8977039798304050198$$APP_SPEC_TS_2$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("intro {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        var $I18N_3$;
        if (ngI18nClosureMode) {
            /**
             * @desc d1
             * @meaning m1
             */
            const $MSG_EXTERNAL_7432761130955693041$$APP_SPEC_TS_3$ = goog.getMsg("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_3$ = $MSG_EXTERNAL_7432761130955693041$$APP_SPEC_TS_3$;
        }
        else {
            $I18N_3$ = $r3$.ɵɵi18nLocalize("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        const $_c1$ = [
          "aria-roledescription", $I18N_1$,
          "title", $I18N_2$,
          "aria-label", $I18N_3$
        ];
        const $_c2$ = ["id", "dynamic-2", ${AttributeMarker.I18n}, "title", "aria-roledescription"];
        var $I18N_6$;
        if (ngI18nClosureMode) {
            /**
             * @desc d2
             * @meaning m2
             */
            const $MSG_EXTERNAL_7566208596013750546$$APP_SPEC_TS_6$ = goog.getMsg("{$interpolation} and {$interpolation_1} and again {$interpolation_2}", {
              "interpolation": "\uFFFD0\uFFFD", "interpolation_1": "\uFFFD1\uFFFD", "interpolation_2": "\uFFFD2\uFFFD"
            });
            $I18N_6$ = $MSG_EXTERNAL_7566208596013750546$$APP_SPEC_TS_6$;
        }
        else {
            $I18N_6$ = $r3$.ɵɵi18nLocalize("{$interpolation} and {$interpolation_1} and again {$interpolation_2}", {
              "interpolation": "\uFFFD0\uFFFD", "interpolation_1": "\uFFFD1\uFFFD", "interpolation_2": "\uFFFD2\uFFFD"
            });
        }
        var $I18N_7$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_6639222533406278123$$APP_SPEC_TS_7$ = goog.getMsg("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_7$ = $MSG_EXTERNAL_6639222533406278123$$APP_SPEC_TS_7$;
        }
        else {
            $I18N_7$ = $r3$.ɵɵi18nLocalize("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        const $_c3$ = [
          "title", $I18N_6$,
          "aria-roledescription", $I18N_7$
        ];
        …
        consts: 5,
        vars: 8,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $_c0$);
            $r3$.ɵɵpipe(1, "uppercase");
            $r3$.ɵɵi18nAttributes(2, $_c1$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(3, "div", $_c2$);
            $r3$.ɵɵi18nAttributes(4, $_c3$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 6, ctx.valueA))(ctx.valueB);
            $r3$.ɵɵi18nApply(2);
            $r3$.ɵɵselect(3);
            $r3$.ɵɵi18nExp(ctx.valueA)(ctx.valueB)(ctx.valueA + ctx.valueB)(ctx.valueC);
            $r3$.ɵɵi18nApply(4);
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
        const $_c0$ = [${AttributeMarker.Template}, "ngFor", "ngForOf"];
        const $_c1$ = [${AttributeMarker.I18n}, "title"];
        var $I18N_2$;
        if (ngI18nClosureMode) {
            /**
             * @desc d
             * @meaning m
             */
            const $MSG_EXTERNAL_8538466649243975456$$APP_SPEC_TS__3$ = goog.getMsg("different scope {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_2$ = $MSG_EXTERNAL_8538466649243975456$$APP_SPEC_TS__3$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("different scope {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        const $_c4$ = ["title", $I18N_2$];
        function MyComponent_div_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵelementStart(1, "div", $_c1$);
            $r3$.ɵɵpipe(2, "uppercase");
            $r3$.ɵɵi18nAttributes(3, $_c4$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $outer_r1$ = ctx.$implicit;
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(2, 1, $outer_r1$));
            $r3$.ɵɵi18nApply(3);
          }
        }
        …
        consts: 1,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 3, "div", $_c0$);
          }
          if (rf & 2) {
            $r3$.ɵɵproperty("ngForOf", ctx.items);
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
        const $_c0$ = [${AttributeMarker.I18n}, "title"];
        var $I18N_0$;
        if (ngI18nClosureMode) {
            /**
             * @desc d
             * @meaning m
             */
            const $MSG_EXTERNAL_7727043314656808423$$APP_SPEC_TS_0$ = goog.getMsg("Element title");
            $I18N_0$ = $MSG_EXTERNAL_7727043314656808423$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("Element title");
        }
        const $_c1$ = ["title", $I18N_0$];
        var $I18N_2$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4969674997806975147$$APP_SPEC_TS_2$ = goog.getMsg("Some content");
            $I18N_2$ = $MSG_EXTERNAL_4969674997806975147$$APP_SPEC_TS_2$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("Some content");
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $_c0$);
            $r3$.ɵɵi18nAttributes(1, $_c1$);
            $r3$.ɵɵi18n(2, $I18N_2$);
            $r3$.ɵɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });

    it('should sanitize ids and generate proper var names', () => {
      const input = `
        <div i18n="@@ID.WITH.INVALID.CHARS.2" i18n-title="@@ID.WITH.INVALID.CHARS" title="Element title">
          Some content
        </div>
      `;

      const output = String.raw `
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_ID_WITH_INVALID_CHARS$$APP_SPEC_TS_1$ = goog.getMsg("Element title");
            $I18N_0$ = $MSG_EXTERNAL_ID_WITH_INVALID_CHARS$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("Element title");
        }
        const $_c1$ = ["title", $I18N_0$];
        var $I18N_2$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_ID_WITH_INVALID_CHARS_2$$APP_SPEC_TS_4$ = goog.getMsg(" Some content ");
            $I18N_2$ = $MSG_EXTERNAL_ID_WITH_INVALID_CHARS_2$$APP_SPEC_TS_4$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize(" Some content ");
        }
        …
      `;

      const exceptions = {
        'ID.WITH.INVALID.CHARS': 'Verify const name generation only',
        'ID.WITH.INVALID.CHARS.2': 'Verify const name generation only'
      };
      verify(input, output, {exceptions, skipPathBasedCheck: true});
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
            $r3$.ɵɵelement(0, "div");
            $r3$.ɵɵelement(1, "div");
            $r3$.ɵɵelement(2, "div");
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4924931801512133405$$APP_SPEC_TS_0$ = goog.getMsg("Some text 'with single quotes', \"with double quotes\" and without quotes.");
            $I18N_0$ = $MSG_EXTERNAL_4924931801512133405$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("Some text 'with single quotes', \"with double quotes\" and without quotes.");
        }
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS_0$ = goog.getMsg("My i18n block #1");
            $I18N_0$ = $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("My i18n block #1");
        }
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2413150872298537152$$APP_SPEC_TS_1$ = goog.getMsg("My i18n block #2");
            $I18N_1$ = $MSG_EXTERNAL_2413150872298537152$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("My i18n block #2");
        }
        var $I18N_2$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_5023003143537152794$$APP_SPEC_TS_2$ = goog.getMsg("My i18n block #3");
            $I18N_2$ = $MSG_EXTERNAL_5023003143537152794$$APP_SPEC_TS_2$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("My i18n block #3");
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(2, "div");
            $r3$.ɵɵtext(3, "My non-i18n block #1");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(4, "div");
            $r3$.ɵɵi18n(5, $I18N_1$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(6, "div");
            $r3$.ɵɵtext(7, "My non-i18n block #2");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(8, "div");
            $r3$.ɵɵi18n(9, $I18N_2$);
            $r3$.ɵɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });

    it('should support named interpolations', () => {
      const input = `
        <div i18n>
          Named interpolation: {{ valueA // i18n(ph="PH_A") }}
          Named interpolation with spaces: {{ valueB // i18n(ph="PH B") }}
        </div>
      `;

      const output = String.raw `
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7597881511811528589$$APP_SPEC_TS_0$ = goog.getMsg(" Named interpolation: {$phA} Named interpolation with spaces: {$phB} ", {
              "phA": "\uFFFD0\uFFFD",
              "phB": "\uFFFD1\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_7597881511811528589$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize(" Named interpolation: {$phA} Named interpolation with spaces: {$phB} ", {
              "phA": "\uFFFD0\uFFFD",
              "phB": "\uFFFD1\uFFFD"
            });
        }
        …
        consts: 2,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.valueA)(ctx.valueB);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_6749967533321674787$$APP_SPEC_TS_0$ = goog.getMsg("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_6749967533321674787$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.valueA);
            $r3$.ɵɵi18nApply(1);
          }
        }
      `;
      verify(input, output, {inputArgs: {interpolation: ['{%', '%}']}});
    });

    it('should support interpolations with complex expressions', () => {
      const input = `
        <div i18n>
          {{ valueA | async }}
          {{ valueA?.a?.b }}
        </div>
      `;

      const output = String.raw `
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_1482713963707913023$$APP_SPEC_TS_0$ = goog.getMsg(" {$interpolation} {$interpolation_1} ", {
              "interpolation": "\uFFFD0\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_1482713963707913023$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize(" {$interpolation} {$interpolation_1} ", {
              "interpolation": "\uFFFD0\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD"
            });
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵpipe(2, "async");
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(2, 2, ctx.valueA))(ctx.valueA == null ? null : ctx.valueA.a == null ? null : ctx.valueA.a.b);
            $r3$.ɵɵi18nApply(1);
          }
        }
      `;
      verify(input, output);
    });

    it('should handle i18n attributes with bindings in content', () => {
      const input = `
        <div i18n>My i18n block #{{ one }}</div>
        <div i18n>My i18n block #{{ two | uppercase }}</div>
        <div i18n>My i18n block #{{ three + four + five }}</div>
      `;

      const output = String.raw `
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_572579892698764378$$APP_SPEC_TS_0$ = goog.getMsg("My i18n block #{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_572579892698764378$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("My i18n block #{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_609623417156596326$$APP_SPEC_TS_1$ = goog.getMsg("My i18n block #{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_1$ = $MSG_EXTERNAL_609623417156596326$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("My i18n block #{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        var $I18N_2$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_3998119318957372120$$APP_SPEC_TS_2$ = goog.getMsg("My i18n block #{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_2$ = $MSG_EXTERNAL_3998119318957372120$$APP_SPEC_TS_2$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("My i18n block #{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        …
        consts: 7,
        vars: 5,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(2, "div");
            $r3$.ɵɵi18n(3, $I18N_1$);
            $r3$.ɵɵpipe(4, "uppercase");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(5, "div");
            $r3$.ɵɵi18n(6, $I18N_2$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.one);
            $r3$.ɵɵi18nApply(1);
            $r3$.ɵɵselect(3);
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(4, 3, ctx.two));
            $r3$.ɵɵi18nApply(3);
            $r3$.ɵɵselect(6);
            $r3$.ɵɵi18nExp(ctx.three + ctx.four + ctx.five);
            $r3$.ɵɵi18nApply(6);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7905233330103651696$$APP_SPEC_TS_0$ = goog.getMsg(" My i18n block #{$interpolation} {$startTagSpan}Plain text in nested element{$closeTagSpan}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#2\uFFFD",
              "closeTagSpan": "\uFFFD/#2\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_7905233330103651696$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize(" My i18n block #{$interpolation} {$startTagSpan}Plain text in nested element{$closeTagSpan}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#2\uFFFD",
              "closeTagSpan": "\uFFFD/#2\uFFFD"
            });
        }
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_5788821996131681377$$APP_SPEC_TS_1$ = goog.getMsg(" My i18n block #{$interpolation} {$startTagDiv}{$startTagDiv}{$startTagSpan} More bindings in more nested element: {$interpolation_1} {$closeTagSpan}{$closeTagDiv}{$closeTagDiv}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagDiv": "[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]",
              "startTagSpan": "\uFFFD#8\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD",
              "closeTagSpan": "\uFFFD/#8\uFFFD",
              "closeTagDiv": "[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]"
            });
            $I18N_1$ = $MSG_EXTERNAL_5788821996131681377$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize(" My i18n block #{$interpolation} {$startTagDiv}{$startTagDiv}{$startTagSpan} More bindings in more nested element: {$interpolation_1} {$closeTagSpan}{$closeTagDiv}{$closeTagDiv}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagDiv": "[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]",
              "startTagSpan": "\uFFFD#8\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD",
              "closeTagSpan": "\uFFFD/#8\uFFFD",
              "closeTagDiv": "[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]"
            });
        }
        $I18N_1$ = $r3$.ɵɵi18nPostprocess($I18N_1$);
        …
        consts: 9,
        vars: 5,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵelement(2, "span");
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(3, "div");
            $r3$.ɵɵi18nStart(4, $I18N_1$);
            $r3$.ɵɵpipe(5, "uppercase");
            $r3$.ɵɵelementStart(6, "div");
            $r3$.ɵɵelementStart(7, "div");
            $r3$.ɵɵelement(8, "span");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.one);
            $r3$.ɵɵi18nApply(1);
            $r3$.ɵɵselect(4);
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(5, 3, ctx.two))(ctx.nestedInBlockTwo);
            $r3$.ɵɵi18nApply(4);
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
        const $_c1$ = [${AttributeMarker.I18n}, "title"];
        var $I18N_2$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4782264005467235841$$APP_SPEC_TS_3$ = goog.getMsg("Span title {$interpolation} and {$interpolation_1}", {
              "interpolation": "\uFFFD0\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD"
            });
            $I18N_2$ = $MSG_EXTERNAL_4782264005467235841$$APP_SPEC_TS_3$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("Span title {$interpolation} and {$interpolation_1}", {
              "interpolation": "\uFFFD0\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD"
            });
        }
        const $_c4$ = ["title", $I18N_2$];
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4446430594603971069$$APP_SPEC_TS_5$ = goog.getMsg(" My i18n block #1 with value: {$interpolation} {$startTagSpan} Plain text in nested element (block #1) {$closeTagSpan}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#2\uFFFD",
              "closeTagSpan": "\uFFFD/#2\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_4446430594603971069$$APP_SPEC_TS_5$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize(" My i18n block #1 with value: {$interpolation} {$startTagSpan} Plain text in nested element (block #1) {$closeTagSpan}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#2\uFFFD",
              "closeTagSpan": "\uFFFD/#2\uFFFD"
            });
        }
        var $I18N_7$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2719594642740200058$$APP_SPEC_TS_8$ = goog.getMsg("Span title {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_7$ = $MSG_EXTERNAL_2719594642740200058$$APP_SPEC_TS_8$;
        }
        else {
            $I18N_7$ = $r3$.ɵɵi18nLocalize("Span title {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        const $_c9$ = ["title", $I18N_7$];
        var $I18N_6$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2778714953278357902$$APP_SPEC_TS_10$ = goog.getMsg(" My i18n block #2 with value {$interpolation} {$startTagSpan} Plain text in nested element (block #2) {$closeTagSpan}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#7\uFFFD",
              "closeTagSpan": "\uFFFD/#7\uFFFD"
            });
            $I18N_6$ = $MSG_EXTERNAL_2778714953278357902$$APP_SPEC_TS_10$;
        }
        else {
            $I18N_6$ = $r3$.ɵɵi18nLocalize(" My i18n block #2 with value {$interpolation} {$startTagSpan} Plain text in nested element (block #2) {$closeTagSpan}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#7\uFFFD",
              "closeTagSpan": "\uFFFD/#7\uFFFD"
            });
        }
        …
        consts: 9,
        vars: 7,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵelementStart(2, "span", $_c1$);
            $r3$.ɵɵi18nAttributes(3, $_c4$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(4, "div");
            $r3$.ɵɵi18nStart(5, $I18N_6$);
            $r3$.ɵɵpipe(6, "uppercase");
            $r3$.ɵɵelementStart(7, "span", $_c1$);
            $r3$.ɵɵi18nAttributes(8, $_c9$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(2);
            $r3$.ɵɵi18nExp(ctx.valueB)(ctx.valueC);
            $r3$.ɵɵi18nApply(3);
            $r3$.ɵɵi18nExp(ctx.valueA);
            $r3$.ɵɵi18nApply(1);
            $r3$.ɵɵselect(7);
            $r3$.ɵɵi18nExp(ctx.valueE);
            $r3$.ɵɵi18nApply(8);
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(6, 5, ctx.valueD));
            $r3$.ɵɵi18nApply(5);
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
        const $_c0$ = [${AttributeMarker.Template}, "ngIf"];
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7679414751795588050$$APP_SPEC_TS__1$ = goog.getMsg(" Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$closeTagDiv}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagDiv": "\uFFFD#3\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD",
              "closeTagDiv": "\uFFFD/#3\uFFFD"
            });
            $I18N_1$ = $MSG_EXTERNAL_7679414751795588050$$APP_SPEC_TS__1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize(" Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$closeTagDiv}", {
              "interpolation": "\uFFFD0\uFFFD",
              "startTagDiv": "\uFFFD#3\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD",
              "closeTagDiv": "\uFFFD/#3\uFFFD"
            });
        }
        …
        function MyComponent_div_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵelementStart(1, "div");
            $r3$.ɵɵi18nStart(2, $I18N_1$);
            $r3$.ɵɵelement(3, "div");
            $r3$.ɵɵpipe(4, "uppercase");
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵselect(2);
            $r3$.ɵɵi18nExp($ctx_r0$.valueA)($r3$.ɵɵpipeBind1(4, 2, $ctx_r0$.valueB));
            $r3$.ɵɵi18nApply(2);
          }
        }
        …
        consts: 3,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵtext(1, " Some content ");
            $r3$.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 4, "div", $_c0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(2);
            $r3$.ɵɵproperty("ngIf", ctx.visible);
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
        const $_c1$ = ["src", "logo.png", ${AttributeMarker.Template}, "ngIf"];
        const $_c2$ = ["src", "logo.png", ${AttributeMarker.Bindings}, "title", ${AttributeMarker.Template}, "ngIf"];
        function MyComponent_img_1_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelement(0, "img", $_c0$);
          }
        }
        const $_c3$ = ["src", "logo.png", ${AttributeMarker.I18n}, "title"];
        var $I18N_2$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2367729185105559721$$APP_SPEC_TS__2$ = goog.getMsg("App logo #{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_2$ = $MSG_EXTERNAL_2367729185105559721$$APP_SPEC_TS__2$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("App logo #{$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        const $_c4$ = ["title", $I18N_2$];
        function MyComponent_img_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "img", $_c3$);
            $r3$.ɵɵi18nAttributes(1, $_c4$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $ctx_r1$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($ctx_r1$.id);
            $r3$.ɵɵi18nApply(1);
          }
        }
        …
        consts: 3,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelement(0, "img", $_c0$);
            $r3$.ɵɵtemplate(1, MyComponent_img_1_Template, 1, 0, "img", $_c1$);
            $r3$.ɵɵtemplate(2, MyComponent_img_2_Template, 2, 1, "img", $_c2$);
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵproperty("ngIf", ctx.visible);
            $r3$.ɵɵselect(2);
            $r3$.ɵɵproperty("ngIf", ctx.visible);
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
        const $_c0$ = [${AttributeMarker.Template}, "ngIf"];
        function MyComponent_div_2_div_4_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18nStart(0, $I18N_0$, 2);
            $r3$.ɵɵelementStart(1, "div");
            $r3$.ɵɵelement(2, "div");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r2$ = $r3$.ɵɵnextContext(2);
            $r3$.ɵɵi18nExp($ctx_r2$.valueC)($ctx_r2$.valueD);
            $r3$.ɵɵi18nApply(0);
          }
        }
        function MyComponent_div_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18nStart(0, $I18N_0$, 1);
            $r3$.ɵɵelementStart(1, "div");
            $r3$.ɵɵelementStart(2, "div");
            $r3$.ɵɵpipe(3, "uppercase");
            $r3$.ɵɵtemplate(4, MyComponent_div_2_div_4_Template, 3, 2, "div", $_c1$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵselect(4);
            $r3$.ɵɵproperty("ngIf", $ctx_r0$.exists);
            $r3$.ɵɵi18nExp($ctx_r0$.valueA)($r3$.ɵɵpipeBind1(3, 3, $ctx_r0$.valueB));
            $r3$.ɵɵi18nApply(0);
          }
        }
        var $I18N_0$;
        if (ngI18nClosureMode) {
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
            $I18N_0$ = $MSG_EXTERNAL_1221890473527419724$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize(" Some content {$startTagDiv_2} Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$startTagDiv_1} Content inside sub-template {$interpolation_2} {$startTagDiv} Bottom level element {$interpolation_3} {$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$startTagDiv_3} Some other content {$interpolation_4} {$startTagDiv} More nested levels with bindings {$interpolation_5} {$closeTagDiv}{$closeTagDiv}", {
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
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$);
        function MyComponent_div_3_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18nStart(0, $I18N_0$, 3);
            $r3$.ɵɵelementStart(1, "div");
            $r3$.ɵɵelement(2, "div");
            $r3$.ɵɵpipe(3, "uppercase");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r1$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($ctx_r1$.valueE + $ctx_r1$.valueF)($r3$.ɵɵpipeBind1(3, 2, $ctx_r1$.valueG));
            $r3$.ɵɵi18nApply(0);
          }
        }
        …
        consts: 4,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 5, "div", $_c1$);
            $r3$.ɵɵtemplate(3, MyComponent_div_3_Template, 4, 4, "div", $_c1$);
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(2);
            $r3$.ɵɵproperty("ngIf", ctx.visible);
            $r3$.ɵɵselect(3);
            $r3$.ɵɵproperty("ngIf", !ctx.visible);
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
        const $_c0$ = [${AttributeMarker.Template}, "ngIf"];
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_119975189388320493$$APP_SPEC_TS__1$ = goog.getMsg("Some other content {$startTagSpan}{$interpolation}{$closeTagSpan}", {
              "startTagSpan": "\uFFFD#2\uFFFD",
              "interpolation": "\uFFFD0\uFFFD",
              "closeTagSpan": "\uFFFD/#2\uFFFD"
            });
            $I18N_1$ = $MSG_EXTERNAL_119975189388320493$$APP_SPEC_TS__1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("Some other content {$startTagSpan}{$interpolation}{$closeTagSpan}", {
              "startTagSpan": "\uFFFD#2\uFFFD",
              "interpolation": "\uFFFD0\uFFFD",
              "closeTagSpan": "\uFFFD/#2\uFFFD"
            });
        }
        …
        function MyComponent_div_0_Template(rf, ctx) {
          if (rf & 1) {
              $r3$.ɵɵelementStart(0, "div");
              $r3$.ɵɵi18nStart(1, $I18N_1$);
              $r3$.ɵɵelement(2, "span");
              $r3$.ɵɵi18nEnd();
              $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
              const $ctx_r0$ = $r3$.ɵɵnextContext();
              $r3$.ɵɵselect(1);
              $r3$.ɵɵi18nExp($ctx_r0$.valueA);
              $r3$.ɵɵi18nApply(1);
          }
        }
        …
        consts: 1,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 1, "div", $_c0$);
          }
          if (rf & 2) {
            $r3$.ɵɵproperty("ngIf", ctx.visible);
          }
        }
      `;

      verify(input, output);
    });

    it('should generate event listeners instructions before i18n ones', () => {
      const input = `
        <div i18n (click)="onClick()">Hello</div>
      `;

      const output = String.raw `
        const $_c0$ = [${AttributeMarker.Bindings}, "click"];
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_APP_SPEC_TS_2$ = goog.getMsg("Hello");
            $I18N_1$ = $MSG_APP_SPEC_TS_2$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("Hello");
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $_c0$);
            $r3$.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener($event) { return ctx.onClick(); });
            $r3$.ɵɵi18n(1, $I18N_1$);
            $r3$.ɵɵelementEnd();
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS_0$ = goog.getMsg("My i18n block #1");
            $I18N_0$ = $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("My i18n block #1");
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
            $I18N_0$ = $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        …
        consts: 2,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.age);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2413150872298537152$$APP_SPEC_TS_0$ = goog.getMsg("My i18n block #2");
            $I18N_0$ = $MSG_EXTERNAL_2413150872298537152$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("My i18n block #2");
        }
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS__1$ = goog.getMsg("My i18n block #1");
            $I18N_1$ = $MSG_EXTERNAL_4890179241114413722$$APP_SPEC_TS__1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("My i18n block #1");
        }
        function MyComponent_ng_template_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18n(0, $I18N_1$);
          }
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 0, "ng-template");
            $r3$.ɵɵelementContainerStart(1);
            $r3$.ɵɵi18n(2, $I18N_0$);
            $r3$.ɵɵelementContainerEnd();
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
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_5295701706185791735$$APP_SPEC_TS_1$ = goog.getMsg("Text #1");
            $I18N_1$ = $MSG_EXTERNAL_5295701706185791735$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("Text #1");
        }
        const $_c2$ = [${AttributeMarker.Styles}, "padding", "10px"];
        var $I18N_3$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4722270221386399294$$APP_SPEC_TS_3$ = goog.getMsg("Text #2");
            $I18N_3$ = $MSG_EXTERNAL_4722270221386399294$$APP_SPEC_TS_3$;
        }
        else {
            $I18N_3$ = $r3$.ɵɵi18nLocalize("Text #2");
        }
        …
        consts: 4,
        vars: 0,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "span", $_c0$);
            $r3$.ɵɵi18n(1, $I18N_1$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵelementStart(2, "span", $_c1$);
            $r3$.ɵɵi18n(3, $I18N_3$);
            $r3$.ɵɵelementEnd();
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
          const $MSG_EXTERNAL_355394464191978948$$APP_SPEC_TS_0$ = goog.getMsg("Some content: {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
          $I18N_0$ = $MSG_EXTERNAL_355394464191978948$$APP_SPEC_TS_0$;
        }
        else {
          $I18N_0$ = $r3$.ɵɵi18nLocalize("Some content: {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        …
        consts: 3,
        vars: 3,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementContainerStart(0);
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵpipe(2, "uppercase");
            $r3$.ɵɵelementContainerEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(2, 1, ctx.valueA));
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_355394464191978948$$APP_SPEC_TS__0$ = goog.getMsg("Some content: {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_355394464191978948$$APP_SPEC_TS__0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("Some content: {$interpolation}", {
              "interpolation": "\uFFFD0\uFFFD"
            });
        }
        function MyComponent_ng_template_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18n(0, $I18N_0$);
            $r3$.ɵɵpipe(1, "uppercase");
          } if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 1, $ctx_r0$.valueA));
            $r3$.ɵɵi18nApply(0);
          }
        }
        …
        consts: 1,
        vars: 0,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 2, 3, "ng-template");
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
          const $MSG_EXTERNAL_702706566400598764$$APP_SPEC_TS_0$ = goog.getMsg("{$startTagNgTemplate}Template content: {$interpolation}{$closeTagNgTemplate}{$startTagNgContainer}Container content: {$interpolation_1}{$closeTagNgContainer}", {
            "startTagNgTemplate": "\uFFFD*2:1\uFFFD",
            "closeTagNgTemplate": "\uFFFD/*2:1\uFFFD",
            "startTagNgContainer": "\uFFFD#3\uFFFD",
            "interpolation_1": "\uFFFD0\uFFFD",
            "closeTagNgContainer": "\uFFFD/#3\uFFFD",
            "interpolation": "\uFFFD0:1\uFFFD"
          });
          $I18N_0$ = $MSG_EXTERNAL_702706566400598764$$APP_SPEC_TS_0$;
        }
        else {
          $I18N_0$ = $r3$.ɵɵi18nLocalize("{$startTagNgTemplate}Template content: {$interpolation}{$closeTagNgTemplate}{$startTagNgContainer}Container content: {$interpolation_1}{$closeTagNgContainer}", {
            "startTagNgTemplate": "\uFFFD*2:1\uFFFD",
            "closeTagNgTemplate": "\uFFFD/*2:1\uFFFD",
            "startTagNgContainer": "\uFFFD#3\uFFFD",
            "interpolation_1": "\uFFFD0\uFFFD",
            "closeTagNgContainer": "\uFFFD/#3\uFFFD",
            "interpolation": "\uFFFD0:1\uFFFD"
          });
        }
        function MyComponent_ng_template_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18n(0, $I18N_0$, 1);
            $r3$.ɵɵpipe(1, "uppercase");
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 1, $ctx_r0$.valueA));
            $r3$.ɵɵi18nApply(0);
          }
        }
        …
        consts: 5,
        vars: 3,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 2, 3, "ng-template");
            $r3$.ɵɵelementContainer(3);
            $r3$.ɵɵpipe(4, "uppercase");
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(4, 1, ctx.valueB));
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
            $I18N_0$ = $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS__1$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
            $I18N_1$ = $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS__1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male} female {female} other {other}}");
        }
        $I18N_1$ = $r3$.ɵɵi18nPostprocess($I18N_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        function MyComponent_ng_template_0_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18n(0, $I18N_1$);
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($ctx_r0$.gender);
            $r3$.ɵɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 1, "ng-template");
            $r3$.ɵɵelementContainerStart(1);
            $r3$.ɵɵi18n(2, $I18N_0$);
            $r3$.ɵɵelementContainerEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(2);
            $r3$.ɵɵi18nExp(ctx.age);
            $r3$.ɵɵi18nApply(2);
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
            $r3$.ɵɵi18n(0, $I18N_0$, 3);
          }
          if (rf & 2) {
            const $ctx_r2$ = $r3$.ɵɵnextContext(3);
            $r3$.ɵɵi18nExp($ctx_r2$.valueC);
            $r3$.ɵɵi18nApply(0);
          }
        }
        function MyComponent_ng_template_2_ng_template_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18nStart(0, $I18N_0$, 2);
            $r3$.ɵɵtemplate(1, MyComponent_ng_template_2_ng_template_2_ng_template_1_Template, 1, 1, "ng-template");
            $r3$.ɵɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r1$ = $r3$.ɵɵnextContext(2);
            $r3$.ɵɵi18nExp($ctx_r1$.valueB);
            $r3$.ɵɵi18nApply(0);
          }
        }
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2051477021417799640$$APP_SPEC_TS_0$ = goog.getMsg("{$startTagNgTemplate} Template A: {$interpolation} {$startTagNgTemplate} Template B: {$interpolation_1} {$startTagNgTemplate} Template C: {$interpolation_2} {$closeTagNgTemplate}{$closeTagNgTemplate}{$closeTagNgTemplate}", {
              "startTagNgTemplate": "[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]",
              "closeTagNgTemplate": "[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]",
              "interpolation": "\uFFFD0:1\uFFFD",
              "interpolation_1": "\uFFFD0:2\uFFFD",
              "interpolation_2": "\uFFFD0:3\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_2051477021417799640$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{$startTagNgTemplate} Template A: {$interpolation} {$startTagNgTemplate} Template B: {$interpolation_1} {$startTagNgTemplate} Template C: {$interpolation_2} {$closeTagNgTemplate}{$closeTagNgTemplate}{$closeTagNgTemplate}", {
              "startTagNgTemplate": "[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]",
              "closeTagNgTemplate": "[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]",
              "interpolation": "\uFFFD0:1\uFFFD",
              "interpolation_1": "\uFFFD0:2\uFFFD",
              "interpolation_2": "\uFFFD0:3\uFFFD"
            });
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$);
        function MyComponent_ng_template_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18nStart(0, $I18N_0$, 1);
            $r3$.ɵɵpipe(1, "uppercase");
            $r3$.ɵɵtemplate(2, MyComponent_ng_template_2_ng_template_2_Template, 2, 1, "ng-template");
            $r3$.ɵɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 1, $ctx_r0$.valueA));
            $r3$.ɵɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 0,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 3, 3, "ng-template");
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
            $I18N_0$ = $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male} female {female} other {other}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS__1$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
            $I18N_1$ = $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS__1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        }
        $I18N_1$ = $r3$.ɵɵi18nPostprocess($I18N_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        function MyComponent_ng_template_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18n(0, $I18N_1$);
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($ctx_r0$.age);
            $r3$.ɵɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementContainerStart(0);
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementContainerEnd();
            $r3$.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 1, 1, "ng-template");
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.gender);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4891196282781544695$$APP_SPEC_TS_0$ = goog.getMsg("{$tagImg} is my logo #1 ", {
              "tagImg": "\uFFFD#2\uFFFD\uFFFD/#2\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_4891196282781544695$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{$tagImg} is my logo #1 ", {
              "tagImg": "\uFFFD#2\uFFFD\uFFFD/#2\uFFFD"
            });
        }
        var $I18N_2$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_461986953980355147$$APP_SPEC_TS__2$ = goog.getMsg("{$tagImg} is my logo #2 ", {
              "tagImg": "\uFFFD#1\uFFFD\uFFFD/#1\uFFFD"
            });
            $I18N_2$ = $MSG_EXTERNAL_461986953980355147$$APP_SPEC_TS__2$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("{$tagImg} is my logo #2 ", {
              "tagImg": "\uFFFD#1\uFFFD\uFFFD/#1\uFFFD"
            });
        }
        function MyComponent_ng_template_3_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18nStart(0, $I18N_2$);
            $r3$.ɵɵelement(1, "img", $_c0$);
            $r3$.ɵɵi18nEnd();
          }
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementContainerStart(0);
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵelement(2, "img", $_c0$);
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementContainerEnd();
            $r3$.ɵɵtemplate(3, MyComponent_ng_template_3_Template, 2, 0, "ng-template");
          }
        }
      `;

      verify(input, output);
    });

    it('should not emit duplicate i18n consts for nested <ng-container>s', () => {
      const input = `
        <ng-template i18n>
          Root content
          <ng-container *ngIf="visible">
            Nested content
          </ng-container>
        </ng-template>
      `;

      const output = String.raw `
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_8537814667662432133$$APP_SPEC_TS__0$ = goog.getMsg(" Root content {$startTagNgContainer} Nested content {$closeTagNgContainer}", {
              "startTagNgContainer": "\uFFFD*1:1\uFFFD\uFFFD#1:1\uFFFD",
              "closeTagNgContainer": "\uFFFD/#1:1\uFFFD\uFFFD/*1:1\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_8537814667662432133$$APP_SPEC_TS__0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize(" Root content {$startTagNgContainer} Nested content {$closeTagNgContainer}", {
              "startTagNgContainer": "\uFFFD*1:1\uFFFD\uFFFD#1:1\uFFFD",
              "closeTagNgContainer": "\uFFFD/#1:1\uFFFD\uFFFD/*1:1\uFFFD"
            });
        }
        …
      `;

      verify(input, output);
    });

    it('should not emit duplicate i18n consts for elements with the same content', () => {
      const input = `
        <div i18n>Test</div>
        <div i18n>Test</div>
      `;

      // TODO(FW-635): currently we generate unique consts for each i18n block even though it might
      // contain the same content. This should be optimized by translation statements caching, that
      // can be implemented in the future within FW-635.
      const output = String.raw `
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_6563391987554512024$$APP_SPEC_TS_0$ = goog.getMsg("Test");
            $I18N_0$ = $MSG_EXTERNAL_6563391987554512024$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("Test");
        }
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_6563391987554512024$$APP_SPEC_TS_1$ = goog.getMsg("Test");
            $I18N_1$ = $MSG_EXTERNAL_6563391987554512024$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("Test");
        }
        …
      `;

      verify(input, output);
    });

    it('should generate a self-closing container instruction for ng-container inside i18n', () => {
      const input = `
        <div i18n>
          Hello <ng-container>there</ng-container>
        </div>
      `;

      const output = String.raw `
        var $I18N_0$;
        if (ngI18nClosureMode) {
          const $MSG_APP_SPEC_TS_1$ = goog.getMsg(" Hello {$startTagNgContainer}there{$closeTagNgContainer}", { "startTagNgContainer": "\uFFFD#2\uFFFD", "closeTagNgContainer": "\uFFFD/#2\uFFFD" });
          $I18N_0$ = $MSG_APP_SPEC_TS_1$;
        }
        else {
          $I18N_0$ = $r3$.ɵɵi18nLocalize(" Hello {$startTagNgContainer}there{$closeTagNgContainer}", { "startTagNgContainer": "\uFFFD#2\uFFFD", "closeTagNgContainer": "\uFFFD/#2\uFFFD" });
        }
        …
        consts: 3,
        vars: 0,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, I18N_0);
            $r3$.ɵɵelementContainer(2);
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
          }
        }
      `;

      verify(input, output);
    });

    it('should not generate a self-closing container instruction for ng-container with non-text content inside i18n',
       () => {
         const input = `
          <div i18n>
            Hello <ng-container>there <strong>!</strong></ng-container>
          </div>
        `;

         const output = String.raw `
          var $I18N_0$;
          if (ngI18nClosureMode) {
            const $MSG_APP_SPEC_TS_1$ = goog.getMsg(" Hello {$startTagNgContainer}there {$startTagStrong}!{$closeTagStrong}{$closeTagNgContainer}", { "startTagNgContainer": "\uFFFD#2\uFFFD", "startTagStrong": "\uFFFD#3\uFFFD", "closeTagStrong": "\uFFFD/#3\uFFFD", "closeTagNgContainer": "\uFFFD/#2\uFFFD" });
            $I18N_0$ = $MSG_APP_SPEC_TS_1$;
          }
          else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize(" Hello {$startTagNgContainer}there {$startTagStrong}!{$closeTagStrong}{$closeTagNgContainer}", { "startTagNgContainer": "\uFFFD#2\uFFFD", "startTagStrong": "\uFFFD#3\uFFFD", "closeTagStrong": "\uFFFD/#3\uFFFD", "closeTagNgContainer": "\uFFFD/#2\uFFFD" });
          }
          …
          consts: 4,
          vars: 0,
          template: function MyComponent_Template(rf, ctx) {
            if (rf & 1) {
              $r3$.ɵɵelementStart(0, "div");
              $r3$.ɵɵi18nStart(1, I18N_0);
              $r3$.ɵɵelementContainerStart(2);
              $r3$.ɵɵelement(3, "strong");
              $r3$.ɵɵelementContainerEnd();
              $r3$.ɵɵi18nEnd();
              $r3$.ɵɵelementEnd();
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_963542717423364282$$APP_SPEC_TS_0$ = goog.getMsg("\n          Some text\n          {$startTagSpan}Text inside span{$closeTagSpan}\n        ", {
              "startTagSpan": "\uFFFD#3\uFFFD",
              "closeTagSpan": "\uFFFD/#3\uFFFD"
            });
            $I18N_0$ = $MSG_EXTERNAL_963542717423364282$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("\n          Some text\n          {$startTagSpan}Text inside span{$closeTagSpan}\n        ", {
              "startTagSpan": "\uFFFD#3\uFFFD",
              "closeTagSpan": "\uFFFD/#3\uFFFD"
            });
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵtext(0, "\n        ");
            $r3$.ɵɵelementStart(1, "div");
            $r3$.ɵɵi18nStart(2, $I18N_0$);
            $r3$.ɵɵelement(3, "span");
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵtext(4, "\n      ");
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
            $I18N_0$ = $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male} female {female} other {other}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        …
        consts: 2,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.gender);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_4166854826696768832$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, single {'single quotes'} double {\"double quotes\"} other {other}}");
            $I18N_0$ = $MSG_EXTERNAL_4166854826696768832$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, single {'single quotes'} double {\"double quotes\"} other {other}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
            $I18N_0$ = $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        …
        consts: 1,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18n(0, $I18N_0$);
          }
          if (rf & 2) {
            $r3$.ɵɵi18nExp(ctx.age);
            $r3$.ɵɵi18nApply(0);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
            $I18N_0$ = $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male} female {female} other {other}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $_c0$ = ["title", "icu only", ${AttributeMarker.Template}, "ngIf"];
        const $_c1$ = ["title", "icu and text", ${AttributeMarker.Template}, "ngIf"];
        const $_c2$ = ["title", "icu only"];
        var $I18N_3$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS__3$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
            $I18N_3$ = $MSG_EXTERNAL_8806993169187953163$$APP_SPEC_TS__3$;
        }
        else {
            $I18N_3$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        }
        $I18N_3$ = $r3$.ɵɵi18nPostprocess($I18N_3$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        function MyComponent_div_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $_c2$);
            $r3$.ɵɵi18n(1, $I18N_3$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp($ctx_r0$.age);
            $r3$.ɵɵi18nApply(1);
          }
        }
        const $_c3$ = ["title", "icu and text"];
        var $I18N_5$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_1922743304863699161$$APP_SPEC_TS__5$ = goog.getMsg("{VAR_SELECT, select, 0 {no emails} 1 {one email} other {{INTERPOLATION} emails}}");
            $I18N_5$ = $MSG_EXTERNAL_1922743304863699161$$APP_SPEC_TS__5$;
        }
        else {
            $I18N_5$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 0 {no emails} 1 {one email} other {{INTERPOLATION} emails}}");
        }
        $I18N_5$ = $r3$.ɵɵi18nPostprocess($I18N_5$, {
          "VAR_SELECT": "\uFFFD0\uFFFD",
          "INTERPOLATION": "\uFFFD1\uFFFD"
        });
        function MyComponent_div_3_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div", $_c3$);
            $r3$.ɵɵtext(1, " You have ");
            $r3$.ɵɵi18n(2, $I18N_5$);
            $r3$.ɵɵtext(3, ". ");
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            const $ctx_r1$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵselect(2);
            $r3$.ɵɵi18nExp($ctx_r1$.count)($ctx_r1$.count);
            $r3$.ɵɵi18nApply(2);
          }
        }
        …
        consts: 4,
        vars: 3,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵtemplate(2, MyComponent_div_2_Template, 2, 1, "div", $_c0$);
            $r3$.ɵɵtemplate(3, MyComponent_div_3_Template, 4, 2, "div", $_c1$);
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.gender);
            $r3$.ɵɵi18nApply(1);
            $r3$.ɵɵselect(2);
            $r3$.ɵɵproperty("ngIf", ctx.visible);
            $r3$.ɵɵselect(3);
            $r3$.ɵɵproperty("ngIf", ctx.available);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2949673783721159566$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {{INTERPOLATION}}}");
            $I18N_0$ = $MSG_EXTERNAL_2949673783721159566$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {{INTERPOLATION}}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD",
          "INTERPOLATION": "\uFFFD1\uFFFD"
        });
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.age)(ctx.other);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2417296354340576868$$APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male - {START_BOLD_TEXT}male{CLOSE_BOLD_TEXT}} female {female {START_BOLD_TEXT}female{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}{START_ITALIC_TEXT}other{CLOSE_ITALIC_TEXT}{CLOSE_TAG_DIV}}}");
            $I18N_1$ = $MSG_EXTERNAL_2417296354340576868$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male - {START_BOLD_TEXT}male{CLOSE_BOLD_TEXT}} female {female {START_BOLD_TEXT}female{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}{START_ITALIC_TEXT}other{CLOSE_ITALIC_TEXT}{CLOSE_TAG_DIV}}}");
        }
        $I18N_1$ = $r3$.ɵɵi18nPostprocess($I18N_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD",
          "START_BOLD_TEXT": "<b>",
          "CLOSE_BOLD_TEXT": "</b>",
          "START_ITALIC_TEXT": "<i>",
          "CLOSE_ITALIC_TEXT": "</i>",
          "START_TAG_DIV": "<div class=\"other\">",
          "CLOSE_TAG_DIV": "</div>"
        });
        const $_c2$ = [1, "other"];
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_5791551881115084301$$APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$startBoldText}Other content{$closeBoldText}{$startTagDiv}{$startItalicText}Another content{$closeItalicText}{$closeTagDiv}", {
              "startBoldText": "\uFFFD#2\uFFFD",
              "closeBoldText": "\uFFFD/#2\uFFFD",
              "startTagDiv": "\uFFFD#3\uFFFD",
              "startItalicText": "\uFFFD#4\uFFFD",
              "closeItalicText": "\uFFFD/#4\uFFFD",
              "closeTagDiv": "\uFFFD/#3\uFFFD",
              "icu": $I18N_1$
            });
            $I18N_0$ = $MSG_EXTERNAL_5791551881115084301$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{$icu}{$startBoldText}Other content{$closeBoldText}{$startTagDiv}{$startItalicText}Another content{$closeItalicText}{$closeTagDiv}", {
              "startBoldText": "\uFFFD#2\uFFFD",
              "closeBoldText": "\uFFFD/#2\uFFFD",
              "startTagDiv": "\uFFFD#3\uFFFD",
              "startItalicText": "\uFFFD#4\uFFFD",
              "closeItalicText": "\uFFFD/#4\uFFFD",
              "closeTagDiv": "\uFFFD/#3\uFFFD",
              "icu": $I18N_1$
            });
        }
        …
        consts: 5,
        vars: 1,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵelement(2, "b");
            $r3$.ɵɵelementStart(3, "div", $_c2$);
            $r3$.ɵɵelement(4, "i");
            $r3$.ɵɵelementEnd();
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.gender);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_6879461626778511059$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male of age: {INTERPOLATION}} female {female} other {other}}");
            $I18N_0$ = $MSG_EXTERNAL_6879461626778511059$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male of age: {INTERPOLATION}} female {female} other {other}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD",
          "INTERPOLATION": "\uFFFD1\uFFFD"
        });
        …
        consts: 2,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.gender)(ctx.ageA + ctx.ageB + ctx.ageC);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
            $I18N_1$ = $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male} female {female} other {other}}");
        }
        $I18N_1$ = $r3$.ɵɵi18nPostprocess($I18N_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        var $I18N_2$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7068143081688428291$$APP_SPEC_TS_2$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}");
            $I18N_2$ = $MSG_EXTERNAL_7068143081688428291$$APP_SPEC_TS_2$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}");
        }
        $I18N_2$ = $r3$.ɵɵi18nPostprocess($I18N_2$, {
          "VAR_SELECT": "\uFFFD1\uFFFD"
        });
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2967249209167308918$$APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$icu_1}", {
              "icu": $I18N_1$,
              "icu_1": $I18N_2$
            });
            $I18N_0$ = $MSG_EXTERNAL_2967249209167308918$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{$icu}{$icu_1}", {
              "icu": $I18N_1$,
              "icu_1": $I18N_2$
            });
        }
        …
        consts: 2,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.gender)(ctx.age);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
            $I18N_1$ = $MSG_APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male} female {female} other {other}}");
        }
        $I18N_1$ = $r3$.ɵɵi18nPostprocess($I18N_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        var $I18N_2$;
        if (ngI18nClosureMode) {
            const $MSG_APP_SPEC_TS_2$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
            $I18N_2$ = $MSG_APP_SPEC_TS_2$;
        }
        else {
            $I18N_2$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male} female {female} other {other}}");
        }
        $I18N_2$ = $r3$.ɵɵi18nPostprocess($I18N_2$, {
          "VAR_SELECT": "\uFFFD1\uFFFD"
        });
        const $_c3$ = [${AttributeMarker.Template}, "ngIf"];
        var $I18N_4$;
        if (ngI18nClosureMode) {
            const $MSG_APP_SPEC_TS__4$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
            $I18N_4$ = $MSG_APP_SPEC_TS__4$;
        }
        else {
            $I18N_4$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male} female {female} other {other}}");
        }
        $I18N_4$ = $r3$.ɵɵi18nPostprocess($I18N_4$, {
          "VAR_SELECT": "\uFFFD0:1\uFFFD"
        });
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$startTagDiv}{$icu}{$closeTagDiv}{$startTagDiv_1}{$icu}{$closeTagDiv}", {
              "startTagDiv": "\uFFFD#2\uFFFD",
              "closeTagDiv": "[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]",
              "startTagDiv_1": "\uFFFD*3:1\uFFFD\uFFFD#1:1\uFFFD",
              "icu": "\uFFFDI18N_EXP_ICU\uFFFD"
            });
            $I18N_0$ = $MSG_APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{$icu}{$startTagDiv}{$icu}{$closeTagDiv}{$startTagDiv_1}{$icu}{$closeTagDiv}", {
              "startTagDiv": "\uFFFD#2\uFFFD",
              "closeTagDiv": "[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]",
              "startTagDiv_1": "\uFFFD*3:1\uFFFD\uFFFD#1:1\uFFFD",
              "icu": "\uFFFDI18N_EXP_ICU\uFFFD"
            });
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "ICU": [$I18N_1$, $I18N_2$, $I18N_4$]
        });
        function MyComponent_div_3_Template(rf, ctx) {
          if (rf & 1) {
              $r3$.ɵɵi18nStart(0, $I18N_0$, 1);
              $r3$.ɵɵelement(1, "div");
              $r3$.ɵɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($ctx_r0$.gender);
            $r3$.ɵɵi18nApply(0);
          }
        }
        …
        consts: 4,
        vars: 3,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵelement(2, "div");
            $r3$.ɵɵtemplate(3, MyComponent_div_3_Template, 2, 1, "div", $_c3$);
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(3);
            $r3$.ɵɵproperty("ngIf", ctx.visible);
            $r3$.ɵɵi18nExp(ctx.gender)(ctx.gender);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_343563413083115114$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT_1, select, male {male of age: {VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}} female {female} other {other}}");
            $I18N_0$ = $MSG_EXTERNAL_343563413083115114$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT_1, select, male {male of age: {VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}} female {female} other {other}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD",
          "VAR_SELECT_1": "\uFFFD1\uFFFD"
        });
        …
        consts: 2,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.age)(ctx.gender);
            $r3$.ɵɵi18nApply(1);
          }
        }
      `;

      const exceptions = {
        '3052001905251380936': 'Wrapper message generated by "ng xi18n" around ICU: "  {$ICU}  "'
      };
      verify(input, output, {exceptions});
    });

    it('nested with interpolations in "other" blocks', () => {
      const input = `
        <div i18n>{count, plural,
          =0 {zero}
          =2 {{{count}} {name, select,
                cat {cats}
                dog {dogs}
                other {animals}} !}
          other {other - {{count}}}
        }</div>
      `;

      const output = String.raw `
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_6870293071705078389$$APP_SPEC_TS_1$ = goog.getMsg("{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}} !} other {other - {INTERPOLATION}}}");
            $I18N_0$ = $MSG_EXTERNAL_6870293071705078389$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}} !} other {other - {INTERPOLATION}}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD",
          "VAR_PLURAL": "\uFFFD1\uFFFD",
          "INTERPOLATION": "\uFFFD2\uFFFD"
        });
        …
        consts: 2,
        vars: 3,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.name)(ctx.count)(ctx.count);
            $r3$.ɵɵi18nApply(1);
          }
        }
      `;

      verify(input, output);
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
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
            $I18N_1$ = $MSG_EXTERNAL_7842238767399919809$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male} female {female} other {other}}");
        }
        $I18N_1$ = $r3$.ɵɵi18nPostprocess($I18N_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD"
        });
        const $_c2$ = [${AttributeMarker.Template}, "ngIf"];
        var $I18N_3$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7068143081688428291$$APP_SPEC_TS__3$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}");
            $I18N_3$ = $MSG_EXTERNAL_7068143081688428291$$APP_SPEC_TS__3$;
        }
        else {
            $I18N_3$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}");
        }
        $I18N_3$ = $r3$.ɵɵi18nPostprocess($I18N_3$, {
          "VAR_SELECT": "\uFFFD0:1\uFFFD"
        });
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_1194472282609532229$$APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$startTagSpan}{$icu_1}{$closeTagSpan}", {
              "startTagSpan": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD",
              "closeTagSpan": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD",
              "icu": $I18N_1$,
              "icu_1": $I18N_3$
            });
            $I18N_0$ = $MSG_EXTERNAL_1194472282609532229$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{$icu}{$startTagSpan}{$icu_1}{$closeTagSpan}", {
              "startTagSpan": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD",
              "closeTagSpan": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD",
              "icu": $I18N_1$,
              "icu_1": $I18N_3$
            });
        }
        function MyComponent_span_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18nStart(0, $I18N_0$, 1);
            $r3$.ɵɵelement(1, "span");
            $r3$.ɵɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($ctx_r0$.age);
            $r3$.ɵɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 2,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵtemplate(2, MyComponent_span_2_Template, 2, 1, "span", $_c2$);
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(2);
            $r3$.ɵɵproperty("ngIf", ctx.ageVisible);
            $r3$.ɵɵi18nExp(ctx.gender);
            $r3$.ɵɵi18nApply(1);
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
        var $I18N_1$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7825031864601787094$$APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male {INTERPOLATION}} female {female {INTERPOLATION_1}} other {other}}");
            $I18N_1$ = $MSG_EXTERNAL_7825031864601787094$$APP_SPEC_TS_1$;
        }
        else {
            $I18N_1$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male {INTERPOLATION}} female {female {INTERPOLATION_1}} other {other}}");
        }
        $I18N_1$ = $r3$.ɵɵi18nPostprocess($I18N_1$, {
          "VAR_SELECT": "\uFFFD0\uFFFD",
          "INTERPOLATION": "\uFFFD1\uFFFD",
          "INTERPOLATION_1": "\uFFFD2\uFFFD"
        });
        const $_c0$ = [${AttributeMarker.Template}, "ngIf"];
        var $I18N_3$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_2310343208266678305$$APP_SPEC_TS__3$ = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {INTERPOLATION}}}");
            $I18N_3$ = $MSG_EXTERNAL_2310343208266678305$$APP_SPEC_TS__3$;
        }
        else {
            $I18N_3$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {INTERPOLATION}}}");
        }
        $I18N_3$ = $r3$.ɵɵi18nPostprocess($I18N_3$, {
          "VAR_SELECT": "\uFFFD0:1\uFFFD",
          "INTERPOLATION": "\uFFFD1:1\uFFFD"
        });
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_7186042105600518133$$APP_SPEC_TS_0$ = goog.getMsg("{$icu}{$startTagSpan}{$icu_1}{$closeTagSpan}", {
              "startTagSpan": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD",
              "closeTagSpan": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD",
              "icu": $I18N_1$,
              "icu_1": $I18N_3$
            });
            $I18N_0$ = $MSG_EXTERNAL_7186042105600518133$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{$icu}{$startTagSpan}{$icu_1}{$closeTagSpan}", {
              "startTagSpan": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD",
              "closeTagSpan": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD",
              "icu": $I18N_1$,
              "icu_1": $I18N_3$
            });
        }
        function MyComponent_span_2_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵi18nStart(0, $I18N_0$, 1);
            $r3$.ɵɵelement(1, "span");
            $r3$.ɵɵi18nEnd();
          }
          if (rf & 2) {
            const $ctx_r0$ = $r3$.ɵɵnextContext();
            $r3$.ɵɵi18nExp($ctx_r0$.age)($ctx_r0$.otherAge);
            $r3$.ɵɵi18nApply(0);
          }
        }
        …
        consts: 3,
        vars: 4,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18nStart(1, $I18N_0$);
            $r3$.ɵɵtemplate(2, MyComponent_span_2_Template, 2, 2, "span", $_c2$);
            $r3$.ɵɵi18nEnd();
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(2);
            $r3$.ɵɵproperty("ngIf", ctx.ageVisible);
            $r3$.ɵɵi18nExp(ctx.gender)(ctx.weight)(ctx.height);
            $r3$.ɵɵi18nApply(1);
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
            other {other {{ age // i18n(ph="PH WITH SPACES") }}}
        }</div>
      `;

      const output = String.raw `
        var $I18N_0$;
        if (ngI18nClosureMode) {
            const $MSG_EXTERNAL_6318060397235942326$$APP_SPEC_TS_0$ = goog.getMsg("{VAR_SELECT, select, male {male {PH_A}} female {female {PH_B}} other {other {PH_WITH_SPACES}}}");
            $I18N_0$ = $MSG_EXTERNAL_6318060397235942326$$APP_SPEC_TS_0$;
        }
        else {
            $I18N_0$ = $r3$.ɵɵi18nLocalize("{VAR_SELECT, select, male {male {PH_A}} female {female {PH_B}} other {other {PH_WITH_SPACES}}}");
        }
        $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
          "VAR_SELECT": "\uFFFD0\uFFFD",
          "PH_A": "\uFFFD1\uFFFD",
          "PH_B": "\uFFFD2\uFFFD",
          "PH_WITH_SPACES": "\uFFFD3\uFFFD"
        });
        …
        consts: 2,
        vars: 4,
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵɵelementStart(0, "div");
            $r3$.ɵɵi18n(1, $I18N_0$);
            $r3$.ɵɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵɵselect(1);
            $r3$.ɵɵi18nExp(ctx.gender)(ctx.weight)(ctx.height)(ctx.age);
            $r3$.ɵɵi18nApply(1);
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
