/****************************************************************************************************
 * PARTIAL FILE: basic.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @boundary {
      Main Content
    } @error {
      Fallback Content
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    @boundary {
      Main Content
    } @error {
      Fallback Content
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: error_declaration.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @boundary {
      Main Content
    } @error (let err) {
      Error: {{err.message}}
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    @boundary {
      Main Content
    } @error (let err) {
      Error: {{err.message}}
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: error_declaration.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: retry_alias.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @boundary {
      Main Content
    } @error (let err, retry = $retry) {
      <button (click)="retry()">Retry</button>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    @boundary {
      Main Content
    } @error (let err, retry = $retry) {
      <button (click)="retry()">Retry</button>
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: retry_alias.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: retry_implicit.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @boundary {
      Main Content
    } @error {
      <button (click)="$retry()">Retry</button>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    @boundary {
      Main Content
    } @error {
      <button (click)="$retry()">Retry</button>
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: retry_implicit.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: when_condition.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @boundary {
      Main Content
    } @error (let err; when err.message === '404') {
      Not Found
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    @boundary {
      Main Content
    } @error (let err; when err.message === '404') {
      Not Found
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: when_condition.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: multiple_error_blocks.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @boundary {
      Main Content
    } @error (let err; when err.message === '404') {
      Not Found
    } @error (let err) {
      Generic Error
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    @boundary {
      Main Content
    } @error (let err; when err.message === '404') {
      Not Found
    } @error (let err) {
      Generic Error
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: multiple_error_blocks.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @boundary {
      Outer Main
      @boundary {
        Inner Main
      } @error {
        Inner Fallback
      }
    } @error {
      Outer Fallback
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    @boundary {
      Outer Main
      @boundary {
        Inner Main
      } @error {
        Inner Fallback
      }
    } @error {
      Outer Fallback
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

