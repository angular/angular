# /out/app.component.ts
```ts
import { Component } from '@angular/core';

// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./deferred-a').then((m: any): any => m.default),
  /* @ts-ignore */
  import('./deferred-b').then((m: any): any => m.default),
];
function AppComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'deferred-a')(1, 'deferred-b');
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
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 3,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, AppComponent_Defer_0_Template, 2, 0);
        i0.ɵɵdefer(1, 0, AppComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        AppComponent,
        (): any => [
          /* @ts-ignore */
          import('./deferred-a').then((m: any): any => m.default),
          /* @ts-ignore */
          import('./deferred-b').then((m: any): any => m.default),
        ],
        (DefCompA: any, DefCompB: any): any => {
          i0.ɵsetClassMetadata(
            AppComponent,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'app-root',
                    deferredImports: {
                      block: [DefCompA, DefCompB],
                    },
                    template: `
        @defer (name block) {
          <deferred-a />
          <deferred-b />
        }
      `,
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 17,
    });
})();

```

# /out/deferred-a.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export default class DefCompA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DefCompA, never> = function DefCompA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DefCompA)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DefCompA,
    'deferred-a',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DefCompA,
    selectors: [['deferred-a']],
    decls: 1,
    vars: 0,
    template: function DefCompA_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'A');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DefCompA,
        [
          {
            type: Component,
            args: [
              {
                selector: 'deferred-a',
                template: 'A',
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
    i0.ɵsetClassDebugInfo(DefCompA, {
      className: 'DefCompA',
      filePath: 'deferred-a.ts',
      lineNumber: 7,
    });
})();

```

# /out/deferred-b.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export default class DefCompB {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DefCompB, never> = function DefCompB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DefCompB)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DefCompB,
    'deferred-b',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DefCompB,
    selectors: [['deferred-b']],
    decls: 1,
    vars: 0,
    template: function DefCompB_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'B');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DefCompB,
        [
          {
            type: Component,
            args: [
              {
                selector: 'deferred-b',
                template: 'B',
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
    i0.ɵsetClassDebugInfo(DefCompB, {
      className: 'DefCompB',
      filePath: 'deferred-b.ts',
      lineNumber: 7,
    });
})();

```