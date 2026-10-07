# /out/structural_directives.ngtypecheck.ts
```ts
/**
 * TCB for /structural_directives.ts
 * @generated
 */

import * as i0 from './structural_directives';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*279,287*/ = null! as i0.IfDirective; /*T:VAE*/
    var _t3 /*270,279*/ = document.createElement('ul'); /*270,279*/ /*270,279*/
    var _t2 /*275,278*/ = _t3; /*274,278*/
    {
      '' + this.salutation /*289,299*/ /*289,299*/ + _t2 /*304,307*/;
    }
  }
}

```

# /out/structural_directives.ts
```ts
import { Component, Directive, NgModule, TemplateRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_li_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'li');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    const foo_r2: any = i0.ɵɵreference(1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2('', ctx_r0.salutation, ' ', foo_r2);
  }
}

export class IfDirective {
  constructor(template: TemplateRef<any>) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<IfDirective, never> = function IfDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || IfDirective)(i0.ɵɵdirectiveInject(i0.TemplateRef));
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    IfDirective,
    '[if]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: IfDirective,
    selectors: [['', 'if', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        IfDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[if]',
                standalone: false,
              },
            ],
          },
        ],
        (): any => [{ type: TemplateRef }],
        null,
      );
  }
}

export class MyComponent {
  salutation = 'Hello';
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
    decls: 3,
    vars: 0,
    consts: [
      ['foo', ''],
      [4, 'if'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'ul', null, 0);
        i0.ɵɵtemplate(2, MyComponent_li_2_Template, 2, 2, 'li', 1);
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [IfDirective],
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
                template: '<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>',
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
      filePath: 'structural_directives.ts',
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    MyModule,
    [typeof IfDirective, typeof MyComponent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [IfDirective, MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [IfDirective, MyComponent] });
})();

```