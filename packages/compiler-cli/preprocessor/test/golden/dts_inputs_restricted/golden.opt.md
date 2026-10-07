# /out/app.component.ngtypecheck.ts
```ts
/**
 * TCB for /app.component.ts
 * @generated
 */

import * as i0 from './app.component';
import * as i1 from 'test-lib';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*141,252*/ = null! as i1.TestComponent; /*T:VAE*/
    var _t2 = null! as (typeof _t1)['privateInput']; /*T:VAE*/
    _t2 /*159,171*/ = 'val1' /*174,180*/ /*158,181*/;
    var _t3 = null! as (typeof _t1)['protectedInput']; /*T:VAE*/
    _t3 /*190,204*/ = 'val2' /*207,213*/ /*189,214*/;
    var _t4 = null! as (typeof _t1)['readonlyInput']; /*T:VAE*/
    _t4 /*223,236*/ = 'val3' /*239,245*/ /*222,246*/;
  }
}

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { TestComponent } from 'test-lib';
// @ts-ignore
import * as i0 from '@angular/core';

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
    decls: 1,
    vars: 3,
    consts: [[3, 'privateInput', 'protectedInput', 'readonlyInput']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'test-cmp', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('privateInput', 'val1')('protectedInput', 'val2')('readonlyInput', 'val3');
      }
    },
    dependencies: [TestComponent],
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
                selector: 'app-root',
                template: `
        <test-cmp 
          [privateInput]="'val1'" 
          [protectedInput]="'val2'" 
          [readonlyInput]="'val3'"
        ></test-cmp>
      `,
                standalone: true,
                imports: [TestComponent],
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
      lineNumber: 16,
    });
})();

```