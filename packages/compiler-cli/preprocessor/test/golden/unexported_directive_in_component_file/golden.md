# /out/app.component.ts
```ts
import { Component, Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class LocalDir {
  localDir: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalDir, never> = function LocalDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    LocalDir,
    '[localDir]',
    never,
    { 'localDir': { 'alias': 'localDir'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: LocalDir,
    selectors: [['', 'localDir', '']],
    inputs: { localDir: 'localDir' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[localDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { localDir: [{ type: Input }] },
      );
  }
}

export class AppComponent {
  message = 'hello';
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
    vars: 1,
    consts: [[3, 'localDir']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('localDir', ctx.message);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [LocalDir]),
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
                template: '<div [localDir]="message"></div>',
                standalone: true,
                imports: [LocalDir],
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
      lineNumber: 17,
    });
})();

```