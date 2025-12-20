/****************************************************************************************************
 * PARTIAL FILE: basic_switch.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    value() {
        return 1;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) {
          case 0
        }
        @case (1) {
          case 1
        }
        @case (2) {
          case 2
        }
        @default {
          default
        }
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) {
          case 0
        }
        @case (1) {
          case 1
        }
        @case (2) {
          case 2
        }
        @default {
          default
        }
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_switch.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    value(): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: switch_without_default.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    value = () => 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) {
          case 0
        }
        @case (1) {
          case 1
        }
        @case (2) {
          case 2
        }
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) {
          case 0
        }
        @case (1) {
          case 1
        }
        @case (2) {
          case 2
        }
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: switch_without_default.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    value: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_switch.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    value = () => 1;
    nestedValue = () => 2;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) {
          case 0
        }
        @case (1) {
          @switch (nestedValue()) {
            @case (0) {
              nested case 0
            }
            @case (1) {
              nested case 1
            }
            @case (2) {
              nested case 2
            }
          }
        }
        @case (2) {
          case 2
        }
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) {
          case 0
        }
        @case (1) {
          @switch (nestedValue()) {
            @case (0) {
              nested case 0
            }
            @case (1) {
              nested case 1
            }
            @case (2) {
              nested case 2
            }
          }
        }
        @case (2) {
          case 2
        }
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_switch.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    value: () => number;
    nestedValue: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: switch_with_pipe.js
 ****************************************************************************************************/
