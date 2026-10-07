# /out/nested_template.ngtypecheck.ts
```ts
/**
 * TCB for /nested_template.ts
 * @generated
 */

import { Component, NgModule } from '@angular/core';

@Component({
  template: `
    <div id="second" *ngIf="visible">
      <ng-content SELECT="span[title=toFirst]"></ng-content>
    </div>
    <div id="third" *ngIf="visible">No ng-content, no instructions generated.</div>
    <ng-template> '*' selector: <ng-content></ng-content> </ng-template>
  `,
  standalone: false,
})
class Cmp {}

/*tcb1*/
function _tcb1(this: Cmp) {
  if (true) {
  }
}

@NgModule({ declarations: [Cmp] })
class Module {}

```

# /out/nested_template.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = [[['span', 'title', 'tofirst']], '*'];
const _c1 = ['span[title=toFirst]', '*'];
function Cmp_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 2);
    i0.ɵɵprojection(1);
    i0.ɵɵelementEnd();
  }
}
function Cmp_div_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div', 3);
    i0.ɵɵtext(1, ' No ng-content, no instructions generated. ');
    i0.ɵɵelementEnd();
  }
}
function Cmp_ng_template_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, " '*' selector: ");
    i0.ɵɵprojection(1, 1);
  }
}

class Cmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Cmp, never> = function Cmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Cmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Cmp,
    'ng-component',
    never,
    {},
    {},
    never,
    ['span[title=toFirst]', '*'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Cmp,
    selectors: [['ng-component']],
    standalone: false,
    ngContentSelectors: _c1,
    decls: 3,
    vars: 2,
    consts: [
      ['id', 'second', 4, 'ngIf'],
      ['id', 'third', 4, 'ngIf'],
      ['id', 'second'],
      ['id', 'third'],
    ],
    template: function Cmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵtemplate(0, Cmp_div_0_Template, 2, 0, 'div', 0)(1, Cmp_div_1_Template, 2, 0, 'div', 1)(
          2,
          Cmp_ng_template_2_Template,
          2,
          0,
          'ng-template',
        );
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', ctx.visible);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngIf', ctx.visible);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Cmp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <div id="second" *ngIf="visible">
          <ng-content SELECT="span[title=toFirst]"></ng-content>
        </div>
        <div id="third" *ngIf="visible">
          No ng-content, no instructions generated.
        </div>
        <ng-template>
          '*' selector: <ng-content></ng-content>
        </ng-template>
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
    i0.ɵsetClassDebugInfo(Cmp, {
      className: 'Cmp',
      filePath: 'nested_template.ts',
      lineNumber: 17,
    });
})();

class Module {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Module, never> = function Module_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Module)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<Module, [typeof Cmp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Module });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<Module> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Module,
        [{ type: NgModule, args: [{ declarations: [Cmp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(Module, { declarations: [Cmp] });
})();

```