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

# /out/parent_template_variable.ngtypecheck.ts
```ts
/**
 * TCB for /parent_template_variable.ts
 * @generated
 */

import * as i0 from './parent_template_variable';
import * as i1 from './for_of';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*163,192*/ = null! as i1.ForOfDirective; /*T:VAE*/
    _t1.forOf /*182,184*/ = this.items /*185,190*/ /*185,190*/ /*182,190*/;
    var _t2 = null! as any; /*T:VAE*/
    {
      var _t3 /*177,181*/ = _t2.$implicit; /*173,182*/
      '' + _t3 /*206,210*/.name /*211,215*/ /*206,215*/;
      var _t4 /*T:DIR:0*/ /*243,277*/ = null! as i1.ForOfDirective; /*T:VAE*/
      _t4.forOf /*262,264*/ = _t3 /*265,269*/.infos /*270,275*/ /*265,275*/ /*262,275*/;
      var _t5 = null! as any; /*T:VAE*/
      {
        var _t6 /*257,261*/ = _t5.$implicit; /*253,262*/
        '' +
          _t3 /*280,284*/.name /*285,289*/ /*280,289*/ +
          _t6 /*295,299*/.description /*300,311*/ /*295,311*/;
      }
    }
  }
}

```

# /out/parent_template_variable.ts
```ts
import { Component, NgModule } from '@angular/core';
import { ForOfDirective } from './for_of';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_li_1_li_4_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'li');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const info_r1: any = ctx.$implicit;
    const item_r2: any = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(' ', item_r2.name, ': ', info_r1.description, ' ');
  }
}
function MyComponent_li_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'li')(1, 'div');
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, 'ul');
    i0.ɵɵtemplate(4, MyComponent_li_1_li_4_Template, 2, 2, 'li', 0);
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const item_r2: any = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r2.name);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty('forOf', item_r2.infos);
  }
}

export class MyComponent {
  items = [
    { name: 'one', infos: [{ description: '11' }, { description: '12' }] },
    { name: 'two', infos: [{ description: '21' }, { description: '22' }] },
  ];
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
        i0.ɵɵelementStart(0, 'ul');
        i0.ɵɵtemplate(1, MyComponent_li_1_Template, 5, 2, 'li', 0);
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
                template: `
      <ul>
        <li *for="let item of items">
          <div>{{item.name}}</div>
          <ul>
            <li *for="let info of item.infos">
              {{item.name}}: {{info.description}}
            </li>
          </ul>
        </li>
      </ul>`,
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
      filePath: 'parent_template_variable.ts',
      lineNumber: 19,
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