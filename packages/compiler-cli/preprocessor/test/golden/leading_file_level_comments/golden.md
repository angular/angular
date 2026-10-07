# /out/test.ts
```ts
// @ts-nocheck
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => ({ a: true, b: false });

export * from './other';

export class ReexportFirstComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ReexportFirstComponent, never> =
    function ReexportFirstComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ReexportFirstComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ReexportFirstComponent,
    'app-reexport-first',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ReexportFirstComponent,
    selectors: [['app-reexport-first']],
    decls: 1,
    vars: 2,
    consts: [[3, 'ngClass']],
    template: function ReexportFirstComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngClass', i0.ɵɵpureFunction0(1, _c0));
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(ReexportFirstComponent, [CommonModule]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ReexportFirstComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-reexport-first',
                template: '<div [ngClass]="{a: true, b: false}"></div>',
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
    i0.ɵsetClassDebugInfo(ReexportFirstComponent, {
      className: 'ReexportFirstComponent',
      filePath: 'test.ts',
      lineNumber: 12,
    });
})();

```

# /out/test2.ts
```ts
// @ts-nocheck
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ImportFirstComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportFirstComponent, never> =
    function ImportFirstComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ImportFirstComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ImportFirstComponent,
    'app-import-first',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ImportFirstComponent,
    selectors: [['app-import-first']],
    decls: 0,
    vars: 0,
    template: function ImportFirstComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportFirstComponent,
        [{ type: Component, args: [{ selector: 'app-import-first', template: '' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ImportFirstComponent, {
      className: 'ImportFirstComponent',
      filePath: 'test2.ts',
      lineNumber: 5,
    });
})();

```

# /out/test3.ts
```ts
/**
 * @fileoverview This is a file that starts with an enum.
 */

// @ts-nocheck

import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
export enum Mode {
  On,
  Off,
}

export class EnumFirstComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EnumFirstComponent, never> =
    function EnumFirstComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || EnumFirstComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    EnumFirstComponent,
    'app-enum-first',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: EnumFirstComponent,
    selectors: [['app-enum-first']],
    decls: 0,
    vars: 0,
    template: function EnumFirstComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EnumFirstComponent,
        [{ type: Component, args: [{ selector: 'app-enum-first', template: '' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(EnumFirstComponent, {
      className: 'EnumFirstComponent',
      filePath: 'test3.ts',
      lineNumber: 15,
    });
})();

```

# /out/test4.ts
```ts
/// <reference types="node" />
// @ts-nocheck
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
export const VERSION = '1';

export class ReferenceFirstComponent {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ReferenceFirstComponent, never> =
    function ReferenceFirstComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ReferenceFirstComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ReferenceFirstComponent,
    'app-reference-first',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ReferenceFirstComponent,
    selectors: [['app-reference-first']],
    decls: 0,
    vars: 0,
    template: function ReferenceFirstComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ReferenceFirstComponent,
        [{ type: Component, args: [{ selector: 'app-reference-first', template: '' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ReferenceFirstComponent, {
      className: 'ReferenceFirstComponent',
      filePath: 'test4.ts',
      lineNumber: 8,
    });
})();

```

# /out/test5.ts
```ts
// @ts-nocheck
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OTHER } from './other';
// @ts-ignore
import * as i0 from '@angular/core';

export class TrailingImportComponent {
  someValue = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TrailingImportComponent, never> =
    function TrailingImportComponent_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TrailingImportComponent)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TrailingImportComponent,
    'app-trailing-import',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TrailingImportComponent,
    selectors: [['app-trailing-import']],
    decls: 1,
    vars: 1,
    consts: [[3, 'ngClass']],
    template: function TrailingImportComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngClass', ctx.someValue);
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(TrailingImportComponent, [CommonModule]),
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TrailingImportComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-trailing-import',
                template: '<div [ngClass]="someValue"></div>',
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
    i0.ɵsetClassDebugInfo(TrailingImportComponent, {
      className: 'TrailingImportComponent',
      filePath: 'test5.ts',
      lineNumber: 10,
    });
})();

```