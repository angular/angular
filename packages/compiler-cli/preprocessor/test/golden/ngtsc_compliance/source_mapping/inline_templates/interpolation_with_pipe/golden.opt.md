# /out/interpolation_with_pipe.ngtypecheck.ts
```ts
/**
 * TCB for /interpolation_with_pipe.ts
 * @generated
 */

import * as i0 from './interpolation_with_pipe';

var _pipe1 = null! as i0.PercentPipe;

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    '' + _pipe1.transform(/*142,149*/ 200.3 /*134,139*/, 2 /*152,153*/) /*134,153*/;
  }
}

```

# /out/interpolation_with_pipe.ts
```ts
import { Component, NgModule, Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    standalone: false,
    decls: 3,
    vars: 4,
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵpipe(2, 'percent');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, 200.3, 2));
      }
    },
    dependencies: (): any => [PercentPipe],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                template: '<div>{{200.3 | percent : 2 }}</div>',
                standalone: false,
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'interpolation_with_pipe.ts',
      lineNumber: 8,
    });
})();

export class PercentPipe implements PipeTransform {
  transform() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PercentPipe, never> = function PercentPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PercentPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PercentPipe, 'percent', false> = /*@__PURE__*/ i0.ɵɵdefinePipe(
    { name: 'percent', type: PercentPipe, pure: true, standalone: false },
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PercentPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'percent',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    [typeof TestCmp, typeof PercentPipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [{ type: NgModule, args: [{ declarations: [TestCmp, PercentPipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [TestCmp, PercentPipe] });
})();

```