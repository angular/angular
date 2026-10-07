# /out/deferred_when_with_pipe.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_when_with_pipe.ts
 * @generated
 */

import * as i0 from './deferred_when_with_pipe';

var _pipe1 = null! as i0.TestPipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*167,174*/ /*167,174*/;
    if (
      this
        .isVisible /*198,207*/
        () /*198,209*/ &&
      _pipe1.transform(/*224,232*/ this.isReady /*214,221*/ /*214,221*/) /*214,232*/ /*198,233*/
    ) {
    }
  }
}

```

# /out/deferred_when_with_pipe.ts
```ts
import { Component, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Hello ');
  }
}

export class TestPipe {
  transform() {
    return true;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never> = function TestPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, 'testPipe', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'testPipe',
    type: TestPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestPipe, [{ type: Pipe, args: [{ name: 'testPipe' }] }], null, null);
  }
}

export class MyApp {
  message = 'hello';
  isReady = true;

  isVisible() {
    return false;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    decls: 5,
    vars: 4,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 0);
        i0.ɵɵdefer(2, 1);
        i0.ɵɵpipe(4, 'testPipe');
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance(2);
        i0.ɵɵdeferWhen(ctx.isVisible() && i0.ɵɵpipeBind1(4, 2, ctx.isReady));
      }
    },
    dependencies: [TestPipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        {{message}}
        @defer (when isVisible() && (isReady | testPipe)) {
          Hello
        }
      `,
                imports: [TestPipe],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'deferred_when_with_pipe.ts',
      lineNumber: 19,
    });
})();

```