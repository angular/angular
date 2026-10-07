# /out/app.component.ts
```ts
import { Component } from '@angular/core';
import { TestComponent, TestDirective } from 'test-lib';
// @ts-ignore
import * as i0 from '@angular/core';

export class AppComponent {
  handle(e: any) {}
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
    vars: 6,
    consts: [
      [3, 'simpleOutput', 'aliasedOutputAlias', 'simple', 'alias', 'requiredAlias', 'signalAlias'],
      ['test-dir', '', 3, 'dirInput', 'signal'],
    ],
    template: function AppComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'test-cmp', 0);
        i0.ɵɵlistener(
          'simpleOutput',
          function AppComponent_Template_test_cmp_simpleOutput_0_listener($event: any): any {
            return ctx.handle($event);
          },
        )(
          'aliasedOutputAlias',
          function AppComponent_Template_test_cmp_aliasedOutputAlias_0_listener($event: any): any {
            return ctx.handle($event);
          },
        );
        i0.ɵɵelementEnd();
        i0.ɵɵelement(1, 'div', 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty('simple', 'hello')('alias', 'world')('requiredAlias', 'backend')(
          'signalAlias',
          'sig',
        );
        i0.ɵɵadvance();
        i0.ɵɵproperty('dirInput', 'test')('signal', 'sig');
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [TestComponent, TestDirective]),
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
                template: `
        <test-cmp 
          [simple]="'hello'" 
          [alias]="'world'" 
          [requiredAlias]="'backend'" 
          [signalAlias]="'sig'"
          (simpleOutput)="handle($event)"
          (aliasedOutputAlias)="handle($event)"
        ></test-cmp>
        <div test-dir [dirInput]="'test'" [signal]="'sig'"></div>
      `,
                standalone: true,
                imports: [TestComponent, TestDirective],
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
      lineNumber: 20,
    });
})();

```