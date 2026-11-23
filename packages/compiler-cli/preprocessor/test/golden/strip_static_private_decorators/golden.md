# /out/app.ts
```ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const COMPUTED_KEY = 'computedInput';

function CustomPropDec(): PropertyDecorator {
  return () => {};
}

export class AppComp {
  static staticInput = 'static';
  @CustomPropDec() static customStatic = 'custom';
  #privateInput = 'private';
  [COMPUTED_KEY] = new EventEmitter<void>();
  normalInput = 'normal';
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
    {
      '#privateInput': { 'alias': '#privateInput'; 'required': false };
      'normalInput': { 'alias': 'normalInput'; 'required': false };
    },
    { 'COMPUTED_KEY': 'COMPUTED_KEY' },
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppComp,
      selectors: [['app-comp']],
      inputs: { '#privateInput': '#privateInput', normalInput: 'normalInput' },
      outputs: { COMPUTED_KEY: 'COMPUTED_KEY' },
      decls: 0,
      vars: 0,
      template: function AppComp_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-comp',
                template: '',
              },
            ],
          },
        ],
        null,
        { COMPUTED_KEY: [{ type: Output }], normalInput: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComp, { className: 'AppComp', filePath: 'app.ts', lineNumber: 13 });
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
      "code": 1100,
      "messageText": "Input \"staticInput\" is incorrectly declared as static member of \"AppComp\".",
      "span": {
        "start": 259,
        "end": 298
      }
    }
  ]
}

```