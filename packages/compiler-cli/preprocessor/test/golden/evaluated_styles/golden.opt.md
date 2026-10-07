# /out/styled.ngtypecheck.ts
```ts
/**
 * TCB for /styled.ts
 * @generated
 */

import * as i0 from './styled';

/*tcb1*/
function _tcb1(this: i0.LocalSpread) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.ImportedArray) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.ImportedMixed) {
  if (true) {
  }
}

/*tcb4*/
function _tcb4(this: i0.ImportedStyleUrl) {
  if (true) {
  }
}

/*tcb5*/
function _tcb5(this: i0.ImportedStyleUrls) {
  if (true) {
  }
}

/*tcb6*/
function _tcb6(this: i0.MixedStyleUrls) {
  if (true) {
  }
}

```

# /out/styled.ts
```ts
import { Component } from '@angular/core';
import { HOST_STYLE, PANEL_URL, SHARED_STYLES, THEME_URLS } from './styles';
// @ts-ignore
import * as i0 from '@angular/core';

const LOCAL_STYLES = ['.local { color: blue; }'];
const LOCAL_URLS = ['./theme.css'];

// A spread of a constant from this file: ngtsc's evaluator flattens it.
export class LocalSpread {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalSpread, never> = function LocalSpread_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalSpread)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LocalSpread,
    'local-spread',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LocalSpread,
    selectors: [['local-spread']],
    decls: 2,
    vars: 0,
    consts: [[1, 'local']],
    template: function LocalSpread_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'local');
        i0.ɵɵdomElementEnd();
      }
    },
    styles: [
      '.local[_ngcontent-%COMP%] { color: blue; }',
      '.extra[_ngcontent-%COMP%] { margin: 0; }',
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalSpread,
        [
          {
            type: Component,
            args: [
              {
                selector: 'local-spread',
                template: '<div class="local">local</div>',
                styles: ['.local { color: blue; }', '.extra { margin: 0; }'],
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
    i0.ɵsetClassDebugInfo(LocalSpread, {
      className: 'LocalSpread',
      filePath: 'styled.ts',
      lineNumber: 13,
    });
})();

// The whole array from another file.
export class ImportedArray {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportedArray, never> = function ImportedArray_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ImportedArray)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ImportedArray,
    'imported-array',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ImportedArray,
    selectors: [['imported-array']],
    decls: 2,
    vars: 0,
    consts: [[1, 'shared']],
    template: function ImportedArray_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'shared');
        i0.ɵɵdomElementEnd();
      }
    },
    styles: ['.shared[_ngcontent-%COMP%] { color: red; }'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportedArray,
        [
          {
            type: Component,
            args: [
              {
                selector: 'imported-array',
                template: '<div class="shared">shared</div>',
                styles: ['.shared { color: red; }'],
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
    i0.ɵsetClassDebugInfo(ImportedArray, {
      className: 'ImportedArray',
      filePath: 'styled.ts',
      lineNumber: 21,
    });
})();

// An imported string next to a spread of an imported array.
export class ImportedMixed {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportedMixed, never> = function ImportedMixed_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ImportedMixed)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ImportedMixed,
    'imported-mixed',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ImportedMixed,
    selectors: [['imported-mixed']],
    decls: 2,
    vars: 0,
    consts: [[1, 'shared']],
    template: function ImportedMixed_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'mixed');
        i0.ɵɵdomElementEnd();
      }
    },
    styles: ['[_nghost-%COMP%] { display: block; }', '.shared[_ngcontent-%COMP%] { color: red; }'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportedMixed,
        [
          {
            type: Component,
            args: [
              {
                selector: 'imported-mixed',
                template: '<div class="shared">mixed</div>',
                styles: [':host { display: block; }', '.shared { color: red; }'],
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
    i0.ɵsetClassDebugInfo(ImportedMixed, {
      className: 'ImportedMixed',
      filePath: 'styled.ts',
      lineNumber: 29,
    });
})();

// A single stylesheet URL held in an imported constant.
export class ImportedStyleUrl {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportedStyleUrl, never> = function ImportedStyleUrl_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ImportedStyleUrl)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ImportedStyleUrl,
    'imported-style-url',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ImportedStyleUrl,
    selectors: [['imported-style-url']],
    decls: 2,
    vars: 0,
    consts: [[1, 'panel']],
    template: function ImportedStyleUrl_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'panel');
        i0.ɵɵdomElementEnd();
      }
    },
    styles: ['.panel[_ngcontent-%COMP%] { padding: 4px; }'],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportedStyleUrl,
        [
          {
            type: Component,
            args: [
              {
                selector: 'imported-style-url',
                template: '<div class="panel">panel</div>',
                styles: ['.panel { padding: 4px; }'],
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
    i0.ɵsetClassDebugInfo(ImportedStyleUrl, {
      className: 'ImportedStyleUrl',
      filePath: 'styled.ts',
      lineNumber: 37,
    });
})();

// `styleUrls` given as a whole imported array.
export class ImportedStyleUrls {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportedStyleUrls, never> =
    function ImportedStyleUrls_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ImportedStyleUrls)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ImportedStyleUrls,
    'imported-style-urls',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ImportedStyleUrls,
    selectors: [['imported-style-urls']],
    decls: 2,
    vars: 0,
    consts: [[1, 'theme']],
    template: function ImportedStyleUrls_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'theme');
        i0.ɵɵdomElementEnd();
      }
    },
    styles: [
      '.theme[_ngcontent-%COMP%] { color: green; }',
      '.panel[_ngcontent-%COMP%] { padding: 4px; }',
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportedStyleUrls,
        [
          {
            type: Component,
            args: [
              {
                selector: 'imported-style-urls',
                template: '<div class="theme">theme</div>',
                styles: ['.theme { color: green; }', '.panel { padding: 4px; }'],
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
    i0.ɵsetClassDebugInfo(ImportedStyleUrls, {
      className: 'ImportedStyleUrls',
      filePath: 'styled.ts',
      lineNumber: 45,
    });
})();

// `styleUrls` mixing a spread of a local constant and an imported element.
export class MixedStyleUrls {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MixedStyleUrls, never> = function MixedStyleUrls_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MixedStyleUrls)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MixedStyleUrls,
    'mixed-style-urls',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MixedStyleUrls,
    selectors: [['mixed-style-urls']],
    decls: 2,
    vars: 0,
    consts: [[1, 'theme', 'panel']],
    template: function MixedStyleUrls_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div', 0);
        i0.ɵɵtext(1, 'both');
        i0.ɵɵdomElementEnd();
      }
    },
    styles: [
      '.theme[_ngcontent-%COMP%] { color: green; }',
      '.panel[_ngcontent-%COMP%] { padding: 4px; }',
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MixedStyleUrls,
        [
          {
            type: Component,
            args: [
              {
                selector: 'mixed-style-urls',
                template: '<div class="theme panel">both</div>',
                styles: ['.theme { color: green; }', '.panel { padding: 4px; }'],
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
    i0.ɵsetClassDebugInfo(MixedStyleUrls, {
      className: 'MixedStyleUrls',
      filePath: 'styled.ts',
      lineNumber: 53,
    });
})();

```