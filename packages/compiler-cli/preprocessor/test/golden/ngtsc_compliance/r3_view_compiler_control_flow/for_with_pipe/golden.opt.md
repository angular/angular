# /out/for_with_pipe.ngtypecheck.ts
```ts
/**
 * TCB for /for_with_pipe.ts
 * @generated
 */

import * as i0 from './for_with_pipe';

var _pipe1 = null! as i0.TestPipe;

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*188,195*/ /*188,195*/;
    for (const _t1 /*216,220*/ of _pipe1.transform(
      /*232,236*/ this.items /*224,229*/ /*224,229*/,
    ) /*224,236*/! /*224,236*/) {
      '' + _t1 /*254,258*/;
      _t1 /*244,248*/;
    }
  }
}

```

# /out/for_with_pipe.ts
```ts
import { Component, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵtextInterpolate1(' ', item_r1, ' ');
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
  items = [1, 2, 3];
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
    vars: 3,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵrepeaterCreate(
          2,
          MyApp_For_3_Template,
          1,
          1,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
        );
        i0.ɵɵpipe(4, 'test');
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵrepeater(i0.ɵɵpipeBind1(4, 1, ctx.items));
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
          @for (item of items | test; track item) {
            {{item}}
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
      filePath: 'for_with_pipe.ts',
      lineNumber: 21,
    });
})();

```