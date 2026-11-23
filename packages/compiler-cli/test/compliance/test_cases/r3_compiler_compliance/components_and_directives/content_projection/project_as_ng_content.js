import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = [[["", "card-title", ""]], [["", "card-content", ""]]];
const _c1 = ["[card-title]", "[card-content]"];
const _c2 = ["*"];
const _c3 = ["ngProjectAs", "[card-content]", 5, ["", "card-content", ""]];
class Card {
  static ɵfac = function Card_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Card)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Card,
    selectors: [["card"]],
    standalone: false,
    ngContentSelectors: _c1,
    decls: 3,
    vars: 0,
    template: function Card_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵprojection(0);
        i0.ɵɵtext(1, " --- ");
        i0.ɵɵprojection(2, 1);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Card,
      [
        {
          type: Component,
          args: [
            {
              selector: "card",
              template: `
		<ng-content select="[card-title]"></ng-content>
		---
		<ng-content select="[card-content]"></ng-content>
	`,
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Card, {
      className: "Card",
      filePath: "project_as_ng_content.ts",
      lineNumber: 12
    });
})();
class CardWithTitle {
  foo;
  static ɵfac = function CardWithTitle_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || CardWithTitle)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CardWithTitle,
    selectors: [["card-with-title"]],
    standalone: false,
    ngContentSelectors: _c2,
    decls: 4,
    vars: 0,
    consts: [["ngProjectAs", "[card-title]", 5, ["", "card-title", ""]]],
    template: function CardWithTitle_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵelementStart(0, "card")(1, "h1", 0);
        i0.ɵɵtext(2, "Title");
        i0.ɵɵelementEnd();
        i0.ɵɵprojection(3, 0, _c3);
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [Card],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      CardWithTitle,
      [
        {
          type: Component,
          args: [
            {
              selector: "card-with-title",
              template: `
		<card>
			<h1 ngProjectAs="[card-title]">Title</h1>
			<ng-content ngProjectAs="[card-content]"></ng-content>
		</card>
	`,
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CardWithTitle, {
      className: "CardWithTitle",
      filePath: "project_as_ng_content.ts",
      lineNumber: 25
    });
})();
class App {
  static ɵfac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || App)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [["app"]],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function App_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "card-with-title");
        i0.ɵɵtext(1, "content");
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [CardWithTitle],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      App,
      [
        {
          type: Component,
          args: [
            {
              selector: "app",
              template: `
		<card-with-title>content</card-with-title>
	`,
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(App, {
      className: "App",
      filePath: "project_as_ng_content.ts",
      lineNumber: 36
    });
})();
class Module {
  static ɵfac = function Module_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Module)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Module });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Module,
      [
        {
          type: NgModule,
          args: [{ declarations: [Card, CardWithTitle, App] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(Module, { declarations: [Card, CardWithTitle, App] });
})();
