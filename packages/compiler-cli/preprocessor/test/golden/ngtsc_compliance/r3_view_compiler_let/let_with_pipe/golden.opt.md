# /out/let_with_pipe.ngtypecheck.ts
```ts
/**
 * TCB for /let_with_pipe.ts
 * @generated
 */

import * as i0 from './let_with_pipe';

var _pipe1 = null! as i0.DoublePipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t1 /*237,240*/ =
      this.value /*243,248*/ /*243,248*/ + 1 /*251,252*/ /*243,252*/; /*232,253*/
    const _t2 /*263,269*/ = _pipe1.transform(/*278,284*/ _t1 /*272,275*/) /*272,284*/; /*258,285*/
    '' + _t2 /*302,308*/;
  }
}

```

# /out/let_with_pipe.ts
```ts
import { Component, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DoublePipe implements PipeTransform {
  transform(value: number) {
    return value * 2;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DoublePipe, never> = function DoublePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DoublePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<DoublePipe, 'double', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'double',
    type: DoublePipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DoublePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'double',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class MyApp {
  value = 1;
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
    decls: 3,
    vars: 3,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵpipe(1, 'double');
        i0.ɵɵtext(2);
      }
      if (rf & 2) {
        const one_r1: any = ctx.value + 1;
        const result_r2: any = i0.ɵɵpipeBind1(1, 1, one_r1);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(' The result is ', result_r2, ' ');
      }
    },
    dependencies: [DoublePipe],
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
        @let one = value + 1;
        @let result = one | double;
        The result is {{result}}
      `,
                imports: [DoublePipe],
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
      filePath: 'let_with_pipe.ts',
      lineNumber: 20,
    });
})();

```