# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { SharedDep } from './shared-dep';
// @ts-ignore
import * as i0 from '@angular/core';

const AppComponent_Defer_1_DepsFn = (): any => [SharedDep];
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
    decls: 6,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, AppComponent_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, AppComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(3, AppComponent_Defer_3_Template, 1, 0);
        i0.ɵɵdefer(4, 3, AppComponent_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [SharedDep]),
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
                imports: [SharedDep],
                deferredImports: {
                  blockA: [SharedDep],
                  blockB: [SharedDep],
                },
                template: `
        @defer (name blockA) {
          <shared-dep />
        }
        @defer (name blockB) {
          <shared-dep />
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
      lineNumber: 21,
    });
})();

```

# /out/shared-dep.ts
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
      filePath: 'shared-dep.ts',
      lineNumber: 8,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/app.component.ts",
      "category": "error",
      "code": 8014,
      "messageText": "This import contains symbols that are used both inside and outside of the `@Component.deferredImports` fields in the file. This renders all these defer imports useless as this import remains and its module is eagerly loaded. To fix this, make sure that all symbols from the import are *only* used within `@Component.deferredImports` arrays and there are no other references to those symbols present in this file.",
      "span": {
        "start": 43,
        "end": 84
      }
    }
  ]
}

```