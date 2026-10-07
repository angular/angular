# /out/src/app.ngtypecheck.ts
```ts
/**
 * TCB for /src/app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './tooltip';

/*tcb1*/
function _tcb1(this: i0.App) {
  if (true) {
    var _t1 /*T:HOSTDIR:1*/ /*278,301*/ = null! as i1.Tooltip; /*T:VAE*/
    _t1.tooltip /*288,291*/ = this.label /*294,299*/ /*294,299*/ /*287,300*/;
  }
}

```

# /out/src/app.ts
```ts
import { Component } from '@angular/core';
import { FocusRing } from './focus';
import { Menu } from './menu';
// @ts-ignore
import * as i0 from '@angular/core';

export class App {
  label = 'hello';
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
    [{ directive: typeof FocusRing; inputs: {}; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [['app-root']],
    features: [i0.ɵɵHostDirectivesFeature([FocusRing])],
    decls: 2,
    vars: 1,
    consts: [
      ['tooltip', 'x', 'ripple', '', 'focusRing', ''],
      [3, 'tip'],
    ],
    template: function App_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'span', 0)(1, 'menu-el', 1);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('tip', ctx.label);
      }
    },
    dependencies: [Menu],
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
                standalone: true,
                imports: [Menu],
                hostDirectives: [FocusRing],
                template:
                  '<span tooltip="x" ripple focusRing></span><menu-el [tip]="label"></menu-el>',
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
    i0.ɵsetClassDebugInfo(App, { className: 'App', filePath: 'src/app.ts', lineNumber: 13 });
})();

```

# /out/src/focus.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FocusRing {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FocusRing, never> = function FocusRing_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FocusRing)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    FocusRing,
    '[focusRing]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: FocusRing, selectors: [['', 'focusRing', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FocusRing,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[focusRing]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```

# /out/src/legacy.module.ts
```ts
import { NgModule } from '@angular/core';
import { LegacyApp } from './legacy';
import { Menu } from './menu';
// @ts-ignore
import * as i0 from '@angular/core';

export class LegacyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyModule, never> = function LegacyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<LegacyModule, [typeof LegacyApp], [typeof Menu], never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LegacyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LegacyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [LegacyApp],
                imports: [Menu],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(LegacyModule, { declarations: [LegacyApp], imports: [Menu] });
})();

```

# /out/src/legacy.ngtypecheck.ts
```ts
/**
 * TCB for /src/legacy.ts
 * @generated
 */

import * as i0 from './legacy';
import * as i1 from './tooltip';

/*tcb1*/
function _tcb1(this: i0.LegacyApp) {
  if (true) {
    var _t1 /*T:HOSTDIR:1*/ /*149,166*/ = null! as i1.Tooltip; /*T:VAE*/
    _t1.tooltip /*158,161*/ = 'z' /*158,165*/;
  }
}

```

# /out/src/legacy.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './menu';

export class LegacyApp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyApp, never> = function LegacyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LegacyApp,
    'legacy-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LegacyApp,
    selectors: [['legacy-app']],
    standalone: false,
    decls: 2,
    vars: 0,
    consts: [
      ['tooltip', 'y', 'ripple', ''],
      ['tip', 'z'],
    ],
    template: function LegacyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'span', 0)(1, 'menu-el', 1);
      }
    },
    dependencies: [i1.Menu],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'legacy-app',
                standalone: false,
                template: '<span tooltip="y" ripple></span><menu-el tip="z"></menu-el>',
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
    i0.ɵsetClassDebugInfo(LegacyApp, {
      className: 'LegacyApp',
      filePath: 'src/legacy.ts',
      lineNumber: 8,
    });
})();

```

# /out/src/menu.ngtypecheck.ts
```ts
/**
 * TCB for /src/menu.ts
 * @generated
 */

import * as i0 from './menu';

/*tcb1*/
function _tcb1(this: i0.Menu) {
  if (true) {
  }
}

```

# /out/src/menu.ts
```ts
import { Component } from '@angular/core';
import { Tooltip } from './tooltip';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];

export class Menu {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Menu, never> = function Menu_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Menu)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Menu,
    'menu-el',
    never,
    {},
    {},
    never,
    ['*'],
    true,
    [{ directive: typeof Tooltip; inputs: { 'tooltip': 'tip' }; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Menu,
    selectors: [['menu-el']],
    features: [i0.ɵɵHostDirectivesFeature([{ directive: Tooltip, inputs: ['tooltip', 'tip'] }])],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function Menu_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵprojection(0);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Menu,
        [
          {
            type: Component,
            args: [
              {
                selector: 'menu-el',
                standalone: true,
                template: '<ng-content></ng-content>',
                hostDirectives: [{ directive: Tooltip, inputs: ['tooltip: tip'] }],
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
    i0.ɵsetClassDebugInfo(Menu, { className: 'Menu', filePath: 'src/menu.ts', lineNumber: 10 });
})();

```

# /out/src/ripple.ts
```ts
import { Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Ripple {
  rippleColor: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Ripple, never> = function Ripple_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Ripple)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Ripple,
    '[ripple]',
    never,
    { 'rippleColor': { 'alias': 'rippleColor'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Ripple,
    selectors: [['', 'ripple', '']],
    inputs: { rippleColor: 'rippleColor' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Ripple,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[ripple]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { rippleColor: [{ type: Input }] },
      );
  }
}

```

# /out/src/tooltip.ts
```ts
import { Directive, Input } from '@angular/core';
import { Ripple } from './ripple';
// @ts-ignore
import * as i0 from '@angular/core';

export class Tooltip {
  tooltip: string = '';
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
    never,
    { 'tooltip': { 'alias': 'tooltip'; 'required': false } },
    {},
    never,
    never,
    true,
    [{ directive: typeof Ripple; inputs: { 'rippleColor': 'rippleColor' }; outputs: {} }]
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Tooltip,
    selectors: [['', 'tooltip', '']],
    inputs: { tooltip: 'tooltip' },
    features: [
      i0.ɵɵHostDirectivesFeature([{ directive: Ripple, inputs: ['rippleColor', 'rippleColor'] }]),
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Tooltip,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[tooltip]',
                standalone: true,
                hostDirectives: [{ directive: Ripple, inputs: ['rippleColor'] }],
              },
            ],
          },
        ],
        null,
        { tooltip: [{ type: Input }] },
      );
  }
}

```