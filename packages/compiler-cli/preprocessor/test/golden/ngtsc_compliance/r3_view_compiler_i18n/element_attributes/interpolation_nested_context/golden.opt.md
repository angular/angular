# /out/interpolation_nested_context.ngtypecheck.ts
```ts
/**
 * TCB for /interpolation_nested_context.ts
 * @generated
 */

import * as i0 from './interpolation_nested_context';

var _pipe1 = null! as i0.UppercasePipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*247,252*/ = _t1.$implicit; /*243,253*/
      '' + _pipe1.transform(/*324,333*/ _t2 /*316,321*/) /*316,333*/;
    }
  }
}

```

# /out/interpolation_nested_context.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div')(1, 'div', 2);
    i0.ɵɵpipe(2, 'uppercase');
    i0.ɵɵi18nAttributes(3, 0);
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const outer_r1: any = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 1, outer_r1));
    i0.ɵɵi18nApply(3);
  }
}

export class UppercasePipe {
  transform(v: any) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UppercasePipe, never> = function UppercasePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UppercasePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<UppercasePipe, 'uppercase', false> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({
      name: 'uppercase',
      type: UppercasePipe,
      pure: true,
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UppercasePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'uppercase',
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
  outer = '';
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
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_8538466649243975456$$_INTERPOLATION_NESTED_CONTEXT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'different scope {$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{ outer | uppercase }}' } },
          );
        i18n_0 = MSG_EXTERNAL_8538466649243975456$$_INTERPOLATION_NESTED_CONTEXT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`:m|d:different scope ${'�0�'}:INTERPOLATION:`;
      }
      return [
        ['title', i18n_0],
        [4, 'ngFor', 'ngForOf'],
        [6, 'title'],
      ];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 3, 'div', 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngForOf', ctx.items);
      }
    },
    dependencies: [UppercasePipe],
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
      <div *ngFor="let outer of items">
        <div i18n-title="m|d" title="different scope {{ outer | uppercase }}"></div>
      </div>
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
      filePath: 'interpolation_nested_context.ts',
      lineNumber: 20,
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
    [typeof UppercasePipe, typeof MyComponent],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [UppercasePipe, MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [UppercasePipe, MyComponent] });
})();

```