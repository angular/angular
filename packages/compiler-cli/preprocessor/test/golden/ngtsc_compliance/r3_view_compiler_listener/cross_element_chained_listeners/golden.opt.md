# /out/cross_element_chained_listeners.ngtypecheck.ts
```ts
/**
 * TCB for /cross_element_chained_listeners.ts
 * @generated
 */

import * as i0 from './cross_element_chained_listeners';

/*tcb1*/
function _tcb1(this: i0.SomeComp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MyComponent) {
  if (true) {
    var _t1 /*341,384*/ = document.createElement('div'); /*341,384*/ /*341,384*/
    _t1.addEventListener(/*347,352*/ 'click', ($event /*T:EP*/): any => {
      this
        .click /*355,360*/
        () /*355,362*/;
    }) /*346,363*/;
    _t1.addEventListener(/*365,371*/ 'change', ($event /*T:EP*/): any => {
      this
        .change /*374,380*/
        () /*374,382*/;
    }) /*364,383*/;
    var _t2 /*T:DIR:0*/ /*397,448*/ = null! as i0.SomeComp; /*T:VAE*/
    _t2['update'] /*409,415*/
      .subscribe(($event /*T:EP*/): any => {
        this
          .update /*418,424*/
          () /*418,426*/;
      }) /*408,427*/;
    _t2['delete'] /*429,435*/
      .subscribe(($event /*T:EP*/): any => {
        this
          .delete /*438,444*/
          () /*438,446*/;
      }) /*428,447*/;
  }
}

```

# /out/cross_element_chained_listeners.ts
```ts
import { Component, EventEmitter, NgModule, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SomeComp {
  update = new EventEmitter<any>();
  delete = new EventEmitter<any>();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeComp, never> = function SomeComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SomeComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SomeComp,
    'some-comp',
    never,
    {},
    { 'update': 'update'; 'delete': 'delete' },
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SomeComp,
    selectors: [['some-comp']],
    outputs: { update: 'update', delete: 'delete' },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function SomeComp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SomeComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'some-comp',
                template: '',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { update: [{ type: Output }], delete: [{ type: Output }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(SomeComp, {
      className: 'SomeComp',
      filePath: 'cross_element_chained_listeners.ts',
      lineNumber: 8,
    });
})();

export class MyComponent {
  click() {}
  change() {}
  delete() {}
  update() {}
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
    decls: 2,
    vars: 0,
    consts: [
      [3, 'click', 'change'],
      [3, 'update', 'delete'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵlistener('click', function MyComponent_Template_div_click_0_listener(): any {
          return ctx.click();
        })('change', function MyComponent_Template_div_change_0_listener(): any {
          return ctx.change();
        });
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(1, 'some-comp', 1);
        i0.ɵɵlistener('update', function MyComponent_Template_some_comp_update_1_listener(): any {
          return ctx.update();
        })('delete', function MyComponent_Template_some_comp_delete_1_listener(): any {
          return ctx.delete();
        });
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [SomeComp],
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
          <div (click)="click()" (change)="change()"></div>
          <some-comp (update)="update()" (delete)="delete()"></some-comp>
        `,
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
      filePath: 'cross_element_chained_listeners.ts',
      lineNumber: 21,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof MyComponent, typeof SomeComp],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, SomeComp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, SomeComp] });
})();

```