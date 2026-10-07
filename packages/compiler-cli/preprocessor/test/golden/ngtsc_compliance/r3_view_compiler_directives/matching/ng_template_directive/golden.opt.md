# /out/ng_template_directive.ngtypecheck.ts
```ts
/**
 * TCB for /ng_template_directive.ts
 * @generated
 */

import * as i0 from './ng_template_directive';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*234,258*/ = null! as i0.DirectiveA; /*T:VAE*/
  }
}

```

# /out/ng_template_directive.ts
```ts
import { Component, Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, 'Some content');
  }
}

export class DirectiveA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never> = function DirectiveA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirectiveA)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirectiveA,
    'ng-template[directiveA]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DirectiveA,
    selectors: [['ng-template', 'directiveA', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirectiveA,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'ng-template[directiveA]',
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
    decls: 1,
    vars: 0,
    consts: [['directiveA', '']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 0, 'ng-template', 0);
      }
    },
    dependencies: [DirectiveA],
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
        <ng-template directiveA>Some content</ng-template>
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
      filePath: 'ng_template_directive.ts',
      lineNumber: 17,
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
    [typeof DirectiveA, typeof MyComponent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [DirectiveA, MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [DirectiveA, MyComponent] });
})();

```