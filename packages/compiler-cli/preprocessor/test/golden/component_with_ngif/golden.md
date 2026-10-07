# /out/hello.component.ts
```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// @ts-ignore
import * as i0 from '@angular/core';

function HelloComponent_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1('Hello, ', ctx_r0.name, '!');
  }
}

export class HelloComponent {
  name = 'World';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HelloComponent, never> = function HelloComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HelloComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HelloComponent,
    'app-hello',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HelloComponent,
    selectors: [['app-hello']],
    decls: 1,
    vars: 1,
    consts: [[4, 'ngIf']],
    template: function HelloComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, HelloComponent_div_0_Template, 2, 1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', ctx.name);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(HelloComponent, [CommonModule]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HelloComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-hello',
                template: '<div *ngIf="name">Hello, {{name}}!</div>',
                standalone: true,
                imports: [CommonModule],
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
    i0.ɵsetClassDebugInfo(HelloComponent, {
      className: 'HelloComponent',
      filePath: 'hello.component.ts',
      lineNumber: 10,
    });
})();

```