# /out/deferred_without_deps_followed_by_one_with.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_without_deps_followed_by_one_with.ts
 * @generated
 */

import * as i0 from './deferred_without_deps_followed_by_one_with';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/deferred_without_deps_followed_by_one_with.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const MyApp_Defer_5_DepsFn = (): any => [LazyDep];
function MyApp_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, " I'm so independent! ");
  }
}
function MyApp_Defer_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'lazy-dep');
  }
}

export class LazyDep {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LazyDep, never> = function LazyDep_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LazyDep)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LazyDep,
    'lazy-dep',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: LazyDep, selectors: [['lazy-dep']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LazyDep,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'lazy-dep',
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
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 0);
        i0.ɵɵdefer(2, 1);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(4, MyApp_Defer_4_Template, 1, 0);
        i0.ɵɵdefer(5, 4, MyApp_Defer_5_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵelementEnd();
      }
    },
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
          @defer {
            I'm so independent!
          }
          @defer {
            <lazy-dep/>
          }
        </div>
      `,
                imports: [LazyDep],
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
      filePath: 'deferred_without_deps_followed_by_one_with.ts',
      lineNumber: 22,
    });
})();

```