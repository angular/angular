# /out/custom_decorator_es5.ngtypecheck.ts
```ts
/**
 * TCB for /custom_decorator_es5.ts
 * @generated
 */

import * as i0 from './custom_decorator_es5';

/*tcb1*/
function _tcb1(this: i0.Comp) {
  if (true) {
  }
}

```

# /out/custom_decorator_es5.ts
```ts
import { Component, InjectionToken } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const token = new InjectionToken('token');

export function Custom() {
  return function (target: any) {};
}

@Custom()
export class Comp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Comp, never> = function Comp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Comp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Comp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Comp,
    selectors: [['ng-component']],
    features: [i0.ɵɵProvidersFeature([{ provide: token, useExisting: Comp }])],
    decls: 0,
    vars: 0,
    template: function Comp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Comp,
        [
          {
            type: Component,
            args: [
              {
                template: '',
                providers: [{ provide: token, useExisting: Comp }],
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
    i0.ɵsetClassDebugInfo(Comp, {
      className: 'Comp',
      filePath: 'custom_decorator_es5.ts',
      lineNumber: 14,
    });
})();

```