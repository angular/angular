/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setup} from '@angular/compiler/test/aot/test_util';
import {compile, expectEmit} from './mock_compile';

describe('i18n support in the view compiler', () => {
  const angularFiles = setup({
    compileAngular: false,
    compileFakeCore: true,
    compileAnimations: false,
  });

  describe('element attributes', () => {
    it('should add the meaning and description as JsDoc comments', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n="meaningA|descA@@idA">Content A</div>
                <div i18n-title="meaningB|descB@@idB" title="Title B">Content B</div>
                <div i18n-title="meaningC" title="Title C">Content C</div>
                <div i18n-title="meaningD|descD" title="Title D">Content D</div>
                <div i18n-title="meaningE@@idE" title="Title E">Content E</div>
                <div i18n-title="@@idF" title="Title F">Content F</div>
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
         * @desc [BACKUP_MESSAGE_ID:idA] descA
         * @meaning meaningA
         */
        const $MSG_APP_SPEC_TS_0$ = goog.getMsg("Content A");
        /**
         * @desc [BACKUP_MESSAGE_ID:idB] descB
         * @meaning meaningB
         */
        const $MSG_APP_SPEC_TS_1$ = goog.getMsg("Title B");
        const $_c2$ = ["title", $MSG_APP_SPEC_TS_1$, 0];
        /**
         * @desc meaningC
         */
        const $MSG_APP_SPEC_TS_3$ = goog.getMsg("Title C");
        const $_c4$ = ["title", $MSG_APP_SPEC_TS_3$, 0];
        /**
         * @desc descD
         * @meaning meaningD
         */
        const $MSG_APP_SPEC_TS_5$ = goog.getMsg("Title D");
        const $_c6$ = ["title", $MSG_APP_SPEC_TS_5$, 0];
        /**
         * @desc [BACKUP_MESSAGE_ID:idE] meaningE
         */
        const $MSG_APP_SPEC_TS_7$ = goog.getMsg("Title E");
        const $_c8$ = ["title", $MSG_APP_SPEC_TS_7$, 0];
        /**
         * @desc [BACKUP_MESSAGE_ID:idF]
         */
        const $MSG_APP_SPEC_TS_9$ = goog.getMsg("Title F");
        const $_c10$ = ["title", $MSG_APP_SPEC_TS_9$, 0];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_APP_SPEC_TS_0$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(2, "div");
            $r3$.ɵi18nAttributes(3, $_c2$);
            $r3$.ɵtext(4, "Content B");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(5, "div");
            $r3$.ɵi18nAttributes(6, $_c4$);
            $r3$.ɵtext(7, "Content C");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(8, "div");
            $r3$.ɵi18nAttributes(9, $_c6$);
            $r3$.ɵtext(10, "Content D");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(11, "div");
            $r3$.ɵi18nAttributes(12, $_c8$);
            $r3$.ɵtext(13, "Content E");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(14, "div");
            $r3$.ɵi18nAttributes(15, $_c10$);
            $r3$.ɵtext(16, "Content F");
            $r3$.ɵelementEnd();
          }
        }
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should translate static attributes', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div id="static" i18n-title="m|d" title="introduction"></div>
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
            $r3$.ɵi18nAttributes(1, $_c2$);
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
                <div id="dynamic-1"
                  i18n-title="m|d" title="intro {{ valueA | uppercase }}"
                  i18n-aria-label="m1|d1" aria-label="{{ valueB }}"
                  i18n-aria-roledescription aria-roledescription="static text"
                ></div>
                <div id="dynamic-2"
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
            $r3$.ɵi18nAttributes(2, $_c4$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(3, "div", $_c5$);
            $r3$.ɵi18nAttributes(4, $_c8$);
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
            $r3$.ɵi18nAttributes(3, $_c2$);
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

    it('should support interpolation', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div id="dynamic-1"
                  i18n-title="m|d" title="intro {{ valueA | uppercase }}"
                  i18n-aria-label="m1|d1" aria-label="{{ valueB }}"
                  i18n-aria-roledescription aria-roledescription="static text"
                ></div>
                <div id="dynamic-2"
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
            $r3$.ɵi18nAttributes(2, $_c4$);
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(3, "div", $_c5$);
            $r3$.ɵi18nAttributes(4, $_c8$);
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
            $r3$.ɵi18nAttributes(3, $_c2$);
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

  describe('nested nodes', () => {
    it('should not produce instructions for empty content', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n></div>
                <div i18n>  </div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = String.raw `
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelement(0, "div");
            $r3$.ɵelement(1, "div");
          }
        }
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });


    it('should handle i18n attributes with plain-text content', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n>My i18n block #1</div>
                <div>My non-i18n block #1</div>
                <div i18n>My i18n block #2</div>
                <div>My non-i18n block #2</div>
                <div i18n>My i18n block #3</div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = String.raw `
        const $MSG_APP_SPEC_TS_0$ = goog.getMsg("My i18n block #1");
        const $MSG_APP_SPEC_TS_1$ = goog.getMsg("My i18n block #2");
        const $MSG_APP_SPEC_TS_2$ = goog.getMsg("My i18n block #3");
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_APP_SPEC_TS_0$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(2, "div");
            $r3$.ɵtext(3, "My non-i18n block #1");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(4, "div");
            $r3$.ɵi18nStart(5, $MSG_APP_SPEC_TS_1$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(6, "div");
            $r3$.ɵtext(7, "My non-i18n block #2");
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(8, "div");
            $r3$.ɵi18nStart(9, $MSG_APP_SPEC_TS_2$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
        }
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should handle i18n attributes with bindings in content', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
                <div i18n>My i18n block #{{ one }}</div>
                <div i18n>My i18n block #{{ two | uppercase }}</div>
                <div i18n>My i18n block #{{ three + four + five }}</div>
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = String.raw `
        const $MSG_APP_SPEC_TS_0$ = goog.getMsg("My i18n block #\uFFFD0\uFFFD");
        const $MSG_APP_SPEC_TS_1$ = goog.getMsg("My i18n block #\uFFFD0\uFFFD");
        const $MSG_APP_SPEC_TS_2$ = goog.getMsg("My i18n block #\uFFFD0\uFFFD");
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_APP_SPEC_TS_0$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(2, "div");
            $r3$.ɵi18nStart(3, $MSG_APP_SPEC_TS_1$);
            $r3$.ɵpipe(4, "uppercase");
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(5, "div");
            $r3$.ɵi18nStart(6, $MSG_APP_SPEC_TS_2$);
            $r3$.ɵi18nEnd();
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

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should handle i18n attributes with bindings and nested elements in content', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
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
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = String.raw `
        const $MSG_APP_SPEC_TS_0$ = goog.getMsg("My i18n block #\uFFFD0\uFFFD\uFFFD#2\uFFFDPlain text in nested element\uFFFD/#2\uFFFD");
        const $MSG_APP_SPEC_TS_1$ = goog.getMsg("My i18n block #\uFFFD0\uFFFD\uFFFD#6\uFFFD\uFFFD#7\uFFFD\uFFFD#8\uFFFDMore bindings in more nested element: \uFFFD1\uFFFD\uFFFD/#8\uFFFD\uFFFD/#7\uFFFD\uFFFD/#6\uFFFD");
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_APP_SPEC_TS_0$);
            $r3$.ɵelement(2, "span");
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(3, "div");
            $r3$.ɵi18nStart(4, $MSG_APP_SPEC_TS_1$);
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

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should handle i18n attributes with bindings in content and element attributes', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
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
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = String.raw `
        const $MSG_APP_SPEC_TS_0$ = goog.getMsg("My i18n block #1 with value: \uFFFD0\uFFFD\uFFFD#2\uFFFDPlain text in nested element (block #1)\uFFFD/#2\uFFFD");
        const $MSG_APP_SPEC_TS_1$ = goog.getMsg("Span title \uFFFD0\uFFFD and \uFFFD1\uFFFD");
        const $_c2$ = ["title", $MSG_APP_SPEC_TS_1$, 2];
        const $MSG_APP_SPEC_TS_3$ = goog.getMsg("My i18n block #2 with value \uFFFD0\uFFFD\uFFFD#7\uFFFDPlain text in nested element (block #2)\uFFFD/#7\uFFFD");
        const $MSG_APP_SPEC_TS_4$ = goog.getMsg("Span title \uFFFD0\uFFFD");
        const $_c5$ = ["title", $MSG_APP_SPEC_TS_4$, 1];
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_APP_SPEC_TS_0$);
            $r3$.ɵelementStart(2, "span");
            $r3$.ɵi18nAttributes(3, $_c2$);
            $r3$.ɵelementEnd();
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementStart(4, "div");
            $r3$.ɵi18nStart(5, $MSG_APP_SPEC_TS_3$);
            $r3$.ɵpipe(6, "uppercase");
            $r3$.ɵelementStart(7, "span");
            $r3$.ɵi18nAttributes(8, $_c5$);
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

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should handle i18n attributes in nested templates', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
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
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = String.raw `
        const $_c0$ = [1, "ngIf"];
        const $MSG_APP_SPEC_TS__1$ = goog.getMsg("Some other content \uFFFD0\uFFFD\uFFFD#3\uFFFDMore nested levels with bindings \uFFFD1\uFFFD\uFFFD/#3\uFFFD");
        …
        function MyComponent_div_Template_2(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵi18nStart(2, $MSG_APP_SPEC_TS__1$);
            $r3$.ɵelement(3, "div");
            $r3$.ɵpipe(4, "uppercase");
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            const $$ctx_r0$$ = $r3$.ɵnextContext();
            $r3$.ɵi18nExp($r3$.ɵbind($$ctx_r0$$.valueA));
            $r3$.ɵi18nExp($r3$.ɵbind($r3$.ɵpipeBind1(4, 0, $$ctx_r0$$.valueB)));
            $r3$.ɵi18nApply(2);
          }
        }
        …
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵtext(1, " Some content ");
            $r3$.ɵtemplate(2, MyComponent_div_Template_2, 5, 2, null, $_c0$);
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(2, "ngIf", $r3$.ɵbind(ctx.visible));
          }
        }
      `;

      const result = compile(files, angularFiles);
      expectEmit(result.source, template, 'Incorrect template');
    });

    it('should handle i18n context in nested templates', () => {
      const files = {
        app: {
          'spec.ts': `
            import {Component, NgModule} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: \`
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
              \`
            })
            export class MyComponent {}

            @NgModule({declarations: [MyComponent]})
            export class MyModule {}
          `
        }
      };

      const template = String.raw `
        const $MSG_APP_SPEC_TS_0$ = goog.getMsg("Some content\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFDSome other content \uFFFD0:1\uFFFD\uFFFD#2:1\uFFFDMore nested levels with bindings \uFFFD1:1\uFFFD\uFFFD*4:2\uFFFD\uFFFD#1:2\uFFFDContent inside sub-template \uFFFD0:2\uFFFD\uFFFD#2:2\uFFFDBottom level element \uFFFD1:2\uFFFD\uFFFD/#2:2\uFFFD\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD\uFFFD/#2:1\uFFFD\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD\uFFFD*3:3\uFFFD\uFFFD#1:3\uFFFDSome other content \uFFFD0:3\uFFFD\uFFFD#2:3\uFFFDMore nested levels with bindings \uFFFD1:3\uFFFD\uFFFD/#2:3\uFFFD\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD");
        const $_c1$ = [1, "ngIf"];
        …
        function MyComponent_div_div_Template_4(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $MSG_APP_SPEC_TS_0$, 2);
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
        function MyComponent_div_Template_2(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $MSG_APP_SPEC_TS_0$, 1);
            $r3$.ɵelementStart(1, "div");
            $r3$.ɵelementStart(2, "div");
            $r3$.ɵpipe(3, "uppercase");
            $r3$.ɵtemplate(4, MyComponent_div_div_Template_4, 3, 0, null, $_c1$);
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
        function MyComponent_div_Template_3(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵi18nStart(0, $MSG_APP_SPEC_TS_0$, 3);
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
        template: function MyComponent_Template(rf, ctx) {
          if (rf & 1) {
            $r3$.ɵelementStart(0, "div");
            $r3$.ɵi18nStart(1, $MSG_APP_SPEC_TS_0$);
            $r3$.ɵtemplate(2, MyComponent_div_Template_2, 5, 3, null, $_c1$);
            $r3$.ɵtemplate(3, MyComponent_div_Template_3, 4, 2, null, $_c1$);
            $r3$.ɵi18nEnd();
            $r3$.ɵelementEnd();
          }
          if (rf & 2) {
            $r3$.ɵelementProperty(2, "ngIf", $r3$.ɵbind(ctx.visible));
            $r3$.ɵelementProperty(3, "ngIf", $r3$.ɵbind(!ctx.visible));
          }
        }
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
