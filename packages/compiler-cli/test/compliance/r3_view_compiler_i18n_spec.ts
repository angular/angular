/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

const TRANSLATION_NAME_REGEXP = /^MSG_[A-Z0-9]+/;

describe('i18n support in the view compiler', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  describe('single text nodes', () => {
    it('should translate single text nodes with the i18n attribute', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n>Hello world</div>
                <div>&</div>
                <div i18n>farewell</div>
                <div i18n>farewell</div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = `
        const $msg_1$ = goog.getMsg("Hello world");
        const $msg_2$ = goog.getMsg("farewell");
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            …
            $r3$.ɵtext(1, $msg_1$);
            …
            $r3$.ɵtext(3,"&");
            …
            $r3$.ɵtext(5, $msg_2$);
            …
            $r3$.ɵtext(7, $msg_2$);
            …
          }
        }
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template', {
        '$msg_1$': TRANSLATION_NAME_REGEXP,
        '$msg_2$': TRANSLATION_NAME_REGEXP,
      });
    });

    it('should add the meaning and description as JsDoc comments', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n="meaning|desc@@id" i18n-title="desc" title="introduction">Hello world</div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = `
        /**
         * @desc desc
         */
        const $MSG_APP_SPEC_TS_0$ = goog.getMsg("introduction");
        const $_c1$ = ["title", $MSG_APP_SPEC_TS_0$, 0];
        …
        /**
         * @desc desc
         * @meaning meaning
         */
        const $MSG_APP_SPEC_TS_2$ = goog.getMsg("Hello world");
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nAttribute(1, $_c1$);
            $r3$.ɵtext(2, $MSG_APP_SPEC_TS_2$);
            $r3$.ɵelementEnd();
          }
        }
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  describe('element attributes', () => {

    it('should translate static attributes', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n id="static" i18n-title="m|d" title="introduction"></div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = `
        const $_c0$ = ["id", "static"];
        /**
         * @desc d
         * @meaning m
         */
        const $MSG_APP_SPEC_TS_1$ = goog.getMsg("introduction");
        const $_c2$ = ["title", MSG_APP_SPEC_TS_1, 0];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $_c0$);
            $r3$.ɵi18nAttribute(1, $_c2$);
            $r3$.ɵelementEnd();
          }
        }
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should support interpolation', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n id="dynamic-1"
                  i18n-title="m|d" title="intro {{ valueA | uppercase }}"
                  i18n-aria-label="m1|d1" aria-label="{{ valueB }}"
                  i18n-aria-roledescription aria-roledescription="static text"
                ></div>
                <div i18n id="dynamic-2"
                  i18n-title="m2|d2" title="{{ valueA }} and {{ valueB }} and again {{ valueA + valueB }}"
                  i18n-aria-roledescription aria-roledescription="{{ valueC }}"
                ></div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
        `
        }
      };

      const template = String.raw `
        const $_c0$ = ["id", "dynamic-1"];
        /**
         * @desc d
         * @meaning m
         */
        const $MSG_APP_SPEC_TS_1$ = goog.getMsg("intro \uFFFD0\uFFFD");
        /**
         * @desc d1
         * @meaning m1
         */
        const $MSG_APP_SPEC_TS_2$ = goog.getMsg("\uFFFD0\uFFFD");
        const $MSG_APP_SPEC_TS_3$ = goog.getMsg("static text");
        const $_c4$ = ["title", $MSG_APP_SPEC_TS_1$, 1, "aria-label", $MSG_APP_SPEC_TS_2$, 1, "aria-roledescription", $MSG_APP_SPEC_TS_3$, 0];
        const $_c5$ = ["id", "dynamic-2"];
        /**
         * @desc d2
         * @meaning m2
         */
        const $MSG_APP_SPEC_TS_6$ = goog.getMsg("\uFFFD0\uFFFD and \uFFFD1\uFFFD and again \uFFFD2\uFFFD");
        const $MSG_APP_SPEC_TS_7$ = goog.getMsg("\uFFFD0\uFFFD");
        const $_c8$ = ["title", $MSG_APP_SPEC_TS_6$, 3, "aria-roledescription", $MSG_APP_SPEC_TS_7$, 1];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div", $_c0$);
            $r3$.ɵpipe(1, "uppercase");
            $r3$.ɵi18nAttribute(2, $_c4$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(3, "div", $_c5$);
            $r3$.ɵi18nAttribute(4, $_c8$);
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

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should correctly bind to context in nested template', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div *ngFor="let outer of items">
                  <div i18n-title="m|d" title="different scope {{ outer | uppercase }}">
                </div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = String.raw `
        const $_c0$ = ["ngFor", "", 1, "ngForOf"];
        /**
         * @desc d
         * @meaning m
         */
        const $MSG_APP_SPEC_TS__1$ = goog.getMsg("different scope \uFFFD0\uFFFD");
        const $_c2$ = ["title", $MSG_APP_SPEC_TS__1$, 1];
        function MyComponent_div_Template_0(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵpipe(2, "uppercase");
            $r3$.ɵi18nAttribute(3, $_c2$);
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
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵtemplate(0, MyComponent_div_Template_0, 4, 2, null, $_c0$);
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(0, "ngForOf", $r3$.ɵbind(ctx.items));
          }
        }
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  // TODO(vicb): this feature is not supported yet
  xdescribe('nested nodes', () => {
    it('should generate the placeholders maps', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n>Hello <b>{{name}}<i>!</i><i>!</i></b></div>
                <div>Other</div>
                <div i18n>2nd</div>
                <div i18n><i>3rd</i></div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
        `
        }
      };

      const template = `
      const $r1$ = {"b":[2], "i":[4, 6]};
      const $r2$ = {"i":[13]};
    `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });
  });

  describe('errors', () => {
    it('should throw on nested i18n sections', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n><div i18n></div></div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
        `
        }
      };

      expect(() => compile(files, angularFiles))
          .toThrowError(
              'Could not mark an element as translatable inside of a translatable section');
    });

  });
});
