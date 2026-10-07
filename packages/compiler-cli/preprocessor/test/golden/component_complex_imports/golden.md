# /out/app.component.ts
```ts
import { Component, Directive } from '@angular/core';
import { SHARED_COMPONENTS } from './shared';
import * as icons from './icons';
import { BarrelItemComponent } from './barrel';
import { FeatureModule } from './feature.module';
// @ts-ignore
import * as i0 from '@angular/core';

export class LocalDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalDirective, never> = function LocalDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LocalDirective,
    '[appLocalDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: LocalDirective,
    selectors: [['', 'appLocalDir', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appLocalDir]',
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

const LOCAL_DIRECTIVES = [LocalDirective];
const MWP = { ngModule: FeatureModule, providers: [] };

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
    decls: 7,
    vars: 0,
    consts: [['appLocalDir', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'app-button', 0);
        i0.ɵɵtext(1, 'Click');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'app-card');
        i0.ɵɵtext(3, 'Card');
        i0.ɵɵelementEnd();
        i0.ɵɵelement(4, 'app-icon')(5, 'app-barrel-item')(6, 'app-feature-inner');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [
      SHARED_COMPONENTS,
      ...LOCAL_DIRECTIVES,
      MWP,
      icons.IconComponent,
      BarrelItemComponent,
    ]),
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
                standalone: true,
                imports: [
                  SHARED_COMPONENTS,
                  ...LOCAL_DIRECTIVES,
                  MWP,
                  icons.IconComponent,
                  BarrelItemComponent,
                ],
                template: `
        <app-button appLocalDir>Click</app-button>
        <app-card>Card</app-card>
        <app-icon></app-icon>
        <app-barrel-item></app-barrel-item>
        <app-feature-inner></app-feature-inner>
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
    i0.ɵsetClassDebugInfo(AppComponent, {
      className: 'AppComponent',
      filePath: 'app.component.ts',
      lineNumber: 34,
    });
})();

```

# /out/barrel.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
export * from './other';

export class BarrelItemComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BarrelItemComponent, never> =
    function BarrelItemComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || BarrelItemComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    BarrelItemComponent,
    'app-barrel-item',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: BarrelItemComponent,
    selectors: [['app-barrel-item']],
    decls: 2,
    vars: 0,
    template: function BarrelItemComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'span');
        i0.ɵɵtext(1, 'Barrel');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BarrelItemComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-barrel-item',
                standalone: true,
                template: '<span>Barrel</span>',
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
    i0.ɵsetClassDebugInfo(BarrelItemComponent, {
      className: 'BarrelItemComponent',
      filePath: 'barrel.ts',
      lineNumber: 9,
    });
})();

```

# /out/button.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];

export class ButtonComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ButtonComponent, never> = function ButtonComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ButtonComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ButtonComponent,
    'app-button',
    never,
    {},
    {},
    never,
    ['*'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ButtonComponent,
    selectors: [['app-button']],
    ngContentSelectors: _c0,
    decls: 2,
    vars: 0,
    template: function ButtonComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵelementStart(0, 'button');
        i0.ɵɵprojection(1);
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ButtonComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-button',
                standalone: true,
                template: '<button><ng-content></ng-content></button>',
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
    i0.ɵsetClassDebugInfo(ButtonComponent, {
      className: 'ButtonComponent',
      filePath: 'button.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/card.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];

export class CardComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CardComponent, never> = function CardComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CardComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CardComponent,
    'app-card',
    never,
    {},
    {},
    never,
    ['*'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CardComponent,
    selectors: [['app-card']],
    ngContentSelectors: _c0,
    decls: 2,
    vars: 0,
    template: function CardComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵprojection(1);
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CardComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-card',
                standalone: true,
                template: '<div><ng-content></ng-content></div>',
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
    i0.ɵsetClassDebugInfo(CardComponent, {
      className: 'CardComponent',
      filePath: 'card.component.ts',
      lineNumber: 8,
    });
})();

```

# /out/feature.module.ts
```ts
import { NgModule, Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FeatureInnerComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FeatureInnerComponent, never> =
    function FeatureInnerComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || FeatureInnerComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    FeatureInnerComponent,
    'app-feature-inner',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: FeatureInnerComponent,
    selectors: [['app-feature-inner']],
    decls: 2,
    vars: 0,
    template: function FeatureInnerComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'p');
        i0.ɵɵtext(1, 'Feature Inner');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FeatureInnerComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-feature-inner',
                template: '<p>Feature Inner</p>',
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
    i0.ɵsetClassDebugInfo(FeatureInnerComponent, {
      className: 'FeatureInnerComponent',
      filePath: 'feature.module.ts',
      lineNumber: 7,
    });
})();

export class FeatureModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FeatureModule, never> = function FeatureModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FeatureModule)();
  };
  // @ts-ignore
  static ɵmod: FeatureModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FeatureModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FeatureModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [FeatureInnerComponent],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FeatureModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [FeatureInnerComponent],
                exports: [FeatureInnerComponent],
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
    i0.ɵɵsetNgModuleScope(FeatureModule, {
      declarations: [FeatureInnerComponent],
      exports: [FeatureInnerComponent],
    });
})();

```

# /out/icons.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class IconComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<IconComponent, never> = function IconComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || IconComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    IconComponent,
    'app-icon',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: IconComponent,
    selectors: [['app-icon']],
    decls: 2,
    vars: 0,
    template: function IconComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'i');
        i0.ɵɵtext(1, 'icon');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        IconComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-icon',
                standalone: true,
                template: '<i>icon</i>',
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
    i0.ɵsetClassDebugInfo(IconComponent, {
      className: 'IconComponent',
      filePath: 'icons.ts',
      lineNumber: 8,
    });
})();

```

# /out/other.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class OtherUnusedComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OtherUnusedComponent, never> =
    function OtherUnusedComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || OtherUnusedComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    OtherUnusedComponent,
    'other-unused',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OtherUnusedComponent,
    selectors: [['other-unused']],
    decls: 0,
    vars: 0,
    template: function OtherUnusedComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        OtherUnusedComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'other-unused',
                standalone: true,
                template: '',
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
    i0.ɵsetClassDebugInfo(OtherUnusedComponent, {
      className: 'OtherUnusedComponent',
      filePath: 'other.ts',
      lineNumber: 8,
    });
})();

```