import { Component, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class TestPipe {
    transform(value) {
        return value;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, isStandalone: true, name: "test" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, decorators: [{
            type: Pipe,
            args: [{ name: 'test' }]
        }] });
export class MyApp {
    message = 'hello';
    value = () => 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @switch (value() | test) {
        @case (0 | test) {
          case 0
        }
        @case (1 | test) {
          case 1
        }
        @default {
          default
        }
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "pipe", type: TestPipe, name: "test" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @switch (value() | test) {
        @case (0 | test) {
          case 0
        }
        @case (1 | test) {
          case 1
        }
        @default {
          default
        }
      }
    </div>
  `,
                    imports: [TestPipe]
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: switch_with_pipe.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestPipe {
    transform(value: unknown): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, "test", true>;
}
export declare class MyApp {
    message: string;
    value: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: empty_switch.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @switch (message) {}
      {{message}}
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @switch (message) {}
      {{message}}
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: empty_switch.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: basic_if.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    value = () => 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @if (value()) {
        hello
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @if (value()) {
        hello
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_if.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    value: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: basic_if_else.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    value = () => 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @if (value()) {
        hello
      } @else {
        goodbye
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @if (value()) {
        hello
      } @else {
        goodbye
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_if_else.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    value: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: basic_if_else_if.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    value = () => 1;
    otherValue = () => 2;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @if (value() === 1) {
        one
      } @else if (otherValue() === 2) {
        two
      } @else if (message) {
        three
      } @else {
        four
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @if (value() === 1) {
        one
      } @else if (otherValue() === 2) {
        two
      } @else if (message) {
        three
      } @else {
        four
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_if_else_if.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    value: () => number;
    otherValue: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_if.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    val = 1;
    innerVal = 2;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @if (val === 0) {
        zero
      } @else if (val === 1) {
        one
      } @else if (val === 2) {
        @if (innerVal === 0) {
          inner zero
        } @else if (innerVal === 1) {
          inner one
        } @else if (innerVal === 2) {
          inner two
        } @else {
          inner three
        }
      } @else {
        three
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @if (val === 0) {
        zero
      } @else if (val === 1) {
        one
      } @else if (val === 2) {
        @if (innerVal === 0) {
          inner zero
        } @else if (innerVal === 1) {
          inner one
        } @else if (innerVal === 2) {
          inner two
        } @else {
          inner three
        }
      } @else {
        three
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_if.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    val: number;
    innerVal: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: if_with_pipe.js
 ****************************************************************************************************/
import { Component, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class TestPipe {
    transform(value) {
        return value;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, isStandalone: true, name: "test" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, decorators: [{
            type: Pipe,
            args: [{ name: 'test' }]
        }] });
export class MyApp {
    message = 'hello';
    val = 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @if ((val | test) === 1) {
        one
      } @else if ((val | test) === 2) {
        two
      } @else {
        three
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "pipe", type: TestPipe, name: "test" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @if ((val | test) === 1) {
        one
      } @else if ((val | test) === 2) {
        two
      } @else {
        three
      }
    </div>
  `,
                    imports: [TestPipe],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: if_with_pipe.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestPipe {
    transform(value: unknown): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, "test", true>;
}
export declare class MyApp {
    message: string;
    val: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: if_with_alias.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    value = () => 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @if (value(); as alias) {
        {{value()}} as {{alias}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @if (value(); as alias) {
        {{value()}} as {{alias}}
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: if_with_alias.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    value: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: if_nested_alias.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    value = () => 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @if (value(); as root) {
      Root: {{value()}}/{{root}}

      @if (value(); as inner) {
        Inner: {{value()}}/{{root}}/{{inner}}

        @if (value(); as innermost) {
          Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
        }
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @if (value(); as root) {
      Root: {{value()}}/{{root}}

      @if (value(); as inner) {
        Inner: {{value()}}/{{root}}/{{inner}}

        @if (value(); as innermost) {
          Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
        }
      }
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: if_nested_alias.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    value: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: if_nested_alias_listeners.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    value = () => 1;
    log(..._) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @if (value(); as root) {
      <button (click)="log(value(), root)"></button>

      @if (value(); as inner) {
        <button (click)="log(value(), root, inner)"></button>

        @if (value(); as innermost) {
          <button (click)="log(value(), root, inner, innermost)"></button>
        }
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @if (value(); as root) {
      <button (click)="log(value(), root)"></button>

      @if (value(); as inner) {
        <button (click)="log(value(), root, inner)"></button>

        @if (value(); as innermost) {
          <button (click)="log(value(), root, inner, innermost)"></button>
        }
      }
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: if_nested_alias_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    value: () => number;
    log(..._: any[]): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: basic_for.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        {{item.name}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        {{item.name}}
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_for.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_with_empty.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        {{item.name}}
      } @empty {
        No items!
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        {{item.name}}
      } @empty {
        No items!
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_with_empty.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_track_by_index.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track $index) {
        {{item.name}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track $index) {
        {{item.name}}
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_track_by_index.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_track_by_field.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track item.name[0].toUpperCase()) {
        {{item.name}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track item.name[0].toUpperCase()) {
        {{item.name}}
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_track_by_field.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_for.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [
        { name: 'one', subItems: ['sub one', 'sub two', 'sub three'] },
        { name: 'two', subItems: ['sub one', 'sub two', 'sub three'] },
        { name: 'three', subItems: ['sub one', 'sub two', 'sub three'] },
    ];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        {{item.name}}
        @for (subitem of item.subItems; track $index) {
          {{subitem}} from {{item.name}}
        }
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        {{item.name}}
        @for (subitem of item.subItems; track $index) {
          {{subitem}} from {{item.name}}
        }
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_for.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
        subItems: string[];
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_template_variables.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        Index: {{$index}}
        First: {{$first}}
        Last: {{$last}}
        Even: {{$even}}
        Odd: {{$odd}}
        Count: {{$count}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        Index: {{$index}}
        First: {{$first}}
        Last: {{$last}}
        Even: {{$even}}
        Odd: {{$odd}}
        Count: {{$count}}
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_template_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: never[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_aliased_template_variables.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track item; let idx = $index, f = $first; let l = $last, ev = $even, o = $odd; let co = $count) {
        Index: {{idx}}
        First: {{f}}
        Last: {{l}}
        Even: {{ev}}
        Odd: {{o}}
        Count: {{co}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track item; let idx = $index, f = $first; let l = $last, ev = $even, o = $odd; let co = $count) {
        Index: {{idx}}
        First: {{f}}
        Last: {{l}}
        Even: {{ev}}
        Odd: {{o}}
        Count: {{co}}
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_aliased_template_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: never[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_both_aliased_and_original_variables.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track item; let idx = $index, f = $first; let l = $last, ev = $even, o = $odd; let co = $count) {
        Original index: {{$index}}
        Original first: {{$first}}
        Original last: {{$last}}
        Original even: {{$even}}
        Original odd: {{$odd}}
        Original count: {{$count}}
        <hr>
        Aliased index: {{idx}}
        Aliased first: {{f}}
        Aliased last: {{l}}
        Aliased even: {{ev}}
        Aliased odd: {{o}}
        Aliased count: {{co}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track item; let idx = $index, f = $first; let l = $last, ev = $even, o = $odd; let co = $count) {
        Original index: {{$index}}
        Original first: {{$first}}
        Original last: {{$last}}
        Original even: {{$even}}
        Original odd: {{$odd}}
        Original count: {{$count}}
        <hr>
        Aliased index: {{idx}}
        Aliased first: {{f}}
        Aliased last: {{l}}
        Aliased even: {{ev}}
        Aliased odd: {{o}}
        Aliased count: {{co}}
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_both_aliased_and_original_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: never[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_for_template_variables.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [
        { name: 'one', subItems: ['sub one', 'sub two', 'sub three'] },
        { name: 'two', subItems: ['sub one', 'sub two', 'sub three'] },
        { name: 'three', subItems: ['sub one', 'sub two', 'sub three'] },
    ];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track item; let outerCount = $count) {
        {{item.name}}
        @for (subitem of item.subItems; track subitem) {
          Outer: {{outerCount}}
          Inner: {{$count}}
        }
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track item; let outerCount = $count) {
        {{item.name}}
        @for (subitem of item.subItems; track subitem) {
          Outer: {{outerCount}}
          Inner: {{$count}}
        }
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_for_template_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
        subItems: string[];
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_template_variables_listener.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [];
    log(..._) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track item; let ev = $even) {
        <div (click)="log($index, ev, $first, $count)"></div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track item; let ev = $even) {
        <div (click)="log($index, ev, $first, $count)"></div>
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_template_variables_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: never[];
    log(..._: any[]): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_variables_expression.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    items = [];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `@for (item of items; track item) {
    {{$odd + ''}}
  }`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `@for (item of items; track item) {
    {{$odd + ''}}
  }`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_variables_expression.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    items: never[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_data_slots.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
// We verify the data slots by defining templates before/after
// and checking that the indexes are sequential.
export class MyApp {
    items = ['one', 'two', 'three'];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <ng-template/>
    @for (item of items; track item) {
      {{item}}
    } @empty {
      Empty
    }
    <ng-template/>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <ng-template/>
    @for (item of items; track item) {
      {{item}}
    } @empty {
      Empty
    }
    <ng-template/>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_data_slots.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    items: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_template_variables_scope.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [];
    // These variables are defined so that the template type checker doesn't raise an error.
    $index;
    $count;
    $first;
    $last;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    {{$index}} {{$count}} {{$first}} {{$last}}

    @for (item of items; track item) {
      {{$index}} {{$count}} {{$first}} {{$last}}
    }

    {{$index}} {{$count}} {{$first}} {{$last}}
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{$index}} {{$count}} {{$first}} {{$last}}

    @for (item of items; track item) {
      {{$index}} {{$count}} {{$first}} {{$last}}
    }

    {{$index}} {{$count}} {{$first}} {{$last}}
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_template_variables_scope.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: never[];
    $index: any;
    $count: any;
    $first: any;
    $last: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_template_track_method_root.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
    trackFn(_index, item) {
        return item;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track trackFn($index, item)) {}
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track trackFn($index, item)) {}
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_template_track_method_root.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
    }[];
    trackFn(_index: number, item: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_template_track_method_nested.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
    trackFn(_index, item) {
        return item;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      <ng-template>
        @for (item of items; track trackFn($index, item)) {}
      </ng-template>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      <ng-template>
        @for (item of items; track trackFn($index, item)) {}
      </ng-template>
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_template_track_method_nested.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
    }[];
    trackFn(_index: number, item: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_template_track_method_only_index.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
    trackFn(index) {
        return index;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items; track trackFn($index)) {}
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items; track trackFn($index)) {}
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_template_track_method_only_index.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
    }[];
    trackFn(index: number): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_pure_track_reuse.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
    otherItems = [{ name: 'four' }, { name: 'five' }, { name: 'six' }];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @for (item of items; track item.name[0].toUpperCase()) {
      {{item.name}}
    }

    @for (otherItem of otherItems; track otherItem.name[0].toUpperCase()) {
      {{otherItem.name}}
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (item of items; track item.name[0].toUpperCase()) {
      {{item.name}}
    }

    @for (otherItem of otherItems; track otherItem.name[0].toUpperCase()) {
      {{otherItem.name}}
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_pure_track_reuse.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    items: {
        name: string;
    }[];
    otherItems: {
        name: string;
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_impure_track_reuse.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
    otherItems = [{ name: 'four' }, { name: 'five' }, { name: 'six' }];
    trackFn(item, message) {
        return message + item.name;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @for (item of items; track trackFn(item, message)) {
      {{item.name}}
    }

    @for (otherItem of otherItems; track trackFn(otherItem, message)) {
      {{otherItem.name}}
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (item of items; track trackFn(item, message)) {
      {{item.name}}
    }

    @for (otherItem of otherItems; track trackFn(otherItem, message)) {
      {{otherItem.name}}
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_impure_track_reuse.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    items: {
        name: string;
    }[];
    otherItems: {
        name: string;
    }[];
    trackFn(item: any, message: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_track_literals.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    items = [];
    trackFn(obj, arr) {
        return null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @for (item of items; track trackFn({foo: item, bar: item}, [item, item])) {
      {{item.name}}
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (item of items; track trackFn({foo: item, bar: item}, [item, item])) {
      {{item.name}}
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_track_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    items: {
        name: string;
    }[];
    trackFn(obj: any, arr: any[]): null;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_with_pipe.js
 ****************************************************************************************************/
import { Component, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class TestPipe {
    transform(value) {
        return value;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, isStandalone: true, name: "test" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestPipe, decorators: [{
            type: Pipe,
            args: [{ name: 'test' }]
        }] });
export class MyApp {
    message = 'hello';
    items = [1, 2, 3];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @for (item of items | test; track item) {
        {{item}}
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "pipe", type: TestPipe, name: "test" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @for (item of items | test; track item) {
        {{item}}
      }
    </div>
  `,
                    imports: [TestPipe],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_with_pipe.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestPipe {
    transform(value: unknown): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, "test", true>;
}
export declare class MyApp {
    message: string;
    items: number[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: if_element_root_node.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class Binding {
    binding = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Binding, isStandalone: true, selector: "[binding]", inputs: { binding: "binding" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, decorators: [{
            type: Directive,
            args: [{ selector: '[binding]' }]
        }], propDecorators: { binding: [{
                type: Input
            }] } });
export class MyApp {
    expr = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @if (expr === 0) {
      <div foo="1" bar="2" [binding]="3">{{expr}}</div>
    } @else if (expr === 1) {
      <div foo="4" bar="5" [binding]="6">{{expr}}</div>
    } @else {
      <div foo="7" bar="8" [binding]="9">{{expr}}</div>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: Binding, selector: "[binding]", inputs: ["binding"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @if (expr === 0) {
      <div foo="1" bar="2" [binding]="3">{{expr}}</div>
    } @else if (expr === 1) {
      <div foo="4" bar="5" [binding]="6">{{expr}}</div>
    } @else {
      <div foo="7" bar="8" [binding]="9">{{expr}}</div>
    }
  `,
                    imports: [Binding],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: if_element_root_node.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Binding {
    binding: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Binding, "[binding]", never, { "binding": { "alias": "binding"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyApp {
    expr: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: if_template_root_node.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class Binding {
    binding = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Binding, isStandalone: true, selector: "[binding]", inputs: { binding: "binding" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, decorators: [{
            type: Directive,
            args: [{ selector: '[binding]' }]
        }], propDecorators: { binding: [{
                type: Input
            }] } });
export class MyApp {
    expr = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @if (expr === 0) {
      <ng-template foo="1" bar="2" [binding]="3">{{expr}}</ng-template>
    } @else if (expr === 1) {
      <ng-template foo="4" bar="5" [binding]="6">{{expr}}</ng-template>
    } @else {
      <ng-template foo="7" bar="8" [binding]="9">{{expr}}</ng-template>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: Binding, selector: "[binding]", inputs: ["binding"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @if (expr === 0) {
      <ng-template foo="1" bar="2" [binding]="3">{{expr}}</ng-template>
    } @else if (expr === 1) {
      <ng-template foo="4" bar="5" [binding]="6">{{expr}}</ng-template>
    } @else {
      <ng-template foo="7" bar="8" [binding]="9">{{expr}}</ng-template>
    }
  `,
                    imports: [Binding],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: if_template_root_node.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Binding {
    binding: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Binding, "[binding]", never, { "binding": { "alias": "binding"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyApp {
    expr: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: if_element_root_node_at_end.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class Binding {
    binding = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Binding, isStandalone: true, selector: "[binding]", inputs: { binding: "binding" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, decorators: [{
            type: Directive,
            args: [{ selector: '[binding]' }]
        }], propDecorators: { binding: [{
                type: Input
            }] } });
export class MyApp {
    expr = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @if (expr === 0) {
      Hello <div foo="1" bar="2" [binding]="3">{{expr}}</div>
    } @else if (expr === 1) {
      Hello <div foo="4" bar="5" [binding]="6">{{expr}}</div>
    } @else {
      Hello <div foo="7" bar="8" [binding]="9">{{expr}}</div>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: Binding, selector: "[binding]", inputs: ["binding"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @if (expr === 0) {
      Hello <div foo="1" bar="2" [binding]="3">{{expr}}</div>
    } @else if (expr === 1) {
      Hello <div foo="4" bar="5" [binding]="6">{{expr}}</div>
    } @else {
      Hello <div foo="7" bar="8" [binding]="9">{{expr}}</div>
    }
  `,
                    imports: [Binding],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: if_element_root_node_at_end.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Binding {
    binding: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Binding, "[binding]", never, { "binding": { "alias": "binding"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyApp {
    expr: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_element_root_node.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class Binding {
    binding = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Binding, isStandalone: true, selector: "[binding]", inputs: { binding: "binding" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, decorators: [{
            type: Directive,
            args: [{ selector: '[binding]' }]
        }], propDecorators: { binding: [{
                type: Input
            }] } });
export class MyApp {
    items = [1, 2, 3];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @for (item of items; track item) {
      <div foo="1" bar="2" [binding]="3">{{item}}</div>
    } @empty {
      <span empty-foo="1" empty-bar="2" [binding]="3">Empty!</span>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: Binding, selector: "[binding]", inputs: ["binding"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (item of items; track item) {
      <div foo="1" bar="2" [binding]="3">{{item}}</div>
    } @empty {
      <span empty-foo="1" empty-bar="2" [binding]="3">Empty!</span>
    }
  `,
                    imports: [Binding],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_element_root_node.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Binding {
    binding: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Binding, "[binding]", never, { "binding": { "alias": "binding"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyApp {
    items: number[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_template_root_node.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class Binding {
    binding = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Binding, isStandalone: true, selector: "[binding]", inputs: { binding: "binding" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, decorators: [{
            type: Directive,
            args: [{ selector: '[binding]' }]
        }], propDecorators: { binding: [{
                type: Input
            }] } });
export class MyApp {
    items = [1, 2, 3];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @for (item of items; track item) {
      <ng-template foo="1" bar="2" [binding]="3">{{item}}</ng-template>
    } @empty {
      <ng-template empty-foo="1" empty-bar="2" [binding]="3">Empty!</ng-template>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: Binding, selector: "[binding]", inputs: ["binding"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (item of items; track item) {
      <ng-template foo="1" bar="2" [binding]="3">{{item}}</ng-template>
    } @empty {
      <ng-template empty-foo="1" empty-bar="2" [binding]="3">Empty!</ng-template>
    }
  `,
                    imports: [Binding],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_template_root_node.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Binding {
    binding: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Binding, "[binding]", never, { "binding": { "alias": "binding"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyApp {
    items: number[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_element_root_node_at_end.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class Binding {
    binding = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Binding, isStandalone: true, selector: "[binding]", inputs: { binding: "binding" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, decorators: [{
            type: Directive,
            args: [{ selector: '[binding]' }]
        }], propDecorators: { binding: [{
                type: Input
            }] } });
export class MyApp {
    items = [1, 2, 3];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @for (item of items; track item) {
      Hello <div foo="1" bar="2" [binding]="3">{{item}}</div>
    } @empty {
      Hello <span empty-foo="1" empty-bar="2" [binding]="3">Empty!</span>
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: Binding, selector: "[binding]", inputs: ["binding"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (item of items; track item) {
      Hello <div foo="1" bar="2" [binding]="3">{{item}}</div>
    } @empty {
      Hello <span empty-foo="1" empty-bar="2" [binding]="3">Empty!</span>
    }
  `,
                    imports: [Binding],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_element_root_node_at_end.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Binding {
    binding: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Binding, "[binding]", never, { "binding": { "alias": "binding"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyApp {
    items: number[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: switch_element_root_node.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class Binding {
    binding = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Binding, isStandalone: true, selector: "[binding]", inputs: { binding: "binding" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, decorators: [{
            type: Directive,
            args: [{ selector: '[binding]' }]
        }], propDecorators: { binding: [{
                type: Input
            }] } });
export class MyApp {
    expr = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @switch (expr) {
      @case (0) {
        <div foo="1" bar="2" [binding]="3">{{expr}}</div>
      }
      @case (1) {
        <div foo="4" bar="5" [binding]="6">{{expr}}</div>
      }
      @default {
        <div foo="7" bar="8" [binding]="9">{{expr}}</div>
      }
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: Binding, selector: "[binding]", inputs: ["binding"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @switch (expr) {
      @case (0) {
        <div foo="1" bar="2" [binding]="3">{{expr}}</div>
      }
      @case (1) {
        <div foo="4" bar="5" [binding]="6">{{expr}}</div>
      }
      @default {
        <div foo="7" bar="8" [binding]="9">{{expr}}</div>
      }
    }
  `,
                    imports: [Binding],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: switch_element_root_node.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Binding {
    binding: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Binding, "[binding]", never, { "binding": { "alias": "binding"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyApp {
    expr: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: switch_element_root_node_at_end.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class Binding {
    binding = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Binding, isStandalone: true, selector: "[binding]", inputs: { binding: "binding" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, decorators: [{
            type: Directive,
            args: [{ selector: '[binding]' }]
        }], propDecorators: { binding: [{
                type: Input
            }] } });
export class MyApp {
    expr = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @switch (expr) {
      @case (0) {
        Hello <div foo="1" bar="2" [binding]="3">{{expr}}</div>
      }
      @case (1) {
        Hello <div foo="4" bar="5" [binding]="6">{{expr}}</div>
      }
      @default {
        Hello <div foo="7" bar="8" [binding]="9">{{expr}}</div>
      }
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: Binding, selector: "[binding]", inputs: ["binding"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @switch (expr) {
      @case (0) {
        Hello <div foo="1" bar="2" [binding]="3">{{expr}}</div>
      }
      @case (1) {
        Hello <div foo="4" bar="5" [binding]="6">{{expr}}</div>
      }
      @default {
        Hello <div foo="7" bar="8" [binding]="9">{{expr}}</div>
      }
    }
  `,
                    imports: [Binding],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: switch_element_root_node_at_end.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Binding {
    binding: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Binding, "[binding]", never, { "binding": { "alias": "binding"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyApp {
    expr: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: switch_template_root_node.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class Binding {
    binding = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Binding, isStandalone: true, selector: "[binding]", inputs: { binding: "binding" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Binding, decorators: [{
            type: Directive,
            args: [{ selector: '[binding]' }]
        }], propDecorators: { binding: [{
                type: Input
            }] } });
export class MyApp {
    expr = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @switch (expr) {
      @case (0) {
        <ng-template foo="1" bar="2" [binding]="3">{{expr}}</ng-template>
      }
      @case (1) {
        <ng-template foo="4" bar="5" [binding]="6">{{expr}}</ng-template>
      }
      @default {
        <ng-template foo="7" bar="8" [binding]="9">{{expr}}</ng-template>
      }
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: Binding, selector: "[binding]", inputs: ["binding"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @switch (expr) {
      @case (0) {
        <ng-template foo="1" bar="2" [binding]="3">{{expr}}</ng-template>
      }
      @case (1) {
        <ng-template foo="4" bar="5" [binding]="6">{{expr}}</ng-template>
      }
      @default {
        <ng-template foo="7" bar="8" [binding]="9">{{expr}}</ng-template>
      }
    }
  `,
                    imports: [Binding],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: switch_template_root_node.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Binding {
    binding: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<Binding, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Binding, "[binding]", never, { "binding": { "alias": "binding"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class MyApp {
    expr: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: switch_multiple_cases.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    value() {
        return 1;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) @case(1) {
          case 01
        }
        @case (2) {
          case 2
        }
        @default {
          default
        }
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) @case(1) {
          case 01
        }
        @case (2) {
          case 2
        }
        @default {
          default
        }
      }
    </div>
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: switch_multiple_cases.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    value(): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_for_computed_template_variables.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    items = [];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @for (outer of items; track outer; let outerOdd = $odd, outerEven = $even, outerFirst = $first, outerLast = $last) {
      Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
      @for (inner of items; track inner; let innerOdd = $odd, innerEven = $even, innerFirst = $first, innerLast = $last) {
        Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
        <br>
        Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
        @for (innermost of items; track innermost; let innermostOdd = $odd, innermostEven = $even, innermostFirst = $first, innermostLast = $last) {
          Innermost vars: {{innermostOdd}} {{innermostEven}} {{innermostFirst}} {{innermostLast}}
          <br>
          Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
          <br>
          Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
        }
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (outer of items; track outer; let outerOdd = $odd, outerEven = $even, outerFirst = $first, outerLast = $last) {
      Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
      @for (inner of items; track inner; let innerOdd = $odd, innerEven = $even, innerFirst = $first, innerLast = $last) {
        Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
        <br>
        Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
        @for (innermost of items; track innermost; let innermostOdd = $odd, innermostEven = $even, innermostFirst = $first, innermostLast = $last) {
          Innermost vars: {{innermostOdd}} {{innermostEven}} {{innermostFirst}} {{innermostLast}}
          <br>
          Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
          <br>
          Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
        }
      }
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_for_computed_template_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    items: never[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_for_listener_computed_template_variables.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    items = [];
    outerCb(...args) { }
    innerCb(...args) { }
    innermostCb(...args) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @for (outer of items; track outer; let outerOdd = $odd, outerEven = $even, outerFirst = $first, outerLast = $last) {
      <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>

      @for (inner of items; track inner; let innerOdd = $odd, innerEven = $even, innerFirst = $first, innerLast = $last) {
        <button (click)="innerCb(innerOdd, innerEven, innerFirst, innerLast)"></button>
        <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>

        @for (innermost of items; track innermost; let innermostOdd = $odd, innermostEven = $even, innermostFirst = $first, innermostLast = $last) {
          <button (click)="innermostCb(innermostOdd, innermostEven, innermostFirst, innermostLast)"></button>
          <button (click)="innerCb(innerOdd, innerEven, innerFirst, innerLast)"></button>
          <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>
        }
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (outer of items; track outer; let outerOdd = $odd, outerEven = $even, outerFirst = $first, outerLast = $last) {
      <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>

      @for (inner of items; track inner; let innerOdd = $odd, innerEven = $even, innerFirst = $first, innerLast = $last) {
        <button (click)="innerCb(innerOdd, innerEven, innerFirst, innerLast)"></button>
        <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>

        @for (innermost of items; track innermost; let innermostOdd = $odd, innermostEven = $even, innermostFirst = $first, innermostLast = $last) {
          <button (click)="innermostCb(innermostOdd, innermostEven, innermostFirst, innermostLast)"></button>
          <button (click)="innerCb(innerOdd, innerEven, innerFirst, innerLast)"></button>
          <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>
        }
      }
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_for_listener_computed_template_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    items: never[];
    outerCb(...args: unknown[]): void;
    innerCb(...args: unknown[]): void;
    innermostCb(...args: unknown[]): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_for_tracking_function.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    items = [];
    trackByGrandparent = (item, index) => index;
    trackByParent = (item, index) => index;
    trackByChild = (item, index) => index;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    @for (grandparent of items; track trackByGrandparent(grandparent, $index)) {
      @for (parent of grandparent.items; track trackByParent(parent, $index)) {
        @for (child of parent.items; track trackByChild(child, $index)) {

        }
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (grandparent of items; track trackByGrandparent(grandparent, $index)) {
      @for (parent of grandparent.items; track trackByParent(parent, $index)) {
        @for (child of parent.items; track trackByChild(child, $index)) {

        }
      }
    }
  `,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_for_tracking_function.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    items: any[];
    trackByGrandparent: (item: any, index: number) => number;
    trackByParent: (item: any, index: number) => number;
    trackByChild: (item: any, index: number) => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: conditional_same_component_names.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
function it(_desc, fn) { }
it('case 1', () => {
    class TestComponent {
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `, isInline: true });
    }
    i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
                type: Component,
                args: [{
                        template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
                        standalone: false
                    }]
            }] });
});
it('case 2', () => {
    class TestComponent {
        static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
        static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `, isInline: true });
    }
    i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
                type: Component,
                args: [{
                        template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
                        standalone: false
                    }]
            }] });
});

/****************************************************************************************************
 * PARTIAL FILE: conditional_same_component_names.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: for_track_by_temporary_variables.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.items = [];
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @for (item of items; track item?.name?.[0]?.toUpperCase() ?? foo) {}
    @for (item of items; track item.name ?? $index ?? foo) {}
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (item of items; track item?.name?.[0]?.toUpperCase() ?? foo) {}
    @for (item of items; track item.name ?? $index ?? foo) {}
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: for_track_by_temporary_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    foo: any;
    items: {
        name?: string;
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: else_if_with_alias.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    one = false;
    value = () => 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @if (one) {
        {{one}}
      } @else if (value(); as alias) {
        {{value()}} as {{alias}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @if (one) {
        {{one}}
      } @else if (value(); as alias) {
        {{value()}} as {{alias}}
      }
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: else_if_with_alias.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    one: boolean;
    value: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: else_if_with_same_alias.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    one = false;
    two = 2;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @if (one; as alias) {
        {{alias}}
      } @else if (two; as alias) {
        {{alias}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @if (one; as alias) {
        {{alias}}
      } @else if (two; as alias) {
        {{alias}}
      }
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: else_if_with_same_alias.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    one: boolean;
    two: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: else_if_multiple_with_alias.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    message = 'hello';
    one = 1;
    two = 2;
    three = 3;
    four = 4;
    five = 5;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div>
      {{message}}
      @if (one; as foo) {
        One: {{foo}}
      } @else if (two) {
        Two: {{two}}
      } @else if (three; as bar) {
        Three: {{bar}}
      } @else if (four; as baz) {
        Four: {{baz}}
      } @else if (five) {
        Five: {{five}}
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div>
      {{message}}
      @if (one; as foo) {
        One: {{foo}}
      } @else if (two) {
        Two: {{two}}
      } @else if (three; as bar) {
        Three: {{bar}}
      } @else if (four; as baz) {
        Four: {{baz}}
      } @else if (five) {
        Five: {{five}}
      }
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: else_if_multiple_with_alias.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    message: string;
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: else_if_nested_with_alias.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    foo = false;
    value = () => 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @if (foo) {
      foo
    } @else if (value(); as root) {
      Root: {{value()}}/{{root}}

      @if (foo) {
        foo
      } @else if (value(); as inner) {
        Inner: {{value()}}/{{root}}/{{inner}}

        @if (foo) {
          foo
        } @else if (value(); as innermost) {
          Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
        }
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @if (foo) {
      foo
    } @else if (value(); as root) {
      Root: {{value()}}/{{root}}

      @if (foo) {
        foo
      } @else if (value(); as inner) {
        Inner: {{value()}}/{{root}}/{{inner}}

        @if (foo) {
          foo
        } @else if (value(); as innermost) {
          Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
        }
      }
    }
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: else_if_nested_with_alias.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    foo: boolean;
    value: () => number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

