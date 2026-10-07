# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';
import * as i1 from './highlight';

/*tcb1*/
function _tcb1(this: i0.App) {
  if (true) {
    var _t1 /*T:DIR:1*/ /*513,542*/ = null! as i1.Highlight; /*T:VAE*/
    _t1.highlight /*517,526*/ = this.color /*529,534*/ /*529,534*/ /*516,535*/;
  }
}

```

# /out/app.ts
```ts
import { Component, Directive } from '@angular/core';
import { Card } from './card';
import { Highlight } from './highlight';
import { BADGE_SELECTOR } from './selectors';
// @ts-ignore
import * as i0 from '@angular/core';

// Declared next to its consumer, with a selector from another file.
export class Badge {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Badge, never> = function Badge_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Badge)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Badge,
    '[badge]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: Badge, selectors: [['', 'badge', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Badge,
        [{ type: Directive, args: [{ selector: BADGE_SELECTOR }] }],
        null,
        null,
      );
  }
}

// Every dependency takes its selector from an imported constant. The consumer has to see the
// evaluated selector to match them in its template.
export class App {
  color = 'yellow';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<App, never> = function App_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || App)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    App,
    'app-root',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [['app-root']],
    decls: 3,
    vars: 1,
    consts: [['badge', '', 3, 'highlight']],
    template: function App_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'app-card')(1, 'p', 0);
        i0.ɵɵtext(2, 'hi');
        i0.ɵɵelementEnd()();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('highlight', ctx.color);
      }
    },
    dependencies: [Card, Highlight, Badge],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        App,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: '<app-card><p [highlight]="color" badge>hi</p></app-card>',
                imports: [Card, Highlight, Badge],
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
    i0.ɵsetClassDebugInfo(App, { className: 'App', filePath: 'app.ts', lineNumber: 17 });
})();

```

# /out/card.ngtypecheck.ts
```ts
/**
 * TCB for /card.ts
 * @generated
 */

import * as i0 from './card';

/*tcb1*/
function _tcb1(this: i0.Card) {
  if (true) {
  }
}

```

# /out/card.ts
```ts
import { Component } from '@angular/core';
import { CARD_SELECTOR } from './selectors';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['*'];

export class Card {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Card, never> = function Card_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Card)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Card,
    'app-card',
    never,
    {},
    {},
    never,
    ['*'],
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Card,
    selectors: [['app-card']],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function Card_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵprojection(0);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Card,
        [{ type: Component, args: [{ selector: CARD_SELECTOR, template: '<ng-content />' }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Card, { className: 'Card', filePath: 'card.ts', lineNumber: 5 });
})();

```

# /out/highlight.ts
```ts
import { Directive, Input } from '@angular/core';
import { HIGHLIGHT_SELECTOR } from './selectors';
// @ts-ignore
import * as i0 from '@angular/core';

export class Highlight {
  highlight = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Highlight, never> = function Highlight_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Highlight)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    Highlight,
    '[highlight]',
    never,
    { 'highlight': { 'alias': 'highlight'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Highlight,
    selectors: [['', 'highlight', '']],
    inputs: { highlight: 'highlight' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Highlight,
        [{ type: Directive, args: [{ selector: HIGHLIGHT_SELECTOR }] }],
        null,
        { highlight: [{ type: Input }] },
      );
  }
}

```

# /out/legacy.ngtypecheck.ts
```ts
/**
 * TCB for /legacy.ts
 * @generated
 */

import * as i0 from './legacy';

/*tcb1*/
function _tcb1(this: i0.LegacyItem) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.LegacyList) {
  if (true) {
  }
}

```

# /out/legacy.ts
```ts
import { Component, NgModule } from '@angular/core';
import { LEGACY_SELECTOR } from './selectors';
// @ts-ignore
import * as i0 from '@angular/core';

// The same through an NgModule's compilation scope.
export class LegacyItem {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyItem, never> = function LegacyItem_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyItem)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LegacyItem,
    'legacy-item',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LegacyItem,
    selectors: [['legacy-item']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function LegacyItem_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'item');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyItem,
        [
          {
            type: Component,
            args: [{ selector: LEGACY_SELECTOR, template: 'item', standalone: false }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(LegacyItem, {
      className: 'LegacyItem',
      filePath: 'legacy.ts',
      lineNumber: 6,
    });
})();

export class LegacyList {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyList, never> = function LegacyList_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyList)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    LegacyList,
    'legacy-list',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: LegacyList,
    selectors: [['legacy-list']],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function LegacyList_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'legacy-item');
      }
    },
    dependencies: [LegacyItem],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyList,
        [
          {
            type: Component,
            args: [{ selector: 'legacy-list', template: '<legacy-item />', standalone: false }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(LegacyList, {
      className: 'LegacyList',
      filePath: 'legacy.ts',
      lineNumber: 9,
    });
})();

export class LegacyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LegacyModule, never> = function LegacyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LegacyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    LegacyModule,
    [typeof LegacyItem, typeof LegacyList],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LegacyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LegacyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LegacyModule,
        [{ type: NgModule, args: [{ declarations: [LegacyItem, LegacyList] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(LegacyModule, { declarations: [LegacyItem, LegacyList] });
})();

```