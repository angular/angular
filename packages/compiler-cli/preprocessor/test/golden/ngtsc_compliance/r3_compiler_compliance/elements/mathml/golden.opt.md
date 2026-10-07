# /out/mathml.ngtypecheck.ts
```ts
/**
 * TCB for /mathml.ts
 * @generated
 */

import * as i0 from './mathml';

/*tcb1*/
function _tcb1(this: i0.MathCmp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.InfinityCmp) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.MyComponent) {
  if (true) {
  }
}

```

# /out/mathml.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MathCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MathCmp, never> = function MathCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MathCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MathCmp,
    'math',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MathCmp,
    selectors: [['math']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MathCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MathCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'math',
                template: '',
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
    i0.ɵsetClassDebugInfo(MathCmp, { className: 'MathCmp', filePath: 'mathml.ts', lineNumber: 7 });
})();

export class InfinityCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InfinityCmp, never> = function InfinityCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || InfinityCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    InfinityCmp,
    'infinity',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: InfinityCmp,
    selectors: [['infinity']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function InfinityCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InfinityCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'infinity',
                template: '',
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
    i0.ɵsetClassDebugInfo(InfinityCmp, {
      className: 'InfinityCmp',
      filePath: 'mathml.ts',
      lineNumber: 14,
    });
})();

export class MyComponent {
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
    decls: 5,
    vars: 0,
    consts: [['title', 'Hello', 1, 'my-app']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵnamespaceMathML();
        i0.ɵɵelementStart(1, 'math');
        i0.ɵɵelement(2, 'infinity');
        i0.ɵɵelementEnd();
        i0.ɵɵnamespaceHTML();
        i0.ɵɵelementStart(3, 'p');
        i0.ɵɵtext(4, 'test');
        i0.ɵɵelementEnd()();
      }
    },
    dependencies: [MathCmp, InfinityCmp],
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
                template:
                  '<div class="my-app" title="Hello"><math><infinity/></math><p>test</p></div>',
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
      filePath: 'mathml.ts',
      lineNumber: 22,
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
    [typeof MyComponent, typeof MathCmp, typeof InfinityCmp],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, MathCmp, InfinityCmp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, MathCmp, InfinityCmp] });
})();

```