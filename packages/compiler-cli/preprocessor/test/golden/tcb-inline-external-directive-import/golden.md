# /out/app.component.ts
```ts
import { Component, Directive, Input } from '@angular/core';
import { ExternalDir } from './external.directive';
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
    vars: 2,
    consts: [[3, 'localDir', 'extDir']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('localDir', ctx.message)('extDir', ctx.message);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [LocalDir, ExternalDir]),
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
                template: '<div [localDir]="message" [extDir]="message"></div>',
                standalone: true,
                imports: [LocalDir, ExternalDir],
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
      lineNumber: 18,
    });
})();

```

# /out/external.directive.ts
```ts
import { Directive, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ExternalDir {
  extDir: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExternalDir, never> = function ExternalDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ExternalDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ExternalDir,
    '[extDir]',
    never,
    { 'extDir': { 'alias': 'extDir'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ExternalDir,
    selectors: [['', 'extDir', '']],
    inputs: { extDir: 'extDir' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExternalDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[extDir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        { extDir: [{ type: Input }] },
      );
  }
}

```