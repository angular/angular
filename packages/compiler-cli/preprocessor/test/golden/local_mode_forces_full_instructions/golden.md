# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// Standalone component with a plain-DOM template and no directive/pipe dependencies.
// This pins the instruction-set switch that depends only on compilation mode:
//   - LOCAL (golden.md): ngtsc cannot inspect dependencies, so hasDirectiveDependencies
//     is forced true and the FULL instruction set is emitted (ɵɵelementStart/End).
//   - OPTIMIZE (golden.opt.md): the component is standalone with no directive deps, so it
//     takes the DOM-only fast path (ɵɵdomElementStart/End).
// https://github.com/angular/angular/blob/e3ac727/packages/compiler/src/render3/view/compiler.ts#L201-L203
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
    decls: 3,
    vars: 0,
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div')(1, 'span');
        i0.ɵɵtext(2, 'hi');
        i0.ɵɵelementEnd()();
      }
    },
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
                template: `<div><span>hi</span></div>`,
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
      lineNumber: 15,
    });
})();

```