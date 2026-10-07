# /out/child_elements.ngtypecheck.ts
```ts
/**
 * TCB for /child_elements.ts
 * @generated
 */

import * as i0 from './child_elements';

var _pipe1 = null! as i0.UppercasePipe;

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    {
      '' + _pipe1.transform(/*288,297*/ this.valueA /*279,285*/ /*279,285*/) /*279,297*/;
    }
    '' + _pipe1.transform(/*364,373*/ this.valueB /*355,361*/ /*355,361*/) /*355,373*/;
  }
}

```

# /out/child_elements.ts
```ts
import { Component, NgModule, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_ng_template_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 1);
    i0.ɵɵpipe(1, 'uppercase');
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 1, ctx_r0.valueA));
    i0.ɵɵi18nApply(0);
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
  valueA = '';
  valueB = '';
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
    vars: 3,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_321671710121172402$$_CHILD_ELEMENTS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagNgTemplate}Template content: {$interpolation}{$closeTagNgTemplate}{$startTagNgContainer}Container content: {$interpolation_1}{$closeTagNgContainer}',
            {
              'closeTagNgContainer': '�/#3�',
              'closeTagNgTemplate': '�/*2:1�',
              'interpolation': '�0:1�',
              'interpolation_1': '�0�',
              'startTagNgContainer': '�#3�',
              'startTagNgTemplate': '�*2:1�',
            },
            {
              original_code: {
                'closeTagNgContainer': '</ng-container>',
                'closeTagNgTemplate': '</ng-template>',
                'interpolation': '{{ valueA | uppercase }}',
                'interpolation_1': '{{ valueB | uppercase }}',
                'startTagNgContainer': '<ng-container>',
                'startTagNgTemplate': '<ng-template>',
              },
            },
          );
        i18n_0 = MSG_EXTERNAL_321671710121172402$$_CHILD_ELEMENTS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${'�*2:1�'}:START_TAG_NG_TEMPLATE:Template content: ${'�0:1�'}:INTERPOLATION:${'�/*2:1�'}:CLOSE_TAG_NG_TEMPLATE:${'�#3�'}:START_TAG_NG_CONTAINER:Container content: ${'�0�'}:INTERPOLATION_1:${'�/#3�'}:CLOSE_TAG_NG_CONTAINER:`;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 2, 3, 'ng-template');
        i0.ɵɵelementContainer(3);
        i0.ɵɵpipe(4, 'uppercase');
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(4);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(4, 1, ctx.valueB));
        i0.ɵɵi18nApply(1);
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
      <div i18n>
        <ng-template>Template content: {{ valueA | uppercase }}</ng-template>
        <ng-container>Container content: {{ valueB | uppercase }}</ng-container>
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
      filePath: 'child_elements.ts',
      lineNumber: 21,
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
    [typeof MyComponent, typeof UppercasePipe],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent, UppercasePipe] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, UppercasePipe] });
})();

```