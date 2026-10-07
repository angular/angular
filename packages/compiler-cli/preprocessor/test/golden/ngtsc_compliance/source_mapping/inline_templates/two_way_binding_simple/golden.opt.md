# /out/two_way_binding_simple.ngtypecheck.ts
```ts
/**
 * TCB for /two_way_binding_simple.ts
 * @generated
 */

import * as i0 from './two_way_binding_simple';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*152,178*/ = null! as i0.NgModelDirective; /*T:VAE*/
    _t1.ngModel /*161,168*/ = i1.ɵunwrapWritableSignal(
      this.name /*172,176*/ /*172,176*/,
    ) /*159,177*/;
  }
}

/* Diagnostics:
 - (161, 168) The property and event halves of the two-way binding 'ngModel' are not bound to the same target.
            Find more at https://angular.dev/guide/templates/two-way-binding
*/

```

# /out/two_way_binding_simple.ts
```ts
import { Component, Directive, EventEmitter, Input, NgModule, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

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
    vars: 1,
    consts: [[3, 'ngModelChange', 'ngModel']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Name: ');
        i0.ɵɵelementStart(1, 'input', 0);
        i0.ɵɵcontrolCreate();
        i0.ɵɵtwoWayListener(
          'ngModelChange',
          function TestCmp_Template_input_ngModelChange_1_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.name, $event) || (ctx.name = $event);
            return $event;
          },
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty('ngModel', ctx.name);
        i0.ɵɵcontrol();
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
                template: 'Name: <input [(ngModel)]="name">',
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
      filePath: 'two_way_binding_simple.ts',
      lineNumber: 8,
    });
})();

export class NgModelDirective {
  ngModel: string = '';
  ngModelChanges: EventEmitter<string> = new EventEmitter();
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
    { 'ngModelChanges': 'ngModelChanges' },
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NgModelDirective,
    selectors: [['', 'ngModel', '']],
    inputs: { ngModel: 'ngModel' },
    outputs: { ngModelChanges: 'ngModelChanges' },
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
        { ngModel: [{ type: Input }], ngModelChanges: [{ type: Output }] },
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

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/two_way_binding_simple.ts",
      "category": "error",
      "code": 8007,
      "messageText": "The property and event halves of the two-way binding 'ngModel' are not bound to the same target.\n            Find more at https://angular.dev/guide/templates/two-way-binding",
      "span": {
        "start": 161,
        "end": 168
      }
    }
  ]
}

```