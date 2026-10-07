# /out/test.ts
```ts
import { Component, Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class UnusedDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UnusedDir, never> = function UnusedDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UnusedDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    UnusedDir,
    '[unusedDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: UnusedDir, selectors: [['', 'unusedDir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UnusedDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[unusedDir]',
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
    decls: 0,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {},
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [UnusedDir]),
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
                template: '',
                standalone: true,
                imports: [UnusedDir],
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
      filePath: 'test.ts',
      lineNumber: 15,
    });
})();

```