# /out/exclude_bindings_from_consts.ngtypecheck.ts
```ts
/**
 * TCB for /exclude_bindings_from_consts.ts
 * @generated
 */

import * as i0 from './exclude_bindings_from_consts';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    1 /*140,141*/;
    ('one') /*159,164*/;
    ('two') /*213,218*/;
    2 /*230,231*/;
    this.three /*271,276*/ /*271,276*/;
    var _t1 /*104,278*/ = document.createElement('a'); /*104,278*/ /*104,278*/
    _t1.addEventListener(/*171,182*/ 'customEvent', ($event /*T:EP*/): any => {
      this
        .doThings /*185,193*/
        () /*185,195*/;
    }) /*170,196*/;
  }
}

```

# /out/exclude_bindings_from_consts.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  doThings() {}
  three!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-app']],
    standalone: false,
    decls: 1,
    vars: 5,
    consts: [['target', '_blank', 'aria-label', 'link', 3, 'customEvent', 'title', 'id']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'a', 0);
        i0.ɵɵlistener('customEvent', function MyComponent_Template_a_customEvent_0_listener(): any {
          return ctx.doThings();
        });
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', 1)('id', 2);
        i0.ɵɵattribute('foo', 'one')('bar', 'two')('baz', ctx.three);
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
                selector: 'my-app',
                template: `<a
        target="_blank"
        [title]="1"
        [attr.foo]="'one'"
        (customEvent)="doThings()"
        [attr.bar]="'two'"
        [id]="2"
        aria-label="link"
        [attr.baz]="three"></a>`,
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
      filePath: 'exclude_bindings_from_consts.ts',
      lineNumber: 16,
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