# /out/a.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AComponent, never> = function AComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AComponent,
    'lib-a',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AComponent,
    selectors: [['lib-a']],
    decls: 2,
    vars: 0,
    template: function AComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1, 'A');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'lib-a',
                template: '<span>A</span>',
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AComponent, {
      className: 'AComponent',
      filePath: 'a.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import SHARED from './shared';
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
    consts: [['libB', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'lib-a', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, SHARED),
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
                template: '<lib-a libB></lib-a>',
                standalone: true,
                imports: SHARED,
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

# /out/b.directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BDirective, never> = function BDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    BDirective,
    '[libB]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: BDirective,
    selectors: [['', 'libB', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[libB]',
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

```

# /out/b.module.ts
```ts
import { NgModule } from '@angular/core';
import { BDirective } from './b.directive';
// @ts-ignore
import * as i0 from '@angular/core';

export class BModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never> = function BModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BModule)();
  };
  // @ts-ignore
  static ɵmod: BModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<BModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [BDirective],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [BDirective],
                exports: [BDirective],
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
    i0.ɵɵsetNgModuleScope(BModule, { declarations: [BDirective], exports: [BDirective] });
})();

```

# /out/legacy.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class LegacyComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyComponent, never> = function LegacyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LegacyComponent,
    'app-legacy',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LegacyComponent,
    selectors: [['app-legacy']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [['libB', '']],
    template: function LegacyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'span', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(LegacyComponent),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-legacy',
                template: '<span libB></span>',
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
    i0.ɵsetClassDebugInfo(LegacyComponent, {
      className: 'LegacyComponent',
      filePath: 'legacy.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/legacy.module.ts
```ts
import { NgModule } from '@angular/core';
import { LegacyComponent } from './legacy.component';
import MODULES from './modules';
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
  static ɵinj: i0.ɵɵInjectorDeclaration<LegacyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [MODULES],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [LegacyComponent],
                imports: MODULES,
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
    i0.ɵɵsetNgModuleScope(LegacyModule, { declarations: [LegacyComponent], imports: MODULES });
})();

```