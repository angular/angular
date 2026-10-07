# /out/class_ordering.ngtypecheck.ts
```ts
/**
 * TCB for /class_ordering.ts
 * @generated
 */

import * as i0 from './class_ordering';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    ('banana') /*151,159*/;
    this.yesToApple /*180,190*/ /*180,190*/;
    this.myClassExp /*205,215*/ /*205,215*/;
    this.yesToOrange /*237,248*/ /*237,248*/;
  }
}

```

# /out/class_ordering.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  myClassExp = { a: true, b: true };
  yesToApple = true;
  yesToOrange = true;
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
    consts: [[1, 'grape']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵclassMap(ctx.myClassExp);
        i0.ɵɵclassProp('apple', ctx.yesToApple)('orange', ctx.yesToOrange);
        i0.ɵɵattribute('class', 'banana');
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
                template: `<div
        class="grape"
        [attr.class]="'banana'"
        [class.apple]="yesToApple"
        [class]="myClassExp"
        [class.orange]="yesToOrange"></div>`,
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
      filePath: 'class_ordering.ts',
      lineNumber: 13,
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