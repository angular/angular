# /out/mixed_one_way_two_way_property_order.ngtypecheck.ts
```ts
/**
 * TCB for /mixed_one_way_two_way_property_order.ts
 * @generated
 */

import * as i0 from './mixed_one_way_two_way_property_order';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.App) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*326,387*/ = null! as i0.Dir; /*T:VAE*/
    _t1.a /*337,338*/ = i1.ɵunwrapWritableSignal(this.value /*342,347*/ /*342,347*/) /*335,348*/;
    _t1.b /*350,351*/ = this.value /*354,359*/ /*354,359*/ /*349,360*/;
    _t1.c /*363,364*/ = i1.ɵunwrapWritableSignal(this.value /*368,373*/ /*368,373*/) /*361,374*/;
    _t1.d /*376,377*/ = this.value /*380,385*/ /*380,385*/ /*375,386*/;
    _t1['aChange'] /*337,338*/
      .subscribe(($event /*T:EP*/): any => {
        this.value /*342,347*/ /*342,347*/;
      }) /*335,348*/;
    _t1['cChange'] /*363,364*/
      .subscribe(($event /*T:EP*/): any => {
        this.value /*368,373*/ /*368,373*/;
      }) /*361,374*/;
  }
}

```

# /out/mixed_one_way_two_way_property_order.ts
```ts
import { Component, Directive, Input, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Dir {
  a: unknown;
  aChange: unknown;

  b: unknown;

  c: unknown;
  cChange: unknown;

  d: unknown;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Dir, never> = function Dir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Dir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Dir,
    '[dir]',
    never,
    {
      'a': { 'alias': 'a'; 'required': false };
      'b': { 'alias': 'b'; 'required': false };
      'c': { 'alias': 'c'; 'required': false };
      'd': { 'alias': 'd'; 'required': false };
    },
    { 'aChange': 'aChange'; 'cChange': 'cChange' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Dir,
    selectors: [['', 'dir', '']],
    inputs: { a: 'a', b: 'b', c: 'c', d: 'd' },
    outputs: { aChange: 'aChange', cChange: 'cChange' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Dir, [{ type: Directive, args: [{ selector: '[dir]' }] }], null, {
        a: [{ type: Input }],
        aChange: [{ type: Output }],
        b: [{ type: Input }],
        c: [{ type: Input }],
        cChange: [{ type: Output }],
        d: [{ type: Input }],
      });
  }
}

export class App {
  value = 'hi';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<App, never> = function App_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || App)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    App,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [['ng-component']],
    decls: 1,
    vars: 4,
    consts: [['dir', '', 3, 'aChange', 'cChange', 'a', 'b', 'c', 'd']],
    template: function App_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵtwoWayListener(
          'aChange',
          function App_Template_div_aChange_0_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
            return $event;
          },
        )('cChange', function App_Template_div_cChange_0_listener($event: any): any {
          i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
          return $event;
        });
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtwoWayProperty('a', ctx.value);
        i0.ɵɵproperty('b', ctx.value);
        i0.ɵɵtwoWayProperty('c', ctx.value);
        i0.ɵɵproperty('d', ctx.value);
      }
    },
    dependencies: [Dir],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        App,
        [
          {
            type: Component,
            args: [
              {
                imports: [Dir],
                template: `
        <div dir [(a)]="value" [b]="value" [(c)]="value" [d]="value"></div>
      `,
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
    i0.ɵsetClassDebugInfo(App, {
      className: 'App',
      filePath: 'mixed_one_way_two_way_property_order.ts',
      lineNumber: 22,
    });
})();

```