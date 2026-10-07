# /out/if_with_pipe.ngtypecheck.ts
```ts
/**
 * TCB for /if_with_pipe.ts
 * @generated
 */

import * as i0 from './if_with_pipe';

var _pipe1 = null! as i0.TestPipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*188,195*/ /*188,195*/;
    if (
      _pipe1.transform(/*222,226*/ this.val /*216,219*/ /*216,219*/) /*216,226*/ ===
      1 /*232,233*/ /*215,233*/
    ) {
    } else if (
      _pipe1.transform(/*274,278*/ this.val /*268,271*/ /*268,271*/) /*268,278*/ ===
      2 /*284,285*/ /*267,285*/
    ) {
    } else {
    }
  }
}

```

# /out/if_with_pipe.ts
```ts
import { Component, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' one ');
  }
}
function MyApp_Conditional_5_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' two ');
  }
}
function MyApp_Conditional_6_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' three ');
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
  val = 1;
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
    decls: 7,
    vars: 6,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 0);
        i0.ɵɵpipe(3, 'test');
        i0.ɵɵpipe(4, 'test');
        i0.ɵɵconditionalBranchCreate(5, MyApp_Conditional_5_Template, 1, 0)(
          6,
          MyApp_Conditional_6_Template,
          1,
          0,
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional(
          i0.ɵɵpipeBind1(3, 2, ctx.val) === 1 ? 2 : i0.ɵɵpipeBind1(4, 4, ctx.val) === 2 ? 5 : 6,
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
          @if ((val | test) === 1) {
            one
          } @else if ((val | test) === 2) {
            two
          } @else {
            three
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
      filePath: 'if_with_pipe.ts',
      lineNumber: 25,
    });
})();

```