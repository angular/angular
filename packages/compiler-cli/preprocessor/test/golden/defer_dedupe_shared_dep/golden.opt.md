# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';

// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./shared.cmp').then((m: any): any => m.SharedDep),
];
const AppComponent_Defer_7_DepsFn = (): any => [
  /* @ts-ignore */
  import('./other.cmp').then((m: any): any => m.OtherDep),
];
function AppComponent_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'shared-dep');
  }
}
function AppComponent_Defer_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'shared-dep');
  }
}
function AppComponent_Defer_6_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'other-dep');
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
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['ng-component']],
    decls: 9,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, AppComponent_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, AppComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(3, AppComponent_Defer_3_Template, 1, 0);
        i0.ɵɵdefer(4, 3, AppComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(6, AppComponent_Defer_6_Template, 1, 0);
        i0.ɵɵdefer(7, 6, AppComponent_Defer_7_DepsFn);
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
          import('./shared.cmp').then((m: any): any => m.SharedDep),
          /* @ts-ignore */
          import('./other.cmp').then((m: any): any => m.OtherDep),
        ],
        (SharedDep: any, OtherDep: any): any => {
          i0.ɵsetClassMetadata(
            AppComponent,
            [
              {
                type: Component,
                args: [
                  {
                    template: `
        @defer {
          <shared-dep/>
        }

        @defer {
          <shared-dep/>
        }

        @defer {
          <other-dep/>
        }
      `,
                    standalone: true,
                    imports: [SharedDep, OtherDep],
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
      lineNumber: 22,
    });
})();

```

# /out/other.cmp.ngtypecheck.ts
```ts
/**
 * TCB for /other.cmp.ts
 * @generated
 */

import * as i0 from './other.cmp';

/*tcb1*/
function _tcb1(this: i0.OtherDep) {
  if (true) {
  }
}

```

# /out/other.cmp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class OtherDep {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OtherDep, never> = function OtherDep_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || OtherDep)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    OtherDep,
    'other-dep',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OtherDep,
    selectors: [['other-dep']],
    decls: 1,
    vars: 0,
    template: function OtherDep_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Other');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OtherDep,
        [
          {
            type: Component,
            args: [
              {
                selector: 'other-dep',
                template: 'Other',
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
    i0.ɵsetClassDebugInfo(OtherDep, {
      className: 'OtherDep',
      filePath: 'other.cmp.ts',
      lineNumber: 8,
    });
})();

```

# /out/shared.cmp.ngtypecheck.ts
```ts
/**
 * TCB for /shared.cmp.ts
 * @generated
 */

import * as i0 from './shared.cmp';

/*tcb1*/
function _tcb1(this: i0.SharedDep) {
  if (true) {
  }
}

```

# /out/shared.cmp.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SharedDep {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedDep, never> = function SharedDep_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedDep)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SharedDep,
    'shared-dep',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SharedDep,
    selectors: [['shared-dep']],
    decls: 1,
    vars: 0,
    template: function SharedDep_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Shared');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SharedDep,
        [
          {
            type: Component,
            args: [
              {
                selector: 'shared-dep',
                template: 'Shared',
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
    i0.ɵsetClassDebugInfo(SharedDep, {
      className: 'SharedDep',
      filePath: 'shared.cmp.ts',
      lineNumber: 8,
    });
})();

```