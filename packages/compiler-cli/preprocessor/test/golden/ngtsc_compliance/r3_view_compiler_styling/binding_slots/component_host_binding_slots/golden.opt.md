# /out/component_host_binding_slots.ngtypecheck.ts
```ts
/**
 * TCB for /component_host_binding_slots.ts
 * @generated
 */

import * as i0 from './component_host_binding_slots';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myStyle /*294,301*/ /*294,301*/;
    this.myClass /*347,354*/ /*347,354*/;
    this.id /*396,400*/ /*396,400*/;
    this.title /*434,441*/ /*434,441*/;
  }
}

```

# /out/component_host_binding_slots.ts
```ts
import { Component, HostBinding, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  myStyle = { width: '100px' };

  myClass = { bar: false };

  id = 'some id';

  title = 'some title';

  name = '';
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
    { 'name': { 'alias': 'name'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    hostAttrs: ['title', 'foo title', 1, 'foo', 'baz', 2, 'width', '200px', 'height', '500px'],
    hostVars: 6,
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('id', ctx.id)('title', ctx.title);
        i0.ɵɵstyleMap(ctx.myStyle);
        i0.ɵɵclassMap(ctx.myClass);
      }
    },
    inputs: { name: 'name' },
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
                host: {
                  'style': 'width:200px; height:500px',
                  'class': 'foo baz',
                  'title': 'foo title',
                },
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myStyle: [{ type: HostBinding, args: ['style'] }],
          myClass: [{ type: HostBinding, args: ['class'] }],
          id: [{ type: HostBinding, args: ['id'] }],
          title: [{ type: HostBinding, args: ['title'] }],
          name: [{ type: Input, args: ['name'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'component_host_binding_slots.ts',
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