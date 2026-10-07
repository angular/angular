# /out/app.component.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// Decorator styleUrls (multiple, collapsed) + template `<link>`/`<style>`: the inlined
// `ɵsetClassMetadata` styles array must include every style source in cascade order
// (decorator styleUrls, template <link>, decorator inline styles, template <style>).
export class StyledComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StyledComponent, never> = function StyledComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StyledComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    StyledComponent,
    'styled-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StyledComponent,
    selectors: [['styled-cmp']],
    decls: 2,
    vars: 0,
    template: function StyledComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵelementEnd();
      }
    },
    styles: [
      '.from-style-urls[_ngcontent-%COMP%] { color: blue; }',
      '.from-style-urls-extra[_ngcontent-%COMP%] { color: green; }',
      '.from-template-link[_ngcontent-%COMP%] { color: red; }',
      '.from-inline[_ngcontent-%COMP%] { color: orange; }',
      '.from-template-style[_ngcontent-%COMP%] { color: purple; }',
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StyledComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'styled-cmp',
                standalone: true,
                template:
                  '<link rel="stylesheet" href="./styled-link.css" />\n<style>.from-template-style { color: purple; }</style>\n<div>Hello</div>',
                styles: [
                  '.from-style-urls { color: blue; }',
                  '.from-style-urls-extra { color: green; }',
                  '.from-template-link { color: red; }',
                  '.from-inline { color: orange; }',
                  '.from-template-style { color: purple; }',
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
    i0.ɵsetClassDebugInfo(StyledComponent, {
      className: 'StyledComponent',
      filePath: 'app.component.ts',
      lineNumber: 13,
    });
})();

// Empty `styleUrls: []`: resource stripping must still fire (the property is present),
// dropping `styleUrls` from `ɵsetClassMetadata` just like the reference's
// `transformDecoratorResources`, which keys off property presence rather than content.
export class EmptyStyleUrlsComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EmptyStyleUrlsComponent, never> =
    function EmptyStyleUrlsComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || EmptyStyleUrlsComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    EmptyStyleUrlsComponent,
    'empty-styleurls-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: EmptyStyleUrlsComponent,
    selectors: [['empty-styleurls-cmp']],
    decls: 2,
    vars: 0,
    template: function EmptyStyleUrlsComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Hello');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EmptyStyleUrlsComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'empty-styleurls-cmp',
                template: '<div>Hello</div>',
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(EmptyStyleUrlsComponent, {
      className: 'EmptyStyleUrlsComponent',
      filePath: 'app.component.ts',
      lineNumber: 24,
    });
})();

```