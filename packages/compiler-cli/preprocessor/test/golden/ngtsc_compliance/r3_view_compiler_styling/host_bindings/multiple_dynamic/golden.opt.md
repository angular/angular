# /out/multiple_dynamic.ngtypecheck.ts
```ts
/**
 * TCB for /multiple_dynamic.ts
 * @generated
 */

import * as i0 from './multiple_dynamic';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myHeightProp /*160,172*/ /*160,172*/;
    this.myBarClass /*191,201*/ /*191,201*/;
    this.myStyle /*316,323*/ /*316,323*/;
    this.myWidthProp /*355,368*/ /*355,368*/;
    this.myFooClass /*409,420*/ /*409,420*/;
    this.myClasses /*457,464*/ /*457,464*/;
  }
}

```

# /out/multiple_dynamic.ts
```ts
import { Component, HostBinding, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  myHeightProp = 20;
  myBarClass = true;

  myStyle = {};

  myWidthProp = '500px';

  myFooClass = true;

  myClasses = { a: true, b: true };
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
    hostVars: 12,
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleMap(ctx.myStyle);
        i0.ɵɵclassMap(ctx.myClasses);
        i0.ɵɵstyleProp('height', ctx.myHeightProp, 'pt')('width', ctx.myWidthProp);
        i0.ɵɵclassProp('bar', ctx.myBarClass)('foo', ctx.myFooClass);
      }
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {},
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
                template: '',
                host: { '[style.height.pt]': 'myHeightProp', '[class.bar]': 'myBarClass' },
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myStyle: [{ type: HostBinding, args: ['style'] }],
          myWidthProp: [{ type: HostBinding, args: ['style.width'] }],
          myFooClass: [{ type: HostBinding, args: ['class.foo'] }],
          myClasses: [{ type: HostBinding, args: ['class'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'multiple_dynamic.ts',
      lineNumber: 9,
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