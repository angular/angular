# /out/nested_two_way.ngtypecheck.ts
```ts
/**
 * TCB for /nested_two_way.ts
 * @generated
 */

import * as i0 from './nested_two_way';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    {
      var _t1 /*T:DIR:0*/ /*167,193*/ = null! as i0.NgModelDirective; /*T:VAE*/
      _t1.ngModel /*176,183*/ = i1.ɵunwrapWritableSignal(
        this.name /*187,191*/ /*187,191*/,
      ) /*174,192*/;
      _t1['ngModelChange'] /*176,183*/
        .subscribe(($event /*T:EP*/): any => {
          this.name /*187,191*/ /*187,191*/;
        }) /*174,192*/;
    }
  }
}

```

# /out/nested_two_way.ts
```ts
import { Component, Directive, EventEmitter, Input, NgModule, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestCmp_ng_template_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'input', 0);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener(
      'ngModelChange',
      function TestCmp_ng_template_1_Template_input_ngModelChange_0_listener($event: any): any {
        i0.ɵɵrestoreView(_r1);
        const ctx_r1: any = i0.ɵɵnextContext();
        i0.ɵɵtwoWayBindingSet(ctx_r1.name, $event) || (ctx_r1.name = $event);
        return i0.ɵɵresetView($event);
      },
    );
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1: any = i0.ɵɵnextContext();
    i0.ɵɵtwoWayProperty('ngModel', ctx_r1.name);
    i0.ɵɵcontrol();
  }
}

export class TestCmp {
  name: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    standalone: false,
    decls: 2,
    vars: 0,
    consts: [[3, 'ngModelChange', 'ngModel']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Name: ');
        i0.ɵɵtemplate(1, TestCmp_ng_template_1_Template, 1, 1, 'ng-template');
      }
    },
    dependencies: (): any => [NgModelDirective],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                template: 'Name: <ng-template><input [(ngModel)]="name"></ng-template>',
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'nested_two_way.ts',
      lineNumber: 8,
    });
})();

export class NgModelDirective {
  ngModel: string = '';
  ngModelChange: EventEmitter<string> = new EventEmitter();
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NgModelDirective, never> = function NgModelDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NgModelDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    NgModelDirective,
    '[ngModel]',
    never,
    { 'ngModel': { 'alias': 'ngModel'; 'required': false } },
    { 'ngModelChange': 'ngModelChange' },
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NgModelDirective,
    selectors: [['', 'ngModel', '']],
    inputs: { ngModel: 'ngModel' },
    outputs: { ngModelChange: 'ngModelChange' },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NgModelDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[ngModel]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { ngModel: [{ type: Input }], ngModelChange: [{ type: Output }] },
      );
  }
}

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    [typeof TestCmp, typeof NgModelDirective],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [{ type: NgModule, args: [{ declarations: [TestCmp, NgModelDirective] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [TestCmp, NgModelDirective] });
})();

```