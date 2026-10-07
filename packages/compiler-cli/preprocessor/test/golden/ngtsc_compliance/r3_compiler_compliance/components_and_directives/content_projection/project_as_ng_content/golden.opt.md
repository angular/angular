# /out/project_as_ng_content.ngtypecheck.ts
```ts
/**
 * TCB for /project_as_ng_content.ts
 * @generated
 */

import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'card',
  template: `
    <ng-content select="[card-title]"></ng-content>
    ---
    <ng-content select="[card-content]"></ng-content>
  `,
  standalone: false,
})
class Card {}

/*tcb1*/
function _tcb1(this: Card) {
  if (true) {
  }
}

@Component({
  selector: 'card-with-title',
  template: `
    <card>
      <h1 ngProjectAs="[card-title]">Title</h1>
      <ng-content ngProjectAs="[card-content]"></ng-content>
    </card>
  `,
  standalone: false,
})
class CardWithTitle {
  foo: any;
}

/*tcb2*/
function _tcb2(this: CardWithTitle) {
  if (true) {
  }
}

@Component({
  selector: 'app',
  template: ` <card-with-title>content</card-with-title> `,
  standalone: false,
})
class App {}

/*tcb3*/
function _tcb3(this: App) {
  if (true) {
  }
}

@NgModule({ declarations: [Card, CardWithTitle, App] })
class Module {}

```

# /out/project_as_ng_content.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = [[['', 'card-title', '']], [['', 'card-content', '']]];
const _c1 = ['[card-title]', '[card-content]'];
const _c2 = ['*'];
const _c3 = ['ngProjectAs', '[card-content]', 5, ['', 'card-content', '']];

class Card {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Card, never> = function Card_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Card)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Card,
    'card',
    never,
    {},
    {},
    never,
    ['[card-title]', '[card-content]'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Card,
    selectors: [['card']],
    standalone: false,
    ngContentSelectors: _c1,
    decls: 3,
    vars: 0,
    template: function Card_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵprojection(0);
        i0.ɵɵtext(1, ' --- ');
        i0.ɵɵprojection(2, 1);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Card,
        [
          {
            type: Component,
            args: [
              {
                selector: 'card',
                template: `
    		<ng-content select="[card-title]"></ng-content>
    		---
    		<ng-content select="[card-content]"></ng-content>
    	`,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(Card, {
      className: 'Card',
      filePath: 'project_as_ng_content.ts',
      lineNumber: 12,
    });
})();

class CardWithTitle {
  foo: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CardWithTitle, never> = function CardWithTitle_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CardWithTitle)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CardWithTitle,
    'card-with-title',
    never,
    {},
    {},
    never,
    ['*'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CardWithTitle,
    selectors: [['card-with-title']],
    standalone: false,
    ngContentSelectors: _c2,
    decls: 4,
    vars: 0,
    consts: [['ngProjectAs', '[card-title]', 5, ['', 'card-title', '']]],
    template: function CardWithTitle_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵelementStart(0, 'card')(1, 'h1', 0);
        i0.ɵɵtext(2, 'Title');
        i0.ɵɵelementEnd();
        i0.ɵɵprojection(3, 0, _c3);
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [Card],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CardWithTitle,
        [
          {
            type: Component,
            args: [
              {
                selector: 'card-with-title',
                template: `
    		<card>
    			<h1 ngProjectAs="[card-title]">Title</h1>
    			<ng-content ngProjectAs="[card-content]"></ng-content>
    		</card>
    	`,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(CardWithTitle, {
      className: 'CardWithTitle',
      filePath: 'project_as_ng_content.ts',
      lineNumber: 25,
    });
})();

class App {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<App, never> = function App_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || App)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<App, 'app', never, {}, {}, never, never, false, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: App,
      selectors: [['app']],
      standalone: false,
      decls: 2,
      vars: 0,
      template: function App_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'card-with-title');
          i0.ɵɵtext(1, 'content');
          i0.ɵɵelementEnd();
        }
      },
      dependencies: [CardWithTitle],
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
                selector: 'app',
                template: `
    		<card-with-title>content</card-with-title>
    	`,
                standalone: false,
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
    i0.ɵsetClassDebugInfo(App, {
      className: 'App',
      filePath: 'project_as_ng_content.ts',
      lineNumber: 36,
    });
})();

class Module {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Module, never> = function Module_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Module)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    Module,
    [typeof Card, typeof CardWithTitle, typeof App],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Module });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<Module> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Module,
        [{ type: NgModule, args: [{ declarations: [Card, CardWithTitle, App] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(Module, { declarations: [Card, CardWithTitle, App] });
})();

```