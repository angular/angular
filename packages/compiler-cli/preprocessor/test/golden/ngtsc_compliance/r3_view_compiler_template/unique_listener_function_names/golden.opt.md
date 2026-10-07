# /out/unique_listener_function_names.ngtypecheck.ts
```ts
/**
 * TCB for /unique_listener_function_names.ts
 * @generated
 */

import * as i0 from './unique_listener_function_names';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*132,136*/ = _t1.$implicit; /*128,137*/
      var _t3 /*154,174*/ = document.createElement('p'); /*154,174*/ /*154,174*/
      _t3.addEventListener(/*158,163*/ 'click', ($event /*T:EP*/): any => {
        $event /*166,172*/;
      }) /*157,173*/;
      '' + _t2 /*177,181*/;
      var _t4 /*195,215*/ = document.createElement('p'); /*195,215*/ /*195,215*/
      _t4.addEventListener(/*199,204*/ 'click', ($event /*T:EP*/): any => {
        $event /*207,213*/;
      }) /*198,214*/;
      '' + _t2 /*218,222*/;
    }
    var _t5 = null! as any; /*T:VAE*/
    {
      var _t6 /*262,266*/ = _t5.$implicit; /*258,267*/
      var _t7 /*284,304*/ = document.createElement('p'); /*284,304*/ /*284,304*/
      _t7.addEventListener(/*288,293*/ 'click', ($event /*T:EP*/): any => {
        $event /*296,302*/;
      }) /*287,303*/;
      '' + _t6 /*307,311*/;
    }
  }
}

```

# /out/unique_listener_function_names.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div')(1, 'p', 1);
    i0.ɵɵlistener(
      'click',
      function MyComponent_div_0_Template_p_click_1_listener($event: any): any {
        return $event;
      },
    );
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, 'p', 1);
    i0.ɵɵlistener(
      'click',
      function MyComponent_div_0_Template_p_click_3_listener($event: any): any {
        return $event;
      },
    );
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r1);
  }
}
function MyComponent_div_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div')(1, 'p', 1);
    i0.ɵɵlistener(
      'click',
      function MyComponent_div_1_Template_p_click_1_listener($event: any): any {
        return $event;
      },
    );
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const item_r2: any = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r2);
  }
}

export class MyComponent {
  items = [4, 2];
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
    vars: 2,
    consts: [
      [4, 'ngFor', 'ngForOf'],
      [3, 'click'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 5, 2, 'div', 0)(
          1,
          MyComponent_div_1_Template,
          3,
          1,
          'div',
          0,
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngForOf', ctx.items);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngForOf', ctx.items);
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
        <div *ngFor="let item of items">
          <p (click)="$event">{{ item }}</p>
          <p (click)="$event">{{ item }}</p>
        </div>
        <div *ngFor="let item of items">
          <p (click)="$event">{{ item }}</p>
        </div>
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
      filePath: 'unique_listener_function_names.ts',
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