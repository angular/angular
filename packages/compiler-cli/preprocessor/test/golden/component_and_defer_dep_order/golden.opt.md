# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './lazy';

var _pipe1 = null! as i1.MyPipe;

/*tcb1*/
function _tcb1(this: i0.AppComp) {
  if (true) {
    '' + _pipe1.transform(/*202,208*/ 'hi' /*195,199*/) /*195,208*/;
  }
}

```

# /out/app.ts
```ts
import { Component } from '@angular/core';

// @ts-ignore
import * as i0 from '@angular/core';

const AppComp_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./lazy').then((m: any): any => m.DirA),
  /* @ts-ignore */
  import('./lazy').then((m: any): any => m.DirB),
  /* @ts-ignore */
  import('./lazy').then((m: any): any => m.MyPipe),
];
function AppComp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 0);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, 'myPipe');
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, 'hi'));
  }
}

export class AppComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComp, never> = function AppComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComp,
    'app-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppComp,
      selectors: [['app-comp']],
      decls: 3,
      vars: 0,
      consts: [['dirB', '', 'dirA', '']],
      template: function AppComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵdomTemplate(0, AppComp_Defer_0_Template, 3, 3);
          i0.ɵɵdefer(1, 0, AppComp_Defer_1_DepsFn);
          i0.ɵɵdeferOnIdle();
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        AppComp,
        (): any => [
          /* @ts-ignore */
          import('./lazy').then((m: any): any => m.DirA),
          /* @ts-ignore */
          import('./lazy').then((m: any): any => m.DirB),
          /* @ts-ignore */
          import('./lazy').then((m: any): any => m.MyPipe),
        ],
        (DirA: any, DirB: any, MyPipe: any): any => {
          i0.ɵsetClassMetadata(
            AppComp,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-comp',
                    imports: [MyPipe, DirA, DirB],
                    template: '@defer { <div dirB dirA>{{ "hi" | myPipe }}</div> }',
                  },
                ],
              },
            ],
            null,
            null,
          );
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComp, { className: 'AppComp', filePath: 'app.ts', lineNumber: 9 });
})();

```

# /out/lazy.ts
```ts
import { Directive, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyPipe implements PipeTransform {
  transform(v: string): string {
    return v;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never> = function MyPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, 'myPipe', true> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'myPipe', type: MyPipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'myPipe',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class DirA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirA, never> = function DirA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirA)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<DirA, '[dirA]', never, {}, {}, never, never, true, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DirA, selectors: [['', 'dirA', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirA,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirA]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class DirB {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirB, never> = function DirB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirB)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<DirB, '[dirB]', never, {}, {}, never, never, true, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: DirB, selectors: [['', 'dirB', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirB,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirB]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```