# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { TooltipDirective } from './tooltip.directive';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComponent, never> = function AppComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComponent,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AppComponent,
    selectors: [['app-root']],
    decls: 1,
    vars: 0,
    consts: [['appTooltip', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'app-dialog', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [DialogComponent, TooltipDirective]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: '<app-dialog appTooltip></app-dialog>',
                imports: [DialogComponent, TooltipDirective],
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 10,
    });
})();

```

# /out/dialog.component.ts
```ts
import { Component } from '@angular/core';
import { DIALOG_SELECTOR } from './constants';
// @ts-ignore
import * as i0 from '@angular/core';

export class DialogComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DialogComponent, never> = function DialogComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DialogComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DialogComponent,
    'app-dialog',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DialogComponent,
    selectors: [['app-dialog']],
    decls: 2,
    vars: 0,
    template: function DialogComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'p');
        i0.ɵɵtext(1, 'Dialog');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DialogComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: DIALOG_SELECTOR,
                template: '<p>Dialog</p>',
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
    i0.ɵsetClassDebugInfo(DialogComponent, {
      className: 'DialogComponent',
      filePath: 'dialog.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/legacy.component.ts
```ts
import { Component } from '@angular/core';
import { LEGACY_SELECTOR } from './constants';
// @ts-ignore
import * as i0 from '@angular/core';

export class LegacyWidget {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyWidget, never> = function LegacyWidget_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyWidget)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LegacyWidget,
    'legacy-widget',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LegacyWidget,
    selectors: [['legacy-widget']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function LegacyWidget_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1, 'Legacy');
        i0.ɵɵelementEnd();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(LegacyWidget),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyWidget,
        [
          {
            type: Component,
            args: [
              {
                selector: LEGACY_SELECTOR,
                template: '<span>Legacy</span>',
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
    i0.ɵsetClassDebugInfo(LegacyWidget, {
      className: 'LegacyWidget',
      filePath: 'legacy.component.ts',
      lineNumber: 9,
    });
})();

export class LegacyHost {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyHost, never> = function LegacyHost_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyHost)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LegacyHost,
    'legacy-host',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LegacyHost,
    selectors: [['legacy-host']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function LegacyHost_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'legacy-widget');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(LegacyHost),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyHost,
        [
          {
            type: Component,
            args: [
              {
                selector: 'legacy-host',
                template: '<legacy-widget></legacy-widget>',
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
    i0.ɵsetClassDebugInfo(LegacyHost, {
      className: 'LegacyHost',
      filePath: 'legacy.component.ts',
      lineNumber: 16,
    });
})();

```

# /out/legacy.module.ts
```ts
import { NgModule } from '@angular/core';
import { LegacyHost, LegacyWidget } from './legacy.component';
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
  static ɵmod: LegacyModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LegacyModule });
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
                declarations: [LegacyWidget, LegacyHost],
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
    i0.ɵɵsetNgModuleScope(LegacyModule, { declarations: [LegacyWidget, LegacyHost] });
})();

```

# /out/tooltip.directive.ts
```ts
import { Directive } from '@angular/core';
import { TOOLTIP_SELECTOR } from './constants';
// @ts-ignore
import * as i0 from '@angular/core';

export class TooltipDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TooltipDirective, never> = function TooltipDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TooltipDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TooltipDirective,
    '[appTooltip]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TooltipDirective,
    selectors: [['', 'appTooltip', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TooltipDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: TOOLTIP_SELECTOR,
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