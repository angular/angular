/****************************************************************************************************
 * PARTIAL FILE: arrow_function_no_context.js
 ****************************************************************************************************/
import { Component, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    sigA = signal(1, ...(ngDevMode ? [{ debugName: "sigA" }] : /* istanbul ignore next */ []));
    sigB = signal(2, ...(ngDevMode ? [{ debugName: "sigB" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <button (click)="sigA.update(value => value + 1)">Increment A</button>
    <button (click)="sigA.update(value => value - 1)">Decrement A</button>
    <button (click)="sigB.update(value => value + 1)">Increment B</button>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <button (click)="sigA.update(value => value + 1)">Increment A</button>
    <button (click)="sigA.update(value => value - 1)">Decrement A</button>
    <button (click)="sigB.update(value => value + 1)">Increment B</button>
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_no_context.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    sigA: import("@angular/core").WritableSignal<number>;
    sigB: import("@angular/core").WritableSignal<number>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_top_level_context.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    value = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `{{(param => param + value + 1)('param')}}`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `{{(param => param + value + 1)('param')}}`
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_top_level_context.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    value: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_this_access.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    a = 2;
    b = 4;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `{{((a, b) => a + this.a + b + this.b)(1, 3)}}`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `{{((a, b) => a + this.a + b + this.b)(1, 3)}}`
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_this_access.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    a: number;
    b: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_let_nested.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @let a = 1;

    @if (true) {
      @let b = 2;

      @if (true) {
        @let c = 3;
        {{(() => a + b + c)()}}
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @let a = 1;

    @if (true) {
      @let b = 2;

      @if (true) {
        @let c = 3;
        {{(() => a + b + c)()}}
      }
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_let_nested.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_nested_listeners.js
 ****************************************************************************************************/
import { Component, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    someSignal = signal('', ...(ngDevMode ? [{ debugName: "someSignal" }] : /* istanbul ignore next */ []));
    componentProp = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @let a = 1;

    @if (true) {
      <input #b>

      @if (true) {
        @let c = 3;

        <button (click)="someSignal((prev) => prev + a + b.value + c + componentProp)"></button>
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @let a = 1;

    @if (true) {
      <input #b>

      @if (true) {
        @let c = 3;

        <button (click)="someSignal((prev) => prev + a + b.value + c + componentProp)"></button>
      }
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_nested_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    someSignal: import("@angular/core").WritableSignal<string>;
    componentProp: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_defined_let.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    componentValue = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @let fn = (a, b) => componentValue + a + b;
    One: {{fn(0, 1)}}

    @if (true) {
      Two: {{fn(1, 1)}}

      <button (click)="componentValue = fn(2, 1)"></button>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @let fn = (a, b) => componentValue + a + b;
    One: {{fn(0, 1)}}

    @if (true) {
      Two: {{fn(1, 1)}}

      <button (click)="componentValue = fn(2, 1)"></button>
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_defined_let.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    componentValue: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_host_binding.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class TestDir {
    componentProp = 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, host: { properties: { "attr.no-context": "((a, b) => a / b)(5, 10)", "attr.with-context": "((a, b) => a / b + componentProp)(6, 12)" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '[attr.no-context]': '((a, b) => a / b)(5, 10)',
                        '[attr.with-context]': '((a, b) => a / b + componentProp)(6, 12)',
                    }
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_host_binding.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestDir {
    componentProp: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_host_listener.js
 ****************************************************************************************************/
import { Directive, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class TestDir {
    someSignal = signal(0, ...(ngDevMode ? [{ debugName: "someSignal" }] : /* istanbul ignore next */ []));
    componentProp = 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, host: { listeners: { "click": "someSignal.update(prev => prev + 1)", "mousedown": "someSignal.update(() => componentProp + 1)" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '(click)': 'someSignal.update(prev => prev + 1)',
                        '(mousedown)': 'someSignal.update(() => componentProp + 1)',
                    }
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_host_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestDir {
    someSignal: import("@angular/core").WritableSignal<number>;
    componentProp: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_pure_return_values.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    componentProp = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    {{(a => ({foo: a, bar: componentProp}))(1).foo}}
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{(a => ({foo: a, bar: componentProp}))(1).foo}}
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_pure_return_values.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    componentProp: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_inside_pure_value.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    componentProp = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    {{[(a) => a + 1][0](1000)}}
    {{[(a) => a + 1 + componentProp][0](1000)}}
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{[(a) => a + 1][0](1000)}}
    {{[(a) => a + 1 + componentProp][0](1000)}}
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_inside_pure_value.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    componentProp: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_returning_arrow_function_no_context.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `{{(a => b => c => d => a + b + c + d)(1)(2)(3)(4)}}`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `{{(a => b => c => d => a + b + c + d)(1)(2)(3)(4)}}`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_returning_arrow_function_no_context.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_returning_arrow_function_top_level_context.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    componentProp = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `{{(a => b => c => d => a + b + c + d + componentProp)(1)(2)(3)(4)}}`, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `{{(a => b => c => d => a + b + c + d + componentProp)(1)(2)(3)(4)}}`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_returning_arrow_function_top_level_context.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    componentProp: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_returning_arrow_function_nested_context.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    componentProp = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @let topLevelLet = 1;

    @if (true) {
      @let nestedLet = 2;

      @if (true) {
        {{(a => b => c => d => a + b + c + d + componentProp + topLevelLet + nestedLet)(1)(2)(3)(4)}}
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @let topLevelLet = 1;

    @if (true) {
      @let nestedLet = 2;

      @if (true) {
        {{(a => b => c => d => a + b + c + d + componentProp + topLevelLet + nestedLet)(1)(2)(3)(4)}}
      }
    }
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_returning_arrow_function_nested_context.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    componentProp: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_safe_access.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    componentProp = {};
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    {{(value => value?.a?.b?.c?.()?.()?.()?.())(componentProp)}}
    <hr>
    {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{(value => value?.a?.b?.c?.()?.()?.()?.())(componentProp)}}
    <hr>
    {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_safe_access.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    componentProp: {
        a?: {
            b?: {
                c?: () => () => () => () => string;
            };
        };
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_safe_access_nested_views.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    componentProp = {};
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @if (true) {
      @if (true) {
        @if (true) {
          {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
        }
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @if (true) {
      @if (true) {
        @if (true) {
          {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
        }
      }
    }
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_safe_access_nested_views.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    componentProp: {
        a?: {
            b?: {
                c?: () => () => () => () => string;
            };
        };
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_pipe.js
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
export class TestComp {
    componentProp = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    {{(a, b) => a + b | test}}
    <hr>
    {{(a, b) => a + b + componentProp | test}}
  `, isInline: true, dependencies: [{ kind: "pipe", type: TestPipe, name: "test" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{(a, b) => a + b | test}}
    <hr>
    {{(a, b) => a + b + componentProp | test}}
  `,
                    imports: [TestPipe]
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_pipe.d.ts
 ****************************************************************************************************/
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class TestPipe implements PipeTransform {
    transform(value: Function): Function;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<TestPipe, "test", true>;
}
export declare class TestComp {
    componentProp: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_dollar_event.js
 ****************************************************************************************************/
import { Component, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    componentProp = 0;
    result = signal('', ...(ngDevMode ? [{ debugName: "result" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @let topLevelLet = 1;

    @if (true) {
      @let innerLet = 2;

      <button (click)="signal.update(prev => $event.type + prev + innerLet + topLevelLet + componentProp)"></button>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @let topLevelLet = 1;

    @if (true) {
      @let innerLet = 2;

      <button (click)="signal.update(prev => $event.type + prev + innerLet + topLevelLet + componentProp)"></button>
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_dollar_event.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    componentProp: number;
    result: import("@angular/core").WritableSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_loop_variables.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    items = [
        { name: 'one', subItems: ['sub one', 'sub two', 'sub three'] },
        { name: 'two', subItems: ['sub one', 'sub two', 'sub three'] },
        { name: 'three', subItems: ['sub one', 'sub two', 'sub three'] },
    ];
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @for (item of items; track $index; let outerEven = $even) {
      @for (subitem of item.subItems; track $index) {
        {{(() => outerEven || $even || $index)()}}
      }
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (item of items; track $index; let outerEven = $even) {
      @for (subitem of item.subItems; track $index) {
        {{(() => outerEven || $even || $index)()}}
      }
    }
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: arrow_function_loop_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    items: {
        name: string;
        subItems: string[];
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, {}, never, never, true, never>;
}

