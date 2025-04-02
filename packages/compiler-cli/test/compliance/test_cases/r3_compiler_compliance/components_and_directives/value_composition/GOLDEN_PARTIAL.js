/****************************************************************************************************
 * PARTIAL FILE: directives.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ChildComponent {
}
ChildComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ChildComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ChildComponent, isStandalone: false, selector: "child", ngImport: i0, template: 'child-view', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'child', template: 'child-view',
                    standalone: false
                }]
        }] });
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, isStandalone: false, selector: "[some-directive]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[some-directive]',
                    standalone: false
                }]
        }] });
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: '<child some-directive></child>!', isInline: true, dependencies: [{ kind: "component", type: ChildComponent, selector: "child" }, { kind: "directive", type: SomeDirective, selector: "[some-directive]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component', template: '<child some-directive></child>!',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [ChildComponent, SomeDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [ChildComponent, SomeDirective, MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: directives.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ChildComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<ChildComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ChildComponent, "child", never, {}, {}, never, never, false, never>;
}
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[some-directive]", never, {}, {}, never, never, false, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ChildComponent, typeof SomeDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: complex_selectors.js
 ****************************************************************************************************/
import { Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, isStandalone: false, selector: "div.foo[some-directive]:not([title]):not(.baz)", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'div.foo[some-directive]:not([title]):not(.baz)',
                    standalone: false
                }]
        }] });
export class OtherDirective {
}
OtherDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
OtherDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: OtherDirective, isStandalone: false, selector: ":not(span[title]):not(.baz)", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: ':not(span[title]):not(.baz)',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, OtherDirective] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeDirective, OtherDirective] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: complex_selectors.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "div.foo[some-directive]:not([title]):not(.baz)", never, {}, {}, never, never, false, never>;
}
export declare class OtherDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<OtherDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<OtherDirective, ":not(span[title]):not(.baz)", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeDirective, typeof OtherDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: id_selector.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeComponent {
}
SomeComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
SomeComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SomeComponent, isStandalone: false, selector: "#my-app", ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeComponent, decorators: [{
            type: Component,
            args: [{
                    selector: '#my-app', template: '',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: id_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SomeComponent, "#my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: no_selector.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class RouterOutlet {
}
RouterOutlet.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RouterOutlet, deps: [], target: i0.ɵɵFactoryTarget.Directive });
RouterOutlet.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: RouterOutlet, isStandalone: false, selector: "router-outlet", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RouterOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: 'router-outlet',
                    standalone: false
                }]
        }] });
