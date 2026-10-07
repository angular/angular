# /out/object_literals.ngtypecheck.ts
```ts
/**
 * TCB for /object_literals.ts
 * @generated
 */

import * as i0 from './object_literals';

/*tcb1*/
function _tcb1(this: i0.ObjectComp) {
  if (true) {
    '' + this.config /*128,134*/ /*128,134*/['duration' /*135,145*/] /*128,146*/;
    '' + this.config /*166,172*/ /*166,172*/.animation /*173,182*/ /*166,182*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.MyApp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*347,406*/ = null! as i0.ObjectComp; /*T:VAE*/
    _t1.config /*361,367*/ = {
      'duration' /*371,381*/: 500 /*383,386*/,
      'animation' /*388,397*/: this.name /*399,403*/ /*399,403*/,
    } /*370,404*/ /*360,405*/;
  }
}

```

# /out/object_literals.ts
```ts
import { Component, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any): any => ({ 'duration': 500, animation: a0 });

export class ObjectComp {
  config!: { [key: string]: any };
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ObjectComp, never> = function ObjectComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ObjectComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ObjectComp,
    'object-comp',
    never,
    { 'config': { 'alias': 'config'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ObjectComp,
    selectors: [['object-comp']],
    inputs: { config: 'config' },
    standalone: false,
    decls: 4,
    vars: 2,
    template: function ObjectComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'p');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'p');
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.config['duration'], ' ');
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(' ', ctx.config.animation, ' ');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ObjectComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'object-comp',
                template: `
        <p> {{ config['duration'] }} </p>
        <p> {{ config.animation }} </p>
      `,
                standalone: false,
              },
            ],
          },
        ],
        null,
        { config: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ObjectComp, {
      className: 'ObjectComp',
      filePath: 'object_literals.ts',
      lineNumber: 11,
    });
})();

export class MyApp {
  name = 'slide';
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
    decls: 1,
    vars: 3,
    consts: [[3, 'config']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'object-comp', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('config', i0.ɵɵpureFunction1(1, _c0, ctx.name));
      }
    },
    dependencies: [ObjectComp],
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
                template: `
      <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'object_literals.ts',
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ObjectComp, typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [ObjectComp, MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ObjectComp, MyApp] });
})();

```