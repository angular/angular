# /out/static_and_dynamic.ngtypecheck.ts
```ts
/**
 * TCB for /static_and_dynamic.ts
 * @generated
 */

import * as i0 from './static_and_dynamic';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myStyle /*265,272*/ /*265,272*/;
    this.myClass /*318,325*/ /*318,325*/;
    this.myColorProp /*367,380*/ /*367,380*/;
    this.myFooClass /*419,430*/ /*419,430*/;
  }
}

```

# /out/static_and_dynamic.ts
```ts
import { Component, HostBinding, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  myStyle = { width: '100px' };

  myClass = { bar: false };

  myColorProp = 'red';

  myFooClass = 'red';
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
    hostAttrs: [1, 'foo', 'baz', 2, 'width', '200px', 'height', '500px'],
    hostVars: 8,
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleMap(ctx.myStyle);
        i0.ɵɵclassMap(ctx.myClass);
        i0.ɵɵstyleProp('color', ctx.myColorProp);
        i0.ɵɵclassProp('foo', ctx.myFooClass);
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
                host: { 'style': 'width:200px; height:500px', 'class': 'foo baz' },
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myStyle: [{ type: HostBinding, args: ['style'] }],
          myClass: [{ type: HostBinding, args: ['class'] }],
          myColorProp: [{ type: HostBinding, args: ['style.color'] }],
          myFooClass: [{ type: HostBinding, args: ['class.foo'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'static_and_dynamic.ts',
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