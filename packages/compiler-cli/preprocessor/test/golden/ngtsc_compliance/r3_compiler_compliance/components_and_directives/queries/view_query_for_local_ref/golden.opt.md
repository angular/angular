# /out/view_query_for_local_ref.ngtypecheck.ts
```ts
/**
 * TCB for /view_query_for_local_ref.ts
 * @generated
 */

import * as i0 from './view_query_for_local_ref';

/*tcb1*/
function _tcb1(this: i0.ViewQueryComponent) {
  if (true) {
  }
}

```

# /out/view_query_for_local_ref.ts
```ts
import { Component, NgModule, QueryList, ViewChild, ViewChildren } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['myRef'];
const _c1 = ['myRef1', 'myRef2', 'myRef3'];

export class ViewQueryComponent {
  myRef: any;
  myRefs!: QueryList<any>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ViewQueryComponent, never> =
    function ViewQueryComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ViewQueryComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ViewQueryComponent,
    'view-query-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ViewQueryComponent,
    selectors: [['view-query-component']],
    viewQuery: function ViewQueryComponent_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuery(_c0, 5)(_c1, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.myRef = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.myRefs = _t);
      }
    },
    standalone: false,
    decls: 4,
    vars: 0,
    consts: [
      ['myRef', ''],
      ['myRef1', ''],
    ],
    template: function ViewQueryComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', null, 0)(2, 'div', null, 1);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ViewQueryComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'view-query-component',
                template: `
        <div #myRef></div>
        <div #myRef1></div>
      `,
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myRef: [{ type: ViewChild, args: ['myRef'] }],
          myRefs: [{ type: ViewChildren, args: ['myRef1, myRef2, myRef3'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ViewQueryComponent, {
      className: 'ViewQueryComponent',
      filePath: 'view_query_for_local_ref.ts',
      lineNumber: 11,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ViewQueryComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [ViewQueryComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ViewQueryComponent] });
})();

```