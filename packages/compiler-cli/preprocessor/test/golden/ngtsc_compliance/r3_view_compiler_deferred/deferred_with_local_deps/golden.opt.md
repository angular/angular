# /out/deferred_with_local_deps.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_with_local_deps.ts
 * @generated
 */

import * as i0 from './deferred_with_local_deps';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/deferred_with_local_deps.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const MyApp_Defer_4_DepsFn = (): any => [LazyDep];
function MyApp_Defer_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'lazy-dep');
  }
}
function MyApp_DeferLoading_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'loading-dep');
  }
}

export class EagerDep {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EagerDep, never> = function EagerDep_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EagerDep)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    EagerDep,
    'eager-dep',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: EagerDep, selectors: [['eager-dep']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EagerDep,
        [{ type: Directive, args: [{ selector: 'eager-dep' }] }],
        null,
        null,
      );
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
        [{ type: Directive, args: [{ selector: 'lazy-dep' }] }],
        null,
        null,
      );
  }
}

export class LoadingDep {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LoadingDep, never> = function LoadingDep_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LoadingDep)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LoadingDep,
    'loading-dep',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: LoadingDep, selectors: [['loading-dep']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LoadingDep,
        [{ type: Directive, args: [{ selector: 'loading-dep' }] }],
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
    decls: 6,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵelement(1, 'eager-dep');
        i0.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 1, 0)(3, MyApp_DeferLoading_3_Template, 1, 0);
        i0.ɵɵdefer(4, 2, MyApp_Defer_4_DepsFn, 3);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [EagerDep, LoadingDep],
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
          <eager-dep/>
          @defer {
            <lazy-dep/>
          } @loading {
            <loading-dep/>
          }
        </div>
      `,
                imports: [EagerDep, LazyDep, LoadingDep],
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
      filePath: 'deferred_with_local_deps.ts',
      lineNumber: 28,
    });
})();

```