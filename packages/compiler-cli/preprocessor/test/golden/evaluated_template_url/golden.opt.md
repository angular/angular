# /out/app/footer.component.ngtypecheck.ts
```ts
/**
 * TCB for /app/footer.component.ts
 * @generated
 */

import * as i0 from './footer.component';

/*tcb1*/
function _tcb1(this: i0.FooterComponent) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.BadFooterComponent) {
  if (true) {
  }
}

/*ngp-tcb-template-sources:{"tcb1":{"templateFile":"/app/footer.html"}}*/

```

# /out/app/footer.component.ts
```ts
import { Component } from '@angular/core';
import { FOOTER_TEMPLATE_URL, FOOTER_TEMPLATE_INDEX } from '../shared/footer_paths';
// @ts-ignore
import * as i0 from '@angular/core';

export class FooterComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FooterComponent, never> = function FooterComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FooterComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    FooterComponent,
    'app-footer',
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
      type: FooterComponent,
      selectors: [['app-footer']],
      decls: 2,
      vars: 0,
      template: function FooterComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵdomElementStart(0, 'footer');
          i0.ɵɵtext(1, 'footer');
          i0.ɵɵdomElementEnd();
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FooterComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-footer',
                template: '<footer>footer</footer>',
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
    i0.ɵsetClassDebugInfo(FooterComponent, {
      className: 'FooterComponent',
      filePath: 'app/footer.component.ts',
      lineNumber: 8,
    });
})();

export class BadFooterComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BadFooterComponent, never> =
    function BadFooterComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || BadFooterComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    BadFooterComponent,
    'app-bad-footer',
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
      type: BadFooterComponent,
      selectors: [['app-bad-footer']],
      decls: 0,
      vars: 0,
      template: function BadFooterComponent_Template(rf: number, ctx: any): any {},
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BadFooterComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-bad-footer',
                templateUrl: FOOTER_TEMPLATE_INDEX,
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
    i0.ɵsetClassDebugInfo(BadFooterComponent, {
      className: 'BadFooterComponent',
      filePath: 'app/footer.component.ts',
      lineNumber: 14,
    });
})();

```

# /out/app/header.component.ngtypecheck.ts
```ts
/**
 * TCB for /app/header.component.ts
 * @generated
 */

import * as i0 from './header.component';

/*tcb1*/
function _tcb1(this: i0.HeaderComponent) {
  if (true) {
  }
}

/*ngp-tcb-template-sources:{"tcb1":{"templateFile":"/app/header_templates/default_header.html"}}*/

```

# /out/app/header.component.ts
```ts
import { Component } from '@angular/core';
import { HEADER_TEMPLATE_URL, HEADER_STYLE_URLS } from '../lib/paths';
// @ts-ignore
import * as i0 from '@angular/core';

export class HeaderComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HeaderComponent, never> = function HeaderComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || HeaderComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    HeaderComponent,
    'app-header',
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
      type: HeaderComponent,
      selectors: [['app-header']],
      decls: 2,
      vars: 0,
      template: function HeaderComponent_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵdomElementStart(0, 'header');
          i0.ɵɵtext(1, 'default header');
          i0.ɵɵdomElementEnd();
        }
      },
      styles: ['header[_ngcontent-%COMP%] { color: red; }'],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HeaderComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-header',
                template: '<header>default header</header>',
                styles: ['header { color: red; }'],
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
    i0.ɵsetClassDebugInfo(HeaderComponent, {
      className: 'HeaderComponent',
      filePath: 'app/header.component.ts',
      lineNumber: 9,
    });
})();

```

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/app/footer.component.ts",
      "category": "error",
      "code": 1010,
      "messageText": "templateUrl must be a string",
      "span": {
        "start": 298,
        "end": 319
      }
    }
  ]
}

```