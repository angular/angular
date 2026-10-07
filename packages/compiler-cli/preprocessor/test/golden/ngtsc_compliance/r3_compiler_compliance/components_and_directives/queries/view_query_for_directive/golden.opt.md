# /out/some.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SomeDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never> = function SomeDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SomeDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    SomeDirective,
    '[someDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SomeDirective,
    selectors: [['', 'someDir', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SomeDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[someDir]',
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

```

# /out/view_query_for_directive.ngtypecheck.ts
```ts
/**
 * TCB for /view_query_for_directive.ts
 * @generated
 */

import * as i0 from './view_query_for_directive';

/*tcb1*/
function _tcb1(this: i0.ViewQueryComponent) {
  if (true) {
  }
}

```

# /out/view_query_for_directive.ts
```ts
import { Component, NgModule, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { SomeDirective } from './some.directive';
// @ts-ignore
import * as i0 from '@angular/core';

export class ViewQueryComponent {
  someDir!: SomeDirective;
  someDirs!: QueryList<SomeDirective>;
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
        i0.ɵɵviewQuery(SomeDirective, 5)(SomeDirective, 5);
      }
      if (rf & 2) {
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDir = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.someDirs = _t);
      }
    },
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [['someDir', '']],
    template: function ViewQueryComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    dependencies: (): any => [SomeDirective],
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
        <div someDir></div>
      `,
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          someDir: [{ type: ViewChild, args: [SomeDirective] }],
          someDirs: [{ type: ViewChildren, args: [SomeDirective] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ViewQueryComponent, {
      className: 'ViewQueryComponent',
      filePath: 'view_query_for_directive.ts',
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof SomeDirective, typeof ViewQueryComponent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [SomeDirective, ViewQueryComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, ViewQueryComponent] });
})();

```