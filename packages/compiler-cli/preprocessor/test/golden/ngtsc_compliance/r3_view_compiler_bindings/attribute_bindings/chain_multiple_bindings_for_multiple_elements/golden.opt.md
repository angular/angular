# /out/chain_multiple_bindings_for_multiple_elements.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_bindings_for_multiple_elements.ts
 * @generated
 */

import * as i0 from './chain_multiple_bindings_for_multiple_elements';

/*tcb1*/
function _tcb1(this: i0.CustomEl) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.MyComponent) {
  if (true) {
    this.myTitle /*218,225*/ /*218,225*/;
    this.buttonId /*238,246*/ /*238,246*/;
    1 /*265,266*/;
    1 /*299,300*/;
    ('hello') /*316,323*/;
    1 /*343,344*/ + 2 /*347,348*/ /*343,348*/;
    ('one') /*396,401*/;
    2 /*427,428*/;
  }
}

```

# /out/chain_multiple_bindings_for_multiple_elements.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class CustomEl {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CustomEl, never> = function CustomEl_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CustomEl)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CustomEl,
    'custom-element',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CustomEl,
    selectors: [['custom-element']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function CustomEl_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CustomEl,
        [
          {
            type: Component,
            args: [
              {
                selector: 'custom-element',
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
    i0.ɵsetClassDebugInfo(CustomEl, {
      className: 'CustomEl',
      filePath: 'chain_multiple_bindings_for_multiple_elements.ts',
      lineNumber: 7,
    });
})();

export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
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
    decls: 3,
    vars: 8,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button')(1, 'span')(2, 'custom-element');
      }
      if (rf & 2) {
        i0.ɵɵattribute('title', ctx.myTitle)('id', ctx.buttonId)('tabindex', 1);
        i0.ɵɵadvance();
        i0.ɵɵattribute('id', 1)('title', 'hello')('some-attr', 1 + 2);
        i0.ɵɵadvance();
        i0.ɵɵattribute('some-attr', 'one')('some-other-attr', 2);
      }
    },
    dependencies: [CustomEl],
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
                template: `
        <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1"></button>
        <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
        <custom-element [attr.some-attr]="'one'" [attr.some-other-attr]="2"></custom-element>
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
      filePath: 'chain_multiple_bindings_for_multiple_elements.ts',
      lineNumber: 18,
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
    [typeof MyComponent, typeof CustomEl],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyMod> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyMod,
        [{ type: NgModule, args: [{ declarations: [MyComponent, CustomEl] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [MyComponent, CustomEl] });
})();

```