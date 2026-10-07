# /out/app.component.ts
```ts
import { Component, Directive, InjectionToken } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BaseComponent {
  protected static BASE_TOKEN = new InjectionToken<string>('BASE_TOKEN');
  protected static getBaseConfig() {
    return { provide: BaseComponent.BASE_TOKEN, useValue: 'base-val' };
  }
}

export class ProtectedComponent extends BaseComponent {
  protected static PROTECTED_TOKEN = new InjectionToken<string>('PROTECTED_TOKEN');

  protected static getProtectedProvider() {
    return { provide: ProtectedComponent.PROTECTED_TOKEN, useValue: 'protected-val' };
  }

  value = 'test';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ProtectedComponent, never> = /*@__PURE__*/ ((): any => {
    let ɵProtectedComponent_BaseFactory: any;
    return function ProtectedComponent_Factory(__ngFactoryType__: any): any {
      return (
        ɵProtectedComponent_BaseFactory ||
        (ɵProtectedComponent_BaseFactory = i0.ɵɵgetInheritedFactory(ProtectedComponent))
      )(__ngFactoryType__ || ProtectedComponent);
    };
  })();
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ProtectedComponent,
    'app-protected',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ProtectedComponent,
    selectors: [['app-protected']],
    features: [
      i0.ɵɵProvidersFeature([
        ProtectedComponent.getProtectedProvider(),
        BaseComponent.getBaseConfig(),
      ]),
      i0.ɵɵInheritDefinitionFeature,
    ],
    decls: 2,
    vars: 1,
    template: function ProtectedComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(ctx.value);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ProtectedComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-protected',
                template: '<div>{{ value }}</div>',
                standalone: true,
                providers: [
                  ProtectedComponent.getProtectedProvider(),
                  BaseComponent.getBaseConfig(),
                ],
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
    i0.ɵsetClassDebugInfo(ProtectedComponent, {
      className: 'ProtectedComponent',
      filePath: 'app.component.ts',
      lineNumber: 19,
    });
})();

export class ProtectedDirective {
  protected static DIR_TOKEN = new InjectionToken<string>('DIR_TOKEN');

  protected static getDirectiveProvider() {
    return { provide: ProtectedDirective.DIR_TOKEN, useValue: 'dir-val' };
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ProtectedDirective, never> =
    function ProtectedDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ProtectedDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ProtectedDirective,
    '[appProtectedDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ProtectedDirective,
    selectors: [['', 'appProtectedDir', '']],
    features: [i0.ɵɵProvidersFeature([ProtectedDirective.getDirectiveProvider()])],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ProtectedDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appProtectedDir]',
                standalone: true,
                providers: [ProtectedDirective.getDirectiveProvider()],
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