# /out/local_reference_nested.ngtypecheck.ts
```ts
/**
 * TCB for /local_reference_nested.ts
 * @generated
 */

import * as i0 from './local_reference_nested';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t2 /*274,284*/ = document.createElement('div'); /*274,284*/ /*274,284*/
    var _t1 /*280,283*/ = _t2; /*279,283*/
    '' + _t1 /*293,296*/;
    var _t3 /*T:DIR:0*/ /*307,316*/ = null! as i0.IfDirective; /*T:VAE*/
    var _t8 /*426,436*/ = document.createElement('div'); /*426,436*/ /*426,436*/
    var _t7 /*432,435*/ = _t8; /*431,435*/
    {
      var _t5 /*392,403*/ = document.createElement('span'); /*392,403*/ /*392,403*/
      var _t4 /*399,402*/ = _t5; /*398,402*/
      '' + _t1 /*293,296*/ /*319,322*/ + _t4 /*327,330*/;
      var _t6 /*T:DIR:0*/ /*345,355*/ = null! as i0.IfDirective; /*T:VAE*/
      {
        '' + _t1 /*293,296*/ /*357,360*/ + _t4 /*327,330*/ /*365,368*/ + _t7 /*373,376*/;
      }
    }
  }
}

```

# /out/local_reference_nested.ts
```ts
import { Component, Directive, NgModule, TemplateRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_3_span_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'span');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const bar_r1: any = i0.ɵɵreference(4);
    i0.ɵɵnextContext();
    const foo_r2: any = i0.ɵɵreference(1);
    const baz_r3: any = i0.ɵɵreference(5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate3('', foo_r2, '-', bar_r1, '-', baz_r3);
  }
}
function MyComponent_div_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1);
    i0.ɵɵtemplate(2, MyComponent_div_3_span_2_Template, 2, 3, 'span', 3);
    i0.ɵɵelement(3, 'span', null, 2);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const bar_r1: any = i0.ɵɵreference(4);
    i0.ɵɵnextContext();
    const foo_r2: any = i0.ɵɵreference(1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(' ', foo_r2, '-', bar_r1, ' ');
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
    decls: 6,
    vars: 1,
    consts: [
      ['foo', ''],
      ['baz', ''],
      ['bar', ''],
      [4, 'if'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', null, 0);
        i0.ɵɵtext(2);
        i0.ɵɵtemplate(3, MyComponent_div_3_Template, 5, 2, 'div', 3);
        i0.ɵɵelement(4, 'div', null, 1);
      }
      if (rf & 2) {
        const foo_r2: any = i0.ɵɵreference(1);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(' ', foo_r2, ' ');
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
                template: `
        <div #foo></div>
        {{foo}}
        <div *if>
          {{foo}}-{{bar}}
          <span *if>{{foo}}-{{bar}}-{{baz}}</span>
          <span #bar></span>
        </div>
        <div #baz></div>
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
      filePath: 'local_reference_nested.ts',
      lineNumber: 25,
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