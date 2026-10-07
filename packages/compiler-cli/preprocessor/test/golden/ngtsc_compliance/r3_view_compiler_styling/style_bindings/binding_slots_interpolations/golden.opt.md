# /out/binding_slots_interpolations.ngtypecheck.ts
```ts
/**
 * TCB for /binding_slots_interpolations.ts
 * @generated
 */

import * as i0 from './binding_slots_interpolations';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    ('border-width: 10px') /*166,186*/;
    this.myWidth /*222,229*/ /*222,229*/;
    this.myStyleExp /*259,269*/ /*259,269*/;
    this.myHeight /*306,314*/ /*306,314*/;
  }
}

```

# /out/binding_slots_interpolations.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  myStyleExp = [{ color: 'red' }, { color: 'blue', duration: 1000 }];
  myWidth = '100px';
  myHeight = '100px';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 1,
    vars: 7,
    consts: [[2, 'opacity', '1']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵstyleMap(ctx.myStyleExp);
        i0.ɵɵstyleProp('width', ctx.myWidth)('height', ctx.myHeight);
        i0.ɵɵattribute('style', 'border-width: 10px', i0.ɵɵsanitizeStyle);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component',
                template: `<div style="opacity:1"
                       [attr.style]="'border-width: 10px'"
                       [style.width]="myWidth"
                       [style]="myStyleExp"
                       [style.height]="myHeight"></div>`,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'binding_slots_interpolations.ts',
      lineNumber: 12,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

```