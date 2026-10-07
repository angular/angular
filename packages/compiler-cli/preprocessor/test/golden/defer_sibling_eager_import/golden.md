# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { SharedDep } from './shared-dep';
// @ts-ignore
import * as i0 from '@angular/core';

const ParentCmp_Defer_1_DepsFn = (): any => [
  /* @ts-ignore */
  import('./shared-dep').then((m: any): any => m.SharedDep),
];
function ParentCmp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'shared-dep');
  }
}

export class ParentCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ParentCmp, never> = function ParentCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ParentCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ParentCmp,
    'parent-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ParentCmp,
    selectors: [['parent-cmp']],
    decls: 3,
    vars: 0,
    template: function ParentCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, ParentCmp_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, ParentCmp_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadataAsync(
        ParentCmp,
        (): any => [
          /* @ts-ignore */
          import('./shared-dep').then((m: any): any => m.SharedDep),
        ],
        (SharedDep: any): any => {
          i0.ɵsetClassMetadata(
            ParentCmp,
            [
              {
                type: Component,
                args: [
                  {
                    selector: 'parent-cmp',
                    deferredImports: {
                      block: [SharedDep],
                    },
                    template: `
        @defer (name block) {
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
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ParentCmp, {
      className: 'ParentCmp',
      filePath: 'app.component.ts',
      lineNumber: 15,
    });
})();

export class HelperCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HelperCmp, never> = function HelperCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HelperCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HelperCmp,
    'helper-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HelperCmp,
    selectors: [['helper-cmp']],
    decls: 1,
    vars: 0,
    template: function HelperCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'shared-dep');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(HelperCmp, [SharedDep]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HelperCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'helper-cmp',
                imports: [SharedDep],
                template: `<shared-dep />`,
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
    i0.ɵsetClassDebugInfo(HelperCmp, {
      className: 'HelperCmp',
      filePath: 'app.component.ts',
      lineNumber: 22,
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
      lineNumber: 7,
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