# /out/app.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BaseClass {
  constructor(public arg: string) {}
}

export class ChildComp extends BaseClass {
  // Declares its own constructor. Should generate own ctor deps.
  constructor(
    arg: string,
    public extra: number,
  ) {
    super(arg);
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildComp, never> = function ChildComp_Factory(
    __ngFactoryType__: any,
  ): any {
    i0.ɵɵinvalidFactory();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ChildComp,
    'app-child',
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
      type: ChildComp,
      selectors: [['app-child']],
      features: [i0.ɵɵInheritDefinitionFeature],
      decls: 1,
      vars: 0,
      template: function ChildComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'div');
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ChildComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-child',
                template: '<div></div>',
              },
            ],
          },
        ],
        (): any => [{ type: undefined }, { type: undefined }],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ChildComp, {
      className: 'ChildComp',
      filePath: 'app.ts',
      lineNumber: 11,
    });
})();

export class ChildZeroComp extends BaseClass {
  // Declares its own 0-argument constructor. Should generate normal factory.
  constructor() {
    super('zero');
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildZeroComp, never> = function ChildZeroComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ChildZeroComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ChildZeroComp,
    'app-child-zero',
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
      type: ChildZeroComp,
      selectors: [['app-child-zero']],
      features: [i0.ɵɵInheritDefinitionFeature],
      decls: 1,
      vars: 0,
      template: function ChildZeroComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'div');
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ChildZeroComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-child-zero',
                template: '<div></div>',
              },
            ],
          },
        ],
        (): any => [],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ChildZeroComp, {
      className: 'ChildZeroComp',
      filePath: 'app.ts',
      lineNumber: 22,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/app.ts",
      "category": "error",
      "code": 2003,
      "messageText": "No suitable injection token for parameter 'arg' of class 'ChildComp'. Find more at https://next.angular.dev/errors/NG2003\n  Consider using the @Inject decorator to specify an injection token.",
      "span": {
        "start": 300,
        "end": 303
      },
      "relatedInformation": [
        {
          "filePath": "/app.ts",
          "span": {
            "start": 305,
            "end": 311
          },
          "messageText": "This type is not supported as injection token."
        }
      ]
    }
  ]
}

```