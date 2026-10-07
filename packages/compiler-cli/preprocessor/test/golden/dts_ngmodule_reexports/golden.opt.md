# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './feature-component';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*197,229*/ = null! as i1.MyFeatureComponent; /*T:VAE*/
    _t1.myProp /*211,217*/ = 'hello' /*220,227*/ /*210,228*/;
  }
}

```

# /out/app.ts
```ts
import { Component } from '@angular/core';
import { MyFeatureModule } from './feature-module';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './feature-component';

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
    vars: 1,
    consts: [[3, 'myProp']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'feature-cmp', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('myProp', 'hello');
      }
    },
    dependencies: [MyFeatureModule, i1.MyFeatureComponent],
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
                standalone: true,
                imports: [MyFeatureModule],
                template: `
        <feature-cmp [myProp]="'hello'"></feature-cmp>
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
      filePath: 'app.ts',
      lineNumber: 12,
    });
})();

```