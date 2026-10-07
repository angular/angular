# /out/switch_with_pipe.ngtypecheck.ts
```ts
/**
 * TCB for /switch_with_pipe.ts
 * @generated
 */

import * as i0 from './switch_with_pipe';

var _pipe1 = null! as i0.TestPipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*188,195*/ /*188,195*/;
    switch (
      _pipe1.transform(
        /*229,233*/ this
          .value /*219,224*/
          () /*219,226*/,
      ) /*219,233*/
    ) {
      case _pipe1.transform(/*256,260*/ 0 /*252,253*/) /*252,260*/:
        break;
      case _pipe1.transform(/*310,314*/ 1 /*306,307*/) /*306,314*/:
        break;
      default:
        break;
    }
  }
}

```

# /out/switch_with_pipe.ts
```ts
import { Component, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Case_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' case 0 ');
  }
}
function MyApp_Case_6_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' case 1 ');
  }
}
function MyApp_Case_7_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' default ');
  }
}

export class TestPipe {
  transform(value: unknown) {
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

export class MyApp {
  message = 'hello';
  value = () => 1;
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
    decls: 8,
    vars: 8,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 1, 0);
        i0.ɵɵpipe(3, 'test');
        i0.ɵɵpipe(4, 'test');
        i0.ɵɵpipe(5, 'test');
        i0.ɵɵconditionalBranchCreate(6, MyApp_Case_6_Template, 1, 0)(
          7,
          MyApp_Case_7_Template,
          1,
          0,
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional(
          (tmp_1_0 = i0.ɵɵpipeBind1(3, 2, ctx.value())) === i0.ɵɵpipeBind1(4, 4, 0)
            ? 2
            : tmp_1_0 === i0.ɵɵpipeBind1(5, 6, 1)
              ? 6
              : 7,
        );
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
        <div>
          {{message}}
          @switch (value() | test) {
            @case (0 | test) {
              case 0
            }
            @case (1 | test) {
              case 1
            }
            @default {
              default
            }
          }
        </div>
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
      filePath: 'switch_with_pipe.ts',
      lineNumber: 29,
    });
})();

```