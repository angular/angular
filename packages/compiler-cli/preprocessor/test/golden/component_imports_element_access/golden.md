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
    'a-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: AComponent,
    selectors: [['a-cmp']],
    decls: 1,
    vars: 0,
    template: function AComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'a');
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
                selector: 'a-cmp',
                standalone: true,
                template: 'a',
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
import { LIST } from './list';
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
    decls: 2,
    vars: 0,
    consts: [['bDir', '']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'a-cmp')(1, 'div', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [LIST[0]]),
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
                imports: [LIST[0]],
                template: '<a-cmp></a-cmp><div bDir></div>',
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
    '[bDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: BDirective, selectors: [['', 'bDir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[bDir]',
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