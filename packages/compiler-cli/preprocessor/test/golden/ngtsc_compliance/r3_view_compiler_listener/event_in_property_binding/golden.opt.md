# /out/event_in_property_binding.ngtypecheck.ts
```ts
/**
 * TCB for /event_in_property_binding.ts
 * @generated
 */

import { Component, Directive, Input, NgModule } from '@angular/core';

@Directive({
  selector: 'div',
  standalone: false,
})
export class DivDir {
  @Input() event!: any;
}

@Component({
  template: '<div [event]="$event"></div>',
  standalone: false,
})
class Comp {
  $event = 1;
}

/*tcb1*/
function _tcb1(this: Comp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*206,228*/ = null! as DivDir; /*T:VAE*/
    _t1.event /*212,217*/ = this.$event /*220,226*/ /*220,226*/ /*211,227*/;
  }
}

@NgModule({ declarations: [Comp, DivDir] })
export class MyMod {}

```

# /out/event_in_property_binding.ts
```ts
import { Component, Directive, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DivDir {
  event!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DivDir, never> = function DivDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DivDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DivDir,
    'div',
    never,
    { 'event': { 'alias': 'event'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DivDir,
    selectors: [['div']],
    inputs: { event: 'event' },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DivDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'div',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { event: [{ type: Input }] },
      );
  }
}

class Comp {
  $event = 1;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Comp, never> = function Comp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Comp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Comp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Comp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[3, 'event']],
    template: function Comp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('event', ctx.$event);
      }
    },
    dependencies: [DivDir],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Comp,
        [
          {
            type: Component,
            args: [
              {
                template: '<div [event]="$event"></div>',
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
    i0.ɵsetClassDebugInfo(Comp, {
      className: 'Comp',
      filePath: 'event_in_property_binding.ts',
      lineNumber: 15,
    });
})();

export class MyMod {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never> = function MyMod_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyMod)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof Comp, typeof DivDir], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyMod> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyMod,
        [{ type: NgModule, args: [{ declarations: [Comp, DivDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [Comp, DivDir] });
})();

```