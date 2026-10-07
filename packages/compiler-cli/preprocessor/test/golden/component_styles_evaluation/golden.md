# /out/test.component.ts
```ts
import { Component } from '@angular/core';
import { BORDER, SHARED_STYLES } from './styles';
// @ts-ignore
import * as i0 from '@angular/core';

const HEIGHT = 1000;
const WIDTH = 1000;
const SIZE = 100;

export class TestComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never> = function TestComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['test-cmp']],
    decls: 1,
    vars: 0,
    consts: [[1, 'box']],
    template: function TestComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
    },
    styles: [
      '[_nghost-%COMP%] {\n      display: block;\n      height: 1000px;\n      width: 1000px;\n      border: 2px solid black;\n    }',
      '.box[_ngcontent-%COMP%] {\n      height: 100px;\n      width: 100px;\n      position: absolute;\n      top: 450px;\n      left: 450px;\n    }',
      '.a[_ngcontent-%COMP%] { margin: 0; }',
      '.b[_ngcontent-%COMP%] { gap: 8px; }',
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                template: `<div class="box"></div>`,
                styles: [
                  ':host {\n      display: block;\n      height: 1000px;\n      width: 1000px;\n      border: 2px solid black;\n    }',
                  '.box {\n      height: 100px;\n      width: 100px;\n      position: absolute;\n      top: 450px;\n      left: 450px;\n    }',
                  '.a { margin: 0; }',
                  '.b { gap: 8px; }',
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
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'test.component.ts',
      lineNumber: 28,
    });
})();

```