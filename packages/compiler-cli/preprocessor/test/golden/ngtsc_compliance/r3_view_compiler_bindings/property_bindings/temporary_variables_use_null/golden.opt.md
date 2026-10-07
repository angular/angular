# /out/temporary_variables_use_null.ngtypecheck.ts
```ts
/**
 * TCB for /temporary_variables_use_null.ts
 * @generated
 */

import * as i0 from './temporary_variables_use_null';

var _pipe1 = null! as i0.AsyncPipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.myTitle /*650,657*/ /*650,657*/;
    _pipe1.transform(
      /*686,691*/ this
        .auth /*666,670*/
        () /*666,672*/
        .identity /*673,681*/
        () /*666,683*/,
    ) /*666,691*/?.id /*694,696*/ /*665,696*/;
    1 /*710,711*/;
  }
}

```

# /out/temporary_variables_use_null.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AsyncPipe {
  transform(v: any): null | any {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AsyncPipe, never> = function AsyncPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AsyncPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<AsyncPipe, 'async', false> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'async',
    type: AsyncPipe,
    pure: true,
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AsyncPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'async',
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

// https://github.com/angular/angular/issues/37194
// Verifies that temporary expressions used for expressions with potential side-effects in
// the LHS of a safe navigation access are emitted within the binding expression itself, to
// ensure that these temporaries are evaluated during the evaluation of the binding. This
// is important for when the LHS contains a pipe, as pipe evaluation depends on the current
// binding index.
export class MyComponent {
  myTitle = 'hello';
  auth!: () => {
    identity(): any;
  };
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['ng-component']],
    standalone: false,
    decls: 2,
    vars: 5,
    consts: [[3, 'title', 'id', 'tabindex']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button', 0);
        i0.ɵɵpipe(1, 'async');
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵproperty('title', ctx.myTitle)(
          'id',
          (tmp_1_0 = i0.ɵɵpipeBind1(1, 3, ctx.auth().identity())) == null ? null : tmp_1_0.id,
        )('tabindex', 1);
      }
    },
    dependencies: [AsyncPipe],
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
                template:
                  '<button [title]="myTitle" [id]="(auth().identity() | async)?.id" [tabindex]="1"></button>',
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
      filePath: 'temporary_variables_use_null.ts',
      lineNumber: 21,
    });
})();

export class MyMod {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never> = function MyMod_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyMod)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyMod,
    [typeof MyComponent, typeof AsyncPipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyMod> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyMod,
        [{ type: NgModule, args: [{ declarations: [MyComponent, AsyncPipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [MyComponent, AsyncPipe] });
})();

```