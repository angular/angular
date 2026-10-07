# /out/important.ngtypecheck.ts
```ts
/**
 * TCB for /important.ts
 * @generated
 */

import * as i0 from './important';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.myHeightExp /*155,166*/ /*155,166*/;
    this.myBarClassExp /*200,213*/ /*200,213*/;
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myStyleExp /*264,274*/ /*264,274*/;
    this.myClassExp /*303,313*/ /*303,313*/;
    this.myFooClassExp /*422,443*/ /*422,443*/;
    this.myWidthExp /*483,506*/ /*483,506*/;
  }
}

```

# /out/important.ts
```ts
import { Component, HostBinding, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  myStyleExp = '';
  myClassExp = '';

  myFooClassExp = true;

  myWidthExp = '100px';

  myBarClassExp = true;
  myHeightExp = '200px';
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
    hostVars: 6,
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleProp('width', ctx.myWidthExp);
        i0.ɵɵclassProp('baz', ctx.myClassExp)('foo', ctx.myFooClassExp);
      }
    },
    standalone: false,
    decls: 1,
    vars: 4,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('height', ctx.myHeightExp);
        i0.ɵɵclassProp('bar', ctx.myBarClassExp);
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
                template: `
        <div [style.height!important]="myHeightExp"
             [class.bar!important]="myBarClassExp"></div>
      `,
                host: {
                  '[style.width!important]': 'myStyleExp',
                  '[class.baz!important]': 'myClassExp',
                },
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myFooClassExp: [{ type: HostBinding, args: ['class.foo!important'] }],
          myWidthExp: [{ type: HostBinding, args: ['style.width!important'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'important.ts',
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