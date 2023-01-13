/****************************************************************************************************
 * PARTIAL FILE: svg.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div class="my-app" title="Hello"><svg><circle cx="20" cy="30" r="50"/></svg><p>test</p></div>', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '<div class="my-app" title="Hello"><svg><circle cx="20" cy="30" r="50"/></svg><p>test</p></div>'
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: svg.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: svg_embedded_view.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
    constructor() {
        this.condition = true;
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <svg>
      <ng-template [ngIf]="condition">
        <text>Hello</text>
      </ng-template>
    </svg>
  `, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <svg>
      <ng-template [ngIf]="condition">
        <text>Hello</text>
      </ng-template>
    </svg>
  `
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: svg_embedded_view.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    condition: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: mathml.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MathCmp {
}
MathCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MathCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MathCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MathCmp, selector: "math", ngImport: i0, template: '', isInline: true });
export { MathCmp };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MathCmp, decorators: [{
            type: Component,
            args: [{ selector: 'math', template: '' }]
        }] });
class InfinityCmp {
}
InfinityCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: InfinityCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
InfinityCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: InfinityCmp, selector: "infinity", ngImport: i0, template: '', isInline: true });
export { InfinityCmp };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: InfinityCmp, decorators: [{
            type: Component,
            args: [{ selector: 'infinity', template: '' }]
        }] });
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div class="my-app" title="Hello"><math><infinity/></math><p>test</p></div>', isInline: true, dependencies: [{ kind: "component", type: MathCmp, selector: "math" }, { kind: "component", type: InfinityCmp, selector: "infinity" }] });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '<div class="my-app" title="Hello"><math><infinity/></math><p>test</p></div>'
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, MathCmp, InfinityCmp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent, MathCmp, InfinityCmp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: mathml.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MathCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MathCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MathCmp, "math", never, {}, {}, never, never, false, never>;
}
export declare class InfinityCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<InfinityCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<InfinityCmp, "infinity", never, {}, {}, never, never, false, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof MathCmp, typeof InfinityCmp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: dom.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div class="my-app" title="Hello">Hello <b>World</b>!</div>', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '<div class="my-app" title="Hello">Hello <b>World</b>!</div>'
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: dom.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: namespace.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div xmlns:foo="http://someuri/foo" class="my-app" foo:bar="baz" title="Hello" foo:qux="quacks">Hello <b>World</b>!</div>', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '<div xmlns:foo="http://someuri/foo" class="my-app" foo:bar="baz" title="Hello" foo:qux="quacks">Hello <b>World</b>!</div>'
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: namespace.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng-container.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<ng-container><span>in a </span>container</ng-container>', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '<ng-container><span>in a </span>container</ng-container>'
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng-container.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: empty_ng-container.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<ng-container></ng-container>', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{ selector: 'my-component', template: '<ng-container></ng-container>' }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: empty_ng-container.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: properties.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
    constructor() {
        this.id = 'one';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div [id]="id"></div>', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{ selector: 'my-component', template: '<div [id]="id"></div>' }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: properties.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    id: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: property_pure_functions.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
class DivDir {
}
DivDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DivDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DivDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DivDir, selector: "div", inputs: { ternary: "ternary", pipe: "pipe", and: "and", or: "or" }, ngImport: i0 });
export { DivDir };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DivDir, decorators: [{
            type: Directive,
            args: [{ selector: 'div' }]
        }], propDecorators: { ternary: [{
                type: Input
            }], pipe: [{
                type: Input
            }], and: [{
                type: Input
            }], or: [{
                type: Input
            }] } });
class PipePipe {
    transform(v, a, a2) { }
}
PipePipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
PipePipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipePipe, name: "pipe" });
export { PipePipe };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipePipe, decorators: [{
            type: Pipe,
            args: [{ name: 'pipe' }]
        }] });
class MyComponent {
    constructor() {
        this.id = 'one';
        this.cond = '';
        this.value = '';
        this.a = '';
        this.b = '';
        this.c = '';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `<div
    [ternary]="cond ? [a] : [0]"
    [pipe]="value | pipe:1:2"
    [and]="cond && [b]"
    [or]="cond || [c]"
  ></div>`, isInline: true, dependencies: [{ kind: "directive", type: DivDir, selector: "div", inputs: ["ternary", "pipe", "and", "or"] }, { kind: "pipe", type: PipePipe, name: "pipe" }] });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `<div
    [ternary]="cond ? [a] : [0]"
    [pipe]="value | pipe:1:2"
    [and]="cond && [b]"
    [or]="cond || [c]"
  ></div>`
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, DivDir, PipePipe] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent, DivDir, PipePipe] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: property_pure_functions.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DivDir {
    ternary: any;
    pipe: any;
    and: any;
    or: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<DivDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DivDir, "div", never, { "ternary": { "alias": "ternary"; "required": false; }; "pipe": { "alias": "pipe"; "required": false; }; "and": { "alias": "and"; "required": false; }; "or": { "alias": "or"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class PipePipe {
    transform(v: any, a: any, a2: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PipePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PipePipe, "pipe", false>;
}
export declare class MyComponent {
    id: string;
    cond: string;
    value: string;
    a: string;
    b: string;
    c: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof DivDir, typeof PipePipe], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_binding_pure_functions.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
    getExpandedState() {
        return 'expanded';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", inputs: { expandedHeight: "expandedHeight", collapsedHeight: "collapsedHeight", expandedWidth: "expandedWidth", collapsedWidth: "collapsedWidth" }, host: { properties: { "@expansionHeight": "{\n        value: getExpandedState(),\n        params: {\n          collapsedHeight: collapsedHeight,\n          expandedHeight: expandedHeight\n        }\n    }", "@expansionWidth": "{\n      value: getExpandedState(),\n      params: {\n        collapsedWidth: collapsedWidth,\n        expandedWidth: expandedWidth\n      }\n    }" } }, ngImport: i0, template: '...', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '...',
                    host: {
                        '[@expansionHeight]': `{
        value: getExpandedState(),
        params: {
          collapsedHeight: collapsedHeight,
          expandedHeight: expandedHeight
        }
    }`,
                        '[@expansionWidth]': `{
      value: getExpandedState(),
      params: {
        collapsedWidth: collapsedWidth,
        expandedWidth: expandedWidth
      }
    }`
                    }
                }]
        }], propDecorators: { expandedHeight: [{
                type: Input
            }], collapsedHeight: [{
                type: Input
            }], expandedWidth: [{
                type: Input
            }], collapsedWidth: [{
                type: Input
            }] } });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_binding_pure_functions.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    expandedHeight: string;
    collapsedHeight: string;
    expandedWidth: string;
    collapsedWidth: string;
    getExpandedState(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, { "expandedHeight": { "alias": "expandedHeight"; "required": false; }; "collapsedHeight": { "alias": "collapsedHeight"; "required": false; }; "expandedWidth": { "alias": "expandedWidth"; "required": false; }; "collapsedWidth": { "alias": "collapsedWidth"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_style_bindings.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
    constructor() {
        this.error = true;
        this.color = 'red';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div [class.error]="error" [style.background-color]="color"></div>', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '<div [class.error]="error" [style.background-color]="color"></div>'
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_style_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    error: boolean;
    color: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: deduplicate_attributes.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div title="hi"></div>
    <span title="hi"></span>
  `, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div title="hi"></div>
    <span title="hi"></span>
  `
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: deduplicate_attributes.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: security_sensitive_constant_attributes.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <!-- A couple of security-sensitive attributes with constant values -->
    <embed src="https://angular.io/" />
    <iframe srcdoc="<h1>Angular</h1>"></iframe>
    <object data="https://angular.io/" codebase="/"></object>

    <!-- Repeated element to make sure attribute deduplication works properly -->
    <embed src="https://angular.io/" />

    <!-- Another element with a src attribute that is not security sensitive -->
    <img src="https://angular.io/" />
  `, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <!-- A couple of security-sensitive attributes with constant values -->
    <embed src="https://angular.io/" />
    <iframe srcdoc="<h1>Angular</h1>"></iframe>
    <object data="https://angular.io/" codebase="/"></object>

    <!-- Repeated element to make sure attribute deduplication works properly -->
    <embed src="https://angular.io/" />

    <!-- Another element with a src attribute that is not security sensitive -->
    <img src="https://angular.io/" />
  `
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: security_sensitive_constant_attributes.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

