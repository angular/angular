# /out/src/app/app.component.ts
```ts
import { Component } from '@angular/core';
import { TestHostConsumerDirective } from '../directives/consumer_dir';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  onDisabledChange(val: boolean) {}
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
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppComponent,
      selectors: [['app-root']],
      decls: 1,
      vars: 0,
      consts: [['testHostConsumer', '', 3, 'disabledChange']],
      template: function AppComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'div', 0);
          i0.ɵɵlistener(
            'disabledChange',
            function AppComponent_Template_div_disabledChange_0_listener($event: any): any {
              return ctx.onDisabledChange($event);
            },
          );
          i0.ɵɵelementEnd();
        }
      },
      dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [TestHostConsumerDirective]),
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
                imports: [TestHostConsumerDirective],
                template:
                  '<div testHostConsumer (disabledChange)="onDisabledChange($event)"></div>',
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
      filePath: 'src/app/app.component.ts',
      lineNumber: 9,
    });
})();

```