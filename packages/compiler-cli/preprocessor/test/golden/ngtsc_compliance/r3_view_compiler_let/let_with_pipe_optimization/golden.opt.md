# /out/let_with_pipe_optimization.ngtypecheck.ts
```ts
/**
 * TCB for /let_with_pipe_optimization.ts
 * @generated
 */

import * as i0 from './let_with_pipe_optimization';

var _pipe1 = null! as i0.DoublePipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t1 /*237,240*/ =
      _pipe1.transform(/*252,258*/ this.value /*244,249*/ /*244,249*/) /*244,258*/ +
      3 /*262,263*/ /*243,263*/; /*232,264*/
    '' + _t1 /*267,270*/;
  }
}

```

# /out/let_with_pipe_optimization.ts
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
        const foo_r1: any = i0.ɵɵpipeBind1(1, 1, ctx.value) + 3;
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(' ', foo_r1, ' ');
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
        @let foo = (value | double) + 3;
        {{foo}}
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
      filePath: 'let_with_pipe_optimization.ts',
      lineNumber: 19,
    });
})();

```