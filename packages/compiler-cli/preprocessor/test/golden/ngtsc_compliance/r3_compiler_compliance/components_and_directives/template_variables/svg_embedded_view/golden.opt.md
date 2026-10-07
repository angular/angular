# /out/for_of.ts
```ts
import { Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export interface ForOfContext {
  $implicit: any;
  index: number;
  even: boolean;
  odd: boolean;
}

export class ForOfDirective {
  private previous!: any[];

  constructor(
    private view: ViewContainerRef,
    private template: TemplateRef<any>,
  ) {}

  forOf!: any[];

  ngOnChanges(simpleChanges: SimpleChanges) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForOfDirective, never> = function ForOfDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ForOfDirective)(
      i0.ɵɵdirectiveInject(i0.ViewContainerRef),
      i0.ɵɵdirectiveInject(i0.TemplateRef),
    );
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ForOfDirective,
    '[forOf]',
    never,
    { 'forOf': { 'alias': 'forOf'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ForOfDirective,
    selectors: [['', 'forOf', '']],
    inputs: { forOf: 'forOf' },
    standalone: false,
    features: [i0.ɵɵNgOnChangesFeature],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForOfDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[forOf]',
                standalone: false,
              },
            ],
          },
        ],
        (): any => [{ type: ViewContainerRef }, { type: TemplateRef }],
        { forOf: [{ type: Input }] },
      );
  }
}

```

# /out/svg_embedded_view.ngtypecheck.ts
```ts
/**
 * TCB for /svg_embedded_view.ts
 * @generated
 */

import * as i0 from './svg_embedded_view';
import * as i1 from './for_of';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*156,184*/ = null! as i1.ForOfDirective; /*T:VAE*/
    _t1.forOf /*174,176*/ = this.items /*177,182*/ /*177,182*/ /*174,182*/;
    var _t2 = null! as any; /*T:VAE*/
    {
      var _t3 /*169,173*/ = _t2.$implicit; /*165,174*/
    }
  }
}

```

# /out/svg_embedded_view.ts
```ts
import { Component, NgModule } from '@angular/core';
import { ForOfDirective } from './for_of';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent__svg_g_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, 'g');
    i0.ɵɵelement(1, 'circle');
    i0.ɵɵelementEnd();
  }
}

export class MyComponent {
  items = [{ data: 42 }, { data: 42 }];
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
    decls: 2,
    vars: 1,
    consts: [[4, 'for', 'forOf']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵnamespaceSVG();
        i0.ɵɵelementStart(0, 'svg');
        i0.ɵɵtemplate(1, MyComponent__svg_g_1_Template, 2, 0, 'g', 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('forOf', ctx.items);
      }
    },
    dependencies: (): any => [ForOfDirective],
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
                template: `<svg><g *for="let item of items"><circle></circle></g></svg>`,
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
      filePath: 'svg_embedded_view.ts',
      lineNumber: 9,
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
    [typeof MyComponent, typeof ForOfDirective],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, ForOfDirective] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, ForOfDirective] });
})();

```