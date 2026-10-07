# /out/mixed_one_way_two_way_listener_order.ngtypecheck.ts
```ts
/**
 * TCB for /mixed_one_way_two_way_listener_order.ts
 * @generated
 */

import * as i0 from './mixed_one_way_two_way_listener_order';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.App) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*416,479*/ = null! as i0.Dir; /*T:VAE*/
    _t1.a /*427,428*/ = i1.ɵunwrapWritableSignal(this.value /*432,437*/ /*432,437*/) /*425,438*/;
    _t1.c /*454,455*/ = i1.ɵunwrapWritableSignal(this.value /*459,464*/ /*459,464*/) /*452,465*/;
    _t1['aChange'] /*427,428*/
      .subscribe(($event /*T:EP*/): any => {
        this.value /*432,437*/ /*432,437*/;
      }) /*425,438*/;
    _t1['b'] /*440,441*/
      .subscribe(($event /*T:EP*/): any => {
        this
          .noop /*444,448*/
          () /*444,450*/;
      }) /*439,451*/;
    _t1['cChange'] /*454,455*/
      .subscribe(($event /*T:EP*/): any => {
        this.value /*459,464*/ /*459,464*/;
      }) /*452,465*/;
    _t1['d'] /*467,468*/
      .subscribe(($event /*T:EP*/): any => {
        this
          .noop /*471,475*/
          () /*471,477*/;
      }) /*466,478*/;
  }
}

```

# /out/mixed_one_way_two_way_listener_order.ts
```ts
import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Dir {
  a: string = '';
  aChange = new EventEmitter<string>();

  b = new EventEmitter();

  c: string = '';
  cChange = new EventEmitter<string>();

  d = new EventEmitter();
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
    { 'a': { 'alias': 'a'; 'required': false }; 'c': { 'alias': 'c'; 'required': false } },
    { 'aChange': 'aChange'; 'b': 'b'; 'cChange': 'cChange'; 'd': 'd' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Dir,
    selectors: [['', 'dir', '']],
    inputs: { a: 'a', c: 'c' },
    outputs: { aChange: 'aChange', b: 'b', cChange: 'cChange', d: 'd' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Dir, [{ type: Directive, args: [{ selector: '[dir]' }] }], null, {
        a: [{ type: Input }],
        aChange: [{ type: Output }],
        b: [{ type: Output }],
        c: [{ type: Input }],
        cChange: [{ type: Output }],
        d: [{ type: Output }],
      });
  }
}

export class App {
  value = 'hi';
  noop = () => {};
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
    vars: 2,
    consts: [['dir', '', 3, 'aChange', 'b', 'cChange', 'd', 'a', 'c']],
    template: function App_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵtwoWayListener(
          'aChange',
          function App_Template_div_aChange_0_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
            return $event;
          },
        );
        i0.ɵɵlistener('b', function App_Template_div_b_0_listener(): any {
          return ctx.noop();
        });
        i0.ɵɵtwoWayListener(
          'cChange',
          function App_Template_div_cChange_0_listener($event: any): any {
            i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
            return $event;
          },
        );
        i0.ɵɵlistener('d', function App_Template_div_d_0_listener(): any {
          return ctx.noop();
        });
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtwoWayProperty('a', ctx.value)('c', ctx.value);
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
        <div dir [(a)]="value" (b)="noop()" [(c)]="value" (d)="noop()"></div>
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
      filePath: 'mixed_one_way_two_way_listener_order.ts',
      lineNumber: 22,
    });
})();

```