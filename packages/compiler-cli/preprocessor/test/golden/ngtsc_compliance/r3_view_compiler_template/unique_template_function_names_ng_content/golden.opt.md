# /out/unique_template_function_names_ng_content.ngtypecheck.ts
```ts
/**
 * TCB for /unique_template_function_names_ng_content.ts
 * @generated
 */

import * as i0 from './unique_template_function_names_ng_content';

/*tcb1*/
function _tcb1(this: i0.AComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.BComponent) {
  if (true) {
  }
}

```

# /out/unique_template_function_names_ng_content.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];
const _c1 = ['*ngIf', 'show'];
function AComponent_ng_content_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵprojection(0, 0, _c1);
  }
}
function BComponent_ng_content_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵprojection(0, 0, _c1);
  }
}

export class AComponent {
  show = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AComponent, never> = function AComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AComponent,
    'a-component',
    never,
    {},
    {},
    never,
    ['*'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AComponent,
    selectors: [['a-component']],
    standalone: false,
    ngContentSelectors: _c0,
    decls: 1,
    vars: 1,
    consts: [[4, 'ngIf']],
    template: function AComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵtemplate(0, AComponent_ng_content_0_Template, 1, 0, 'ng-content', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', ctx.show);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'a-component',
                template: `
        <ng-content *ngIf="show"></ng-content>
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
    i0.ɵsetClassDebugInfo(AComponent, {
      className: 'AComponent',
      filePath: 'unique_template_function_names_ng_content.ts',
      lineNumber: 10,
    });
})();

export class BComponent {
  show = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BComponent, never> = function BComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    BComponent,
    'b-component',
    never,
    {},
    {},
    never,
    ['*'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: BComponent,
    selectors: [['b-component']],
    standalone: false,
    ngContentSelectors: _c0,
    decls: 1,
    vars: 1,
    consts: [[4, 'ngIf']],
    template: function BComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵtemplate(0, BComponent_ng_content_0_Template, 1, 0, 'ng-content', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', ctx.show);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'b-component',
                template: `
        <ng-content *ngIf="show"></ng-content>
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
    i0.ɵsetClassDebugInfo(BComponent, {
      className: 'BComponent',
      filePath: 'unique_template_function_names_ng_content.ts',
      lineNumber: 21,
    });
})();

export class AModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never> = function AModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AModule,
    [typeof AComponent, typeof BComponent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AModule,
        [{ type: NgModule, args: [{ declarations: [AComponent, BComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AModule, { declarations: [AComponent, BComponent] });
})();

```