# /out/app.ts
```ts
import { Attribute, Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function getAttrName() {
  return 'my-attr';
}

export class TestComponent {
  constructor(
    public literalAttr: string,
    public dynamicAttr: string,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<
    TestComponent,
    [{ attribute: 'literal-attr' }, { attribute: unknown }]
  > = function TestComponent_Factory(__ngFactoryType__: any): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || TestComponent)(
      i0.ɵɵinjectAttribute('literal-attr'),
      i0.ɵɵinjectAttribute(getAttrName()),
    );
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComponent,
    'app-test',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [['app-test']],
    decls: 2,
    vars: 0,
    template: function TestComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Test');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
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
                selector: 'app-test',
                template: '<div>Test</div>',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [
          { type: undefined, decorators: [{ type: Attribute, args: ['literal-attr'] }] },
          { type: undefined, decorators: [{ type: Attribute, args: [getAttrName()] }] },
        ],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: 'TestComponent',
      filePath: 'app.ts',
      lineNumber: 12,
    });
})();

```