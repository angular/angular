# /out/ng_project_as_compound_selector.ngtypecheck.ts
```ts
/**
 * TCB for /ng_project_as_compound_selector.ts
 * @generated
 */

import * as i0 from './ng_project_as_compound_selector';

/*tcb1*/
function _tcb1(this: i0.SimpleComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/ng_project_as_compound_selector.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = [[['', 'title', '']]];
const _c1 = ['[title]'];

export class SimpleComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SimpleComponent, never> = function SimpleComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SimpleComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    SimpleComponent,
    'simple',
    never,
    {},
    {},
    never,
    ['[title]'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SimpleComponent,
    selectors: [['simple']],
    standalone: false,
    ngContentSelectors: _c1,
    decls: 2,
    vars: 0,
    template: function SimpleComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵprojection(1);
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SimpleComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'simple',
                template: '<div><ng-content select="[title]"></ng-content></div>',
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
    i0.ɵsetClassDebugInfo(SimpleComponent, {
      className: 'SimpleComponent',
      filePath: 'ng_project_as_compound_selector.ts',
      lineNumber: 7,
    });
})();

export class MyApp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    standalone: false,
    decls: 2,
    vars: 0,
    consts: [['ngProjectAs', '[title],[header]', 5, ['', 'title', '']]],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'simple');
        i0.ɵɵelement(1, 'h1', 0);
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [SimpleComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                template: '<simple><h1 ngProjectAs="[title],[header]"></h1></simple>',
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'ng_project_as_compound_selector.ts',
      lineNumber: 15,
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
    [typeof SimpleComponent, typeof MyApp],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [SimpleComponent, MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SimpleComponent, MyApp] });
})();

```