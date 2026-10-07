# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './tooltip';

/*tcb1*/
function _tcb1(this: i0.App) {
  if (true) {
    var _t1 /*143,191*/ = document.createElement('button'); /*143,191*/ /*143,191*/
    var _t3 /*T:DIR:0*/ /*143,191*/ = null! as i1.Tooltip; /*T:VAE*/
    var _t2 /*160,161*/ = _t3; /*159,171*/
    _t1.addEventListener(/*173,178*/ 'click', ($event /*T:EP*/): any => {
      _t2 /*181,182*/
        .show /*183,187*/
        () /*181,189*/;
    }) /*172,190*/;
    var _t4 /*206,251*/ = document.createElement('span'); /*206,251*/ /*206,251*/
    var _t6 /*T:DIR:0*/ /*206,251*/ = null! as i1.Multi; /*T:VAE*/
    var _t5 /*219,220*/ = _t6; /*218,229*/
    _t4.addEventListener(/*231,236*/ 'click', ($event /*T:EP*/): any => {
      _t5 /*239,240*/
        .toggle /*241,247*/
        () /*239,249*/;
    }) /*230,250*/;
  }
}

```

# /out/app.ts
```ts
import { Component } from '@angular/core';
import { Multi, Tooltip } from './tooltip';
// @ts-ignore
import * as i0 from '@angular/core';

export class App {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<App, never> = function App_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || App)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    App,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [['app-root']],
    decls: 6,
    vars: 0,
    consts: [
      ['t', 'tooltip'],
      ['m', 'second'],
      ['tooltip', '', 3, 'click'],
      ['multi', '', 3, 'click'],
    ],
    template: function App_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        const _r1: any = i0.ɵɵgetCurrentView();
        i0.ɵɵelementStart(0, 'button', 2, 0);
        i0.ɵɵlistener('click', function App_Template_button_click_0_listener(): any {
          i0.ɵɵrestoreView(_r1);
          const t_r2: any = i0.ɵɵreference(1);
          return i0.ɵɵresetView(t_r2.show());
        });
        i0.ɵɵtext(2, 'a');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, 'span', 3, 1);
        i0.ɵɵlistener('click', function App_Template_span_click_3_listener(): any {
          i0.ɵɵrestoreView(_r1);
          const m_r3: any = i0.ɵɵreference(4);
          return i0.ɵɵresetView(m_r3.toggle());
        });
        i0.ɵɵtext(5, 'b');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [Tooltip, Multi],
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
                selector: 'app-root',
                template: `
        <button tooltip #t="tooltip" (click)="t.show()">a</button>
        <span multi #m="second" (click)="m.toggle()">b</span>
      `,
                imports: [Tooltip, Multi],
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
    i0.ɵsetClassDebugInfo(App, { className: 'App', filePath: 'app.ts', lineNumber: 12 });
})();

```

# /out/tooltip.ts
```ts
import { Directive } from '@angular/core';
import { EXPORT_AS, MULTI } from './names';
// @ts-ignore
import * as i0 from '@angular/core';

export class Tooltip {
  show() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Tooltip, never> = function Tooltip_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Tooltip)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Tooltip,
    '[tooltip]',
    ['tooltip'],
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Tooltip,
    selectors: [['', 'tooltip', '']],
    exportAs: ['tooltip'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Tooltip,
        [{ type: Directive, args: [{ selector: '[tooltip]', exportAs: EXPORT_AS }] }],
        null,
        null,
      );
  }
}

// A comma-separated list is split after evaluation, as ngtsc does.
export class Multi {
  toggle() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Multi, never> = function Multi_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Multi)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Multi,
    '[multi]',
    ['first', 'second'],
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Multi,
    selectors: [['', 'multi', '']],
    exportAs: ['first', 'second'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Multi,
        [{ type: Directive, args: [{ selector: '[multi]', exportAs: MULTI }] }],
        null,
        null,
      );
  }
}

```