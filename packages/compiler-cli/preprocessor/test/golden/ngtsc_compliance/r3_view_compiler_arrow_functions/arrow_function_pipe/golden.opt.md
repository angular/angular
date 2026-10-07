# /out/arrow_function_pipe.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_pipe.ts
 * @generated
 */

import * as i0 from './arrow_function_pipe';

var _pipe1 = null! as i0.TestPipe;

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    '' +
      _pipe1.transform(
        /*237,241*/ (a /*D:ignore*/, b /*D:ignore*/) => a /*229,230*/ + b /*233,234*/ /*229,234*/,
      ) /*219,241*/;
    '' +
      _pipe1.transform(
        /*293,297*/ (a /*D:ignore*/, b /*D:ignore*/) =>
          a /*269,270*/ +
          b /*273,274*/ /*269,274*/ +
          this.componentProp /*277,290*/ /*277,290*/ /*269,290*/,
      ) /*259,297*/;
  }
}

```

# /out/arrow_function_pipe.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (a: any, b: any): any =>
    a + b;
const arrowFn1 =
  (ctx: any, view: any): any =>
  (a: any, b: any): any =>
    a + b + ctx.componentProp;

export class TestPipe implements PipeTransform {
  transform(value: Function) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never> = function TestPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, 'test', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'test',
    type: TestPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestPipe, [{ type: Pipe, args: [{ name: 'test' }] }], null, null);
  }
}

export class TestComp {
  componentProp = 0;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never> = function TestComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['ng-component']],
    decls: 5,
    vars: 8,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, 'test');
        i0.ɵɵdomElement(2, 'hr');
        i0.ɵɵtext(3);
        i0.ɵɵpipe(4, 'test');
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', i0.ɵɵpipeBind1(1, 3, i0.ɵɵarrowFunction(2, arrowFn0, ctx)), ' ');
        i0.ɵɵadvance(3);
        i0.ɵɵtextInterpolate1(' ', i0.ɵɵpipeBind1(4, 6, i0.ɵɵarrowFunction(5, arrowFn1, ctx)), ' ');
      }
    },
    dependencies: [TestPipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        {{(a, b) => a + b | test}}
        <hr>
        {{(a, b) => a + b + componentProp | test}}
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
    i0.ɵsetClassDebugInfo(TestComp, {
      className: 'TestComp',
      filePath: 'arrow_function_pipe.ts',
      lineNumber: 18,
    });
})();

```