# /out/test.ts
```ts
import { Component, Directive, TemplateRef } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function AppComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'div');
  }
}

class BaseDir {}

@Directive({
  selector: '[fullDir]',
  standalone: true,
  jit: false,
})
export class FullDir extends BaseDir {
  constructor(private templateRef: TemplateRef<any>) {
    super();
  }

  ngOnChanges() {}
}

@Directive({
  selector: '[jitDir]',
  jit: true,
  standalone: true,
})
export class JitDir {}

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
    consts: [[4, 'fullDir']],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, AppComponent_div_0_Template, 1, 0, 'div', 0);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [FullDir]),
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
                template: '<div *fullDir></div>',
                standalone: true,
                imports: [FullDir],
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
      lineNumber: 31,
    });
})();

```