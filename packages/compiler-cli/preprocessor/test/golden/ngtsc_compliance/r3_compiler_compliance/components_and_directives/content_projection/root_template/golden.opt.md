# /out/root_template.ngtypecheck.ts
```ts
/**
 * TCB for /root_template.ts
 * @generated
 */

import * as i0 from './root_template';

/*tcb1*/
function _tcb1(this: i0.SimpleComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.ComplexComponent) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/root_template.ts
```ts
import { Component, Directive, NgModule, TemplateRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];
const _c1 = [[['span', 'title', 'tofirst']], [['span', 'title', 'tosecond']]];
const _c2 = ['span[title=toFirst]', 'span[title=toSecond]'];

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
    ['*'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SimpleComponent,
    selectors: [['simple']],
    standalone: false,
    ngContentSelectors: _c0,
    decls: 2,
    vars: 0,
    template: function SimpleComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
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
                template: '<div><ng-content></ng-content></div>',
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
      filePath: 'root_template.ts',
      lineNumber: 7,
    });
})();

export class ComplexComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ComplexComponent, never> = function ComplexComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ComplexComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ComplexComponent,
    'complex',
    never,
    {},
    {},
    never,
    ['span[title=toFirst]', 'span[title=toSecond]'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ComplexComponent,
    selectors: [['complex']],
    standalone: false,
    ngContentSelectors: _c2,
    decls: 4,
    vars: 0,
    consts: [
      ['id', 'first'],
      ['id', 'second'],
    ],
    template: function ComplexComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c1);
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵprojection(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'div', 1);
        i0.ɵɵprojection(3, 1);
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ComplexComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'complex',
                template: `
        <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
        <div id="second"><ng-content SELECT="span[title=toSecond]"></ng-content></div>`,
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
    i0.ɵsetClassDebugInfo(ComplexComponent, {
      className: 'ComplexComponent',
      filePath: 'root_template.ts',
      lineNumber: 17,
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
    decls: 3,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'simple');
        i0.ɵɵtext(1, 'content');
        i0.ɵɵelementEnd();
        i0.ɵɵelement(2, 'complex');
      }
    },
    dependencies: [SimpleComponent, ComplexComponent],
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
                template: '<simple>content</simple> <complex></complex>',
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
      filePath: 'root_template.ts',
      lineNumber: 24,
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
    [typeof SimpleComponent, typeof ComplexComponent, typeof MyApp],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [SimpleComponent, ComplexComponent, MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SimpleComponent, ComplexComponent, MyApp] });
})();

```