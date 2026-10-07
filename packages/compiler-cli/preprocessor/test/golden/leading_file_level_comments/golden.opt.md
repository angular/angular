# /out/test.ngtypecheck.ts
```ts
/**
 * TCB for /test.ts
 * @generated
 */

import * as i0 from './test';
import * as i1 from '@angular/common';

/*tcb1*/
function _tcb1(this: i0.ReexportFirstComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*189,226*/ = null! as i1.NgClass; /*T:VAE*/
    _t1.ngClass /*195,202*/ = {
      'a' /*206,207*/: true /*209,213*/,
      'b' /*215,216*/: false /*218,223*/,
    } /*205,224*/ /*194,225*/;
  }
}

```

# /out/test.ts
```ts
// @ts-nocheck
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from '@angular/common';

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
    dependencies: [CommonModule, i1.NgClass],
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

# /out/test2.ngtypecheck.ts
```ts
/**
 * TCB for /test2.ts
 * @generated
 */

import * as i0 from './test2';

/*tcb1*/
function _tcb1(this: i0.ImportFirstComponent) {
  if (true) {
  }
}

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

# /out/test3.ngtypecheck.ts
```ts
/**
 * TCB for /test3.ts
 * @generated
 */

import * as i0 from './test3';

/*tcb1*/
function _tcb1(this: i0.EnumFirstComponent) {
  if (true) {
  }
}

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

# /out/test4.ngtypecheck.ts
```ts
/**
 * TCB for /test4.ts
 * @generated
 */

import * as i0 from './test4';

/*tcb1*/
function _tcb1(this: i0.ReferenceFirstComponent) {
  if (true) {
  }
}

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

# /out/test5.ngtypecheck.ts
```ts
/**
 * TCB for /test5.ts
 * @generated
 */

import * as i0 from './test5';
import * as i1 from '@angular/common';

/*tcb1*/
function _tcb1(this: i0.TrailingImportComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*164,191*/ = null! as i1.NgClass; /*T:VAE*/
    _t1.ngClass /*170,177*/ = this.someValue /*180,189*/ /*180,189*/ /*169,190*/;
  }
}

```

# /out/test5.ts
```ts
// @ts-nocheck
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OTHER } from './other';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from '@angular/common';

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
    dependencies: [CommonModule, i1.NgClass],
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