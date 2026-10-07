# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './my-module';

/*tcb1*/
function _tcb1(this: i0.AppComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*190,220*/ = null! as i1.MyDtsDirective; /*T:VAE*/
    _t1.myProp /*203,209*/ = 'test' /*212,218*/ /*202,219*/;
    var _t2 /*T:DIR:0*/ /*231,257*/ = null! as i1.MyDtsComponent; /*T:VAE*/
    _t2.myProp /*240,246*/ = 'test' /*249,255*/ /*239,256*/;
  }
}

```

# /out/app.ts
```ts
import { Component } from '@angular/core';
import { MyNestedModule } from './my-module';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './my-module';

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
    decls: 2,
    vars: 2,
    consts: [
      ['my-dir', '', 3, 'myProp'],
      [3, 'myProp'],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0)(1, 'my-cmp', 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty('myProp', 'test');
        i0.ɵɵadvance();
        i0.ɵɵproperty('myProp', 'test');
      }
    },
    dependencies: [MyNestedModule, i1.MyDtsDirective, i1.MyDtsComponent],
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
                imports: [MyNestedModule],
                template: `
        <div my-dir [myProp]="'test'"></div>
        <my-cmp [myProp]="'test'"></my-cmp>
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
      lineNumber: 13,
    });
})();

```