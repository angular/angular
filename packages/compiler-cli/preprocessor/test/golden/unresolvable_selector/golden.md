# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const DYNAMIC_SELECTOR = 'app-' + Math.random();

export class BadComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BadComponent, never> = function BadComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BadComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    BadComponent,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: BadComponent,
    selectors: [['ng-component']],
    decls: 2,
    vars: 0,
    template: function BadComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Hello World');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BadComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: DYNAMIC_SELECTOR,
                template: '<div>Hello World</div>',
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
    i0.ɵsetClassDebugInfo(BadComponent, {
      className: 'BadComponent',
      filePath: 'app.component.ts',
      lineNumber: 9,
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
      "code": 1010,
      "messageText": "selector must be a string",
      "span": {
        "start": 118,
        "end": 134
      }
    }
  ]
}

```