export class EmptyOutletComponent {
}
EmptyOutletComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: EmptyOutletComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
EmptyOutletComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: EmptyOutletComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: '<router-outlet></router-outlet>', isInline: true, dependencies: [{ kind: "directive", type: RouterOutlet, selector: "router-outlet" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: EmptyOutletComponent, decorators: [{
            type: Component,
            args: [{
                    template: '<router-outlet></router-outlet>',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [EmptyOutletComponent, RouterOutlet] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [EmptyOutletComponent, RouterOutlet] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: no_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class RouterOutlet {
    static ɵfac: i0.ɵɵFactoryDeclaration<RouterOutlet, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<RouterOutlet, "router-outlet", never, {}, {}, never, never, false, never>;
}
export declare class EmptyOutletComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<EmptyOutletComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EmptyOutletComponent, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof EmptyOutletComponent, typeof RouterOutlet], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: view_tokens_di.js
 ****************************************************************************************************/
import { ChangeDetectorRef, Component, ElementRef, NgModule, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor(el, vcr, cdr) {
        this.el = el;
        this.vcr = vcr;
        this.cdr = cdr;
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component', template: '',
                    standalone: false
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i0.ChangeDetectorRef }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: view_tokens_di.d.ts
 ****************************************************************************************************/
import { ChangeDetectorRef, ElementRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComponent {
    el: ElementRef;
    vcr: ViewContainerRef;
    cdr: ChangeDetectorRef;
    constructor(el: ElementRef, vcr: ViewContainerRef, cdr: ChangeDetectorRef);
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: structural_directives.js
 ****************************************************************************************************/
import { Component, Directive, NgModule, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export class IfDirective {
    constructor(template) { }
}
IfDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IfDirective, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
IfDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: IfDirective, isStandalone: false, selector: "[if]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IfDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[if]',
                    standalone: false
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });
export class MyComponent {
    constructor() {
        this.salutation = 'Hello';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: '<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>', isInline: true, dependencies: [{ kind: "directive", type: IfDirective, selector: "[if]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component', template: '<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [IfDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [IfDirective, MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: structural_directives.d.ts
 ****************************************************************************************************/
import { TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class IfDirective {
    constructor(template: TemplateRef<any>);
    static ɵfac: i0.ɵɵFactoryDeclaration<IfDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IfDirective, "[if]", never, {}, {}, never, never, false, never>;
}
export declare class MyComponent {
    salutation: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof IfDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: array_literals.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComp {
}
MyComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComp, isStandalone: false, selector: "my-comp", inputs: { names: "names" }, ngImport: i0, template: `
    <p>{{ names[0] }}</p>
    <p>{{ names[1] }}</p>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-comp',
                    template: `
    <p>{{ names[0] }}</p>
    <p>{{ names[1] }}</p>
  `,
                    standalone: false
                }]
        }], propDecorators: { names: [{
                type: Input
            }] } });
export class MyApp {
    constructor() {
        this.customName = 'Bess';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: `
  <my-comp [names]="['Nancy', customName]"></my-comp>
`, isInline: true, dependencies: [{ kind: "component", type: MyComp, selector: "my-comp", inputs: ["names"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
  <my-comp [names]="['Nancy', customName]"></my-comp>
`,
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComp, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComp, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: array_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComp {
    names: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComp, "my-comp", never, { "names": { "alias": "names"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyApp {
    customName: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComp, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: array_literals_many.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComp {
}
MyComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComp, isStandalone: false, selector: "my-comp", inputs: { names: "names" }, ngImport: i0, template: `
    {{ names[0] }}
    {{ names[1] }}
    {{ names[3] }}
    {{ names[4] }}
    {{ names[5] }}
    {{ names[6] }}
    {{ names[7] }}
    {{ names[8] }}
    {{ names[9] }}
    {{ names[10] }}
    {{ names[11] }}
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-comp',
                    template: `
    {{ names[0] }}
    {{ names[1] }}
    {{ names[3] }}
    {{ names[4] }}
    {{ names[5] }}
    {{ names[6] }}
    {{ names[7] }}
    {{ names[8] }}
    {{ names[9] }}
    {{ names[10] }}
    {{ names[11] }}
  `,
                    standalone: false
                }]
        }], propDecorators: { names: [{
                type: Input
            }] } });
export class MyApp {
    constructor() {
        this.n0 = 'a';
        this.n1 = 'b';
        this.n2 = 'c';
        this.n3 = 'd';
        this.n4 = 'e';
        this.n5 = 'f';
        this.n6 = 'g';
        this.n7 = 'h';
        this.n8 = 'i';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: `
  <my-comp [names]="['start-', n0, n1, n2, n3, n4, '-middle-', n5, n6, n7, n8, '-end']">
  </my-comp>
`, isInline: true, dependencies: [{ kind: "component", type: MyComp, selector: "my-comp", inputs: ["names"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
  <my-comp [names]="['start-', n0, n1, n2, n3, n4, '-middle-', n5, n6, n7, n8, '-end']">
  </my-comp>
`,
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComp, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComp, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: array_literals_many.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComp {
    names: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComp, "my-comp", never, { "names": { "alias": "names"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyApp {
    n0: string;
    n1: string;
    n2: string;
    n3: string;
    n4: string;
    n5: string;
    n6: string;
    n7: string;
    n8: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComp, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: object_literals.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ObjectComp {
}
ObjectComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ObjectComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
ObjectComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ObjectComp, isStandalone: false, selector: "object-comp", inputs: { config: "config" }, ngImport: i0, template: `
    <p> {{ config['duration'] }} </p>
    <p> {{ config.animation }} </p>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ObjectComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'object-comp',
                    template: `
    <p> {{ config['duration'] }} </p>
    <p> {{ config.animation }} </p>
  `,
                    standalone: false
                }]
        }], propDecorators: { config: [{
                type: Input
            }] } });
export class MyApp {
    constructor() {
        this.name = 'slide';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: `
  <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
`, isInline: true, dependencies: [{ kind: "component", type: ObjectComp, selector: "object-comp", inputs: ["config"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
  <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
`,
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [ObjectComp, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [ObjectComp, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: object_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ObjectComp {
    config: {
        [key: string]: any;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<ObjectComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ObjectComp, "object-comp", never, { "config": { "alias": "config"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyApp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ObjectComp, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: literal_nested_expression.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class NestedComp {
}
NestedComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NestedComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
NestedComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: NestedComp, isStandalone: false, selector: "nested-comp", inputs: { config: "config" }, ngImport: i0, template: `
    <p> {{ config.animation }} </p>
    <p> {{config.actions[0].opacity }} </p>
    <p> {{config.actions[1].duration }} </p>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NestedComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'nested-comp',
                    template: `
    <p> {{ config.animation }} </p>
    <p> {{config.actions[0].opacity }} </p>
    <p> {{config.actions[1].duration }} </p>
  `,
                    standalone: false
                }]
        }], propDecorators: { config: [{
                type: Input
            }] } });
export class MyApp {
    constructor() {
        this.name = 'slide';
        this.duration = 100;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: `
  <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1, duration: duration }]}">
  </nested-comp>
`, isInline: true, dependencies: [{ kind: "component", type: NestedComp, selector: "nested-comp", inputs: ["config"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
  <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1, duration: duration }]}">
  </nested-comp>
`,
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [NestedComp, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [NestedComp, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: literal_nested_expression.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class NestedComp {
    config: {
        [key: string]: any;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<NestedComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NestedComp, "nested-comp", never, { "config": { "alias": "config"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyApp {
    name: string;
    duration: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof NestedComp, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: number_separator.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.multiplier = 5;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: `
    <div>Total: \${{ 1_000_000 * multiplier }}</div>
    <span>Remaining: \${{ 123_456.78_9 / 2 }}</span>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
    <div>Total: \${{ 1_000_000 * multiplier }}</div>
    <span>Remaining: \${{ 123_456.78_9 / 2 }}</span>
  `,
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: number_separator.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    multiplier: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: template_literals.js
 ****************************************************************************************************/
import { Component, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class UppercasePipe {
    transform(value) {
        return value.toUpperCase();
    }
}
UppercasePipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: UppercasePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
UppercasePipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: UppercasePipe, isStandalone: true, name: "uppercase" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: UppercasePipe, decorators: [{
            type: Pipe,
            args: [{ name: 'uppercase' }]
        }] });
export class MyApp {
    constructor() {
        this.name = 'Frodo';
        this.timeOfDay = 'morning';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "my-app", ngImport: i0, template: `
    <div>No interpolations: {{ \`hello world \` }}</div>
    <span>With interpolations: {{ \`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
    <p>With pipe: {{\`hello \${name}\` | uppercase}}</p>
    <h4>@let insideLet = \`Hello \${name}\`; Inside let: {{insideLet}}</h4>
  `, isInline: true, dependencies: [{ kind: "pipe", type: UppercasePipe, name: "uppercase" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
    <div>No interpolations: {{ \`hello world \` }}</div>
    <span>With interpolations: {{ \`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
    <p>With pipe: {{\`hello \${name}\` | uppercase}}</p>
    <h4>@let insideLet = \`Hello \${name}\`; Inside let: {{insideLet}}</h4>
  `,
                    imports: [UppercasePipe],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: template_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class UppercasePipe {
    transform(value: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<UppercasePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<UppercasePipe, "uppercase", true>;
}
export declare class MyApp {
    name: string;
    timeOfDay: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: tagged_template_literals.js
 ****************************************************************************************************/
import { Component, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class UppercasePipe {
    transform(value) {
        return value.toUpperCase();
    }
}
UppercasePipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: UppercasePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
UppercasePipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: UppercasePipe, isStandalone: true, name: "uppercase" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: UppercasePipe, decorators: [{
            type: Pipe,
            args: [{ name: 'uppercase' }]
        }] });
export class MyApp {
    constructor() {
        this.name = 'Frodo';
        this.timeOfDay = 'morning';
        this.tag = (strings, ...args) => '';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "my-app", ngImport: i0, template: `
    <div>No interpolations: {{ tag\`hello world \` }}</div>
    <span>With interpolations: {{ tag\`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
    <p>With pipe: {{ tag\`hello \${name}\` | uppercase }}</p>
  `, isInline: true, dependencies: [{ kind: "pipe", type: UppercasePipe, name: "uppercase" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
    <div>No interpolations: {{ tag\`hello world \` }}</div>
    <span>With interpolations: {{ tag\`hello \${name}, it is currently \${timeOfDay}!\` }}</span>
    <p>With pipe: {{ tag\`hello \${name}\` | uppercase }}</p>
  `,
                    imports: [UppercasePipe],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: tagged_template_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class UppercasePipe {
    transform(value: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<UppercasePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<UppercasePipe, "uppercase", true>;
}
export declare class MyApp {
    name: string;
    timeOfDay: string;
    tag: (strings: TemplateStringsArray, ...args: string[]) => string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, true, never>;
}

