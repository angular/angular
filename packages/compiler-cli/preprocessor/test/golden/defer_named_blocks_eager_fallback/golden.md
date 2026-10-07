# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { EagerCmp } from './eager-cmp';
// @ts-ignore
import * as i0 from '@angular/core';

function AppComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'eager-cmp');
  }
}

export class AppComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-comp']],
    decls: 3,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, AppComponent_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [EagerCmp]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-comp',
                standalone: true,
                imports: [EagerCmp],
                deferredImports: {
                  blockA: [],
                },
                template: `
        @defer (name blockA) {
          <eager-cmp />
        }
      `,
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 17,
    });
})();

```

# /out/eager-cmp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class EagerCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EagerCmp, never> = function EagerCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EagerCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    EagerCmp,
    'eager-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: EagerCmp,
    selectors: [['eager-cmp']],
    decls: 1,
    vars: 0,
    template: function EagerCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Eager');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EagerCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'eager-cmp',
                template: 'Eager',
                standalone: true,
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
    i0.ɵsetClassDebugInfo(EagerCmp, {
      className: 'EagerCmp',
      filePath: 'eager-cmp.ts',
      lineNumber: 8,
    });
})();

```