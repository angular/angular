/****************************************************************************************************
 * PARTIAL FILE: conditional.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.count = 0;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div i18n>
      Content:
      @if (count === 0) {
        before<span>zero</span>after
      } @else if (count === 1) {
        before<div>one</div>after
      } @else {
        before<button>otherwise</button>after
      }!

      @if (count === 7) {
        before<span>seven</span>after
      }
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div i18n>
      Content:
      @if (count === 0) {
        before<span>zero</span>after
      } @else if (count === 1) {
        before<div>one</div>after
      } @else {
        before<button>otherwise</button>after
      }!

      @if (count === 7) {
        before<span>seven</span>after
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: conditional.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    count: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: switch.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.count = 0;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div i18n>
      Content:
      @switch (count) {
        @case (0) {before<span>zero</span>after}
        @case (1) {before<div>one</div>after}
        @default {before<button>otherwise</button>after}
      }
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div i18n>
      Content:
      @switch (count) {
        @case (0) {before<span>zero</span>after}
        @case (1) {before<div>one</div>after}
        @default {before<button>otherwise</button>after}
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: switch.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    count: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.items = [1, 2, 3];
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div i18n>
      Content:
      @for (item of items; track item) {
        before<span>middle</span>after
      } @empty {
        before<div>empty</div>after
      }!
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div i18n>
      Content:
      @for (item of items; track item) {
        before<span>middle</span>after
      } @empty {
        before<div>empty</div>after
      }!
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    items: number[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: defer.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.isLoaded = false;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div i18n>
      Content:
      @defer (when isLoaded) {
        before<span>middle</span>after
      } @placeholder {
        before<div>placeholder</div>after
      } @loading {
        before<button>loading</button>after
      } @error {
        before<h1>error</h1>after
      }
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div i18n>
      Content:
      @defer (when isLoaded) {
        before<span>middle</span>after
      } @placeholder {
        before<div>placeholder</div>after
      } @loading {
        before<button>loading</button>after
      } @error {
        before<h1>error</h1>after
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: defer.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    isLoaded: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

