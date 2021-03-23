/****************************************************************************************************
 * PARTIAL FILE: directives.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ChildComponent {
}
ChildComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ChildComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ChildComponent, selector: "child", ngImport: i0, template: 'child-view', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ChildComponent, [{
        type: Component,
        args: [{ selector: 'child', template: 'child-view' }]
    }], null, null); })();
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[some-directive]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: '[some-directive]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<child some-directive></child>!', isInline: true, components: [{ type: ChildComponent, selector: "child" }], directives: [{ type: SomeDirective, selector: "[some-directive]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<child some-directive></child>!' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [ChildComponent, SomeDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [ChildComponent, SomeDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: directives.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ChildComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<ChildComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ChildComponent, "child", never, {}, {}, never, never>;
}
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[some-directive]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
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
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "div.foo[some-directive]:not([title]):not(.baz)", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: 'div.foo[some-directive]:not([title]):not(.baz)' }]
    }], null, null); })();
export class OtherDirective {
}
OtherDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
OtherDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: OtherDirective, selector: ":not(span[title]):not(.baz)", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(OtherDirective, [{
        type: Directive,
        args: [{ selector: ':not(span[title]):not(.baz)' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, OtherDirective] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective, OtherDirective] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: complex_selectors.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "div.foo[some-directive]:not([title]):not(.baz)", never, {}, {}, never>;
}
export declare class OtherDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<OtherDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<OtherDirective, ":not(span[title]):not(.baz)", never, {}, {}, never>;
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
SomeComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
SomeComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: SomeComponent, selector: "#my-app", ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeComponent, [{
        type: Component,
        args: [{ selector: '#my-app', template: '' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: id_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SomeComponent, "#my-app", never, {}, {}, never, never>;
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
RouterOutlet.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RouterOutlet, deps: [], target: i0.ɵɵFactoryTarget.Directive });
RouterOutlet.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: RouterOutlet, selector: "router-outlet", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RouterOutlet, [{
        type: Directive,
        args: [{ selector: 'router-outlet' }]
    }], null, null); })();
export class EmptyOutletComponent {
}
EmptyOutletComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: EmptyOutletComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
EmptyOutletComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: EmptyOutletComponent, selector: "ng-component", ngImport: i0, template: '<router-outlet></router-outlet>', isInline: true, directives: [{ type: RouterOutlet, selector: "router-outlet" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(EmptyOutletComponent, [{
        type: Component,
        args: [{ template: '<router-outlet></router-outlet>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [EmptyOutletComponent, RouterOutlet] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [EmptyOutletComponent, RouterOutlet] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: no_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class RouterOutlet {
    static ɵfac: i0.ɵɵFactoryDeclaration<RouterOutlet, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<RouterOutlet, "router-outlet", never, {}, {}, never>;
}
export declare class EmptyOutletComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<EmptyOutletComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EmptyOutletComponent, "ng-component", never, {}, {}, never, never>;
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
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '' }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i0.ChangeDetectorRef }]; }, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

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
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
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
IfDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IfDirective, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
IfDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: IfDirective, selector: "[if]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(IfDirective, [{
        type: Directive,
        args: [{ selector: '[if]' }]
    }], function () { return [{ type: i0.TemplateRef }]; }, null); })();
export class MyComponent {
    constructor() {
        this.salutation = 'Hello';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>', isInline: true, directives: [{ type: IfDirective, selector: "[if]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<ul #foo><li *if>{{salutation}} {{foo}}</li></ul>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [IfDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [IfDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: structural_directives.d.ts
 ****************************************************************************************************/
import { TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class IfDirective {
    constructor(template: TemplateRef<any>);
    static ɵfac: i0.ɵɵFactoryDeclaration<IfDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IfDirective, "[if]", never, {}, {}, never>;
}
export declare class MyComponent {
    salutation: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
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
MyComp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComp, selector: "my-comp", inputs: { names: "names" }, ngImport: i0, template: `
    <p>{{ names[0] }}</p>
    <p>{{ names[1] }}</p>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComp, [{
        type: Component,
        args: [{
                selector: 'my-comp',
                template: `
    <p>{{ names[0] }}</p>
    <p>{{ names[1] }}</p>
  `
            }]
    }], null, { names: [{
            type: Input
        }] }); })();
export class MyApp {
    constructor() {
        this.customName = 'Bess';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
  <my-comp [names]="['Nancy', customName]"></my-comp>
`, isInline: true, components: [{ type: MyComp, selector: "my-comp", inputs: ["names"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `
  <my-comp [names]="['Nancy', customName]"></my-comp>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComp, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComp, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: array_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComp {
    names: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComp, "my-comp", never, { "names": "names"; }, {}, never, never>;
}
export declare class MyApp {
    customName: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
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
MyComp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComp, selector: "my-comp", inputs: { names: "names" }, ngImport: i0, template: `
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
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComp, [{
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
  `
            }]
    }], null, { names: [{
            type: Input
        }] }); })();
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
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
  <my-comp [names]="['start-', n0, n1, n2, n3, n4, '-middle-', n5, n6, n7, n8, '-end']">
  </my-comp>
`, isInline: true, components: [{ type: MyComp, selector: "my-comp", inputs: ["names"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `
  <my-comp [names]="['start-', n0, n1, n2, n3, n4, '-middle-', n5, n6, n7, n8, '-end']">
  </my-comp>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComp, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComp, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: array_literals_many.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComp {
    names: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComp, "my-comp", never, { "names": "names"; }, {}, never, never>;
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
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
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
ObjectComp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ObjectComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
ObjectComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ObjectComp, selector: "object-comp", inputs: { config: "config" }, ngImport: i0, template: `
    <p> {{ config['duration'] }} </p>
    <p> {{ config.animation }} </p>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ObjectComp, [{
        type: Component,
        args: [{
                selector: 'object-comp',
                template: `
    <p> {{ config['duration'] }} </p>
    <p> {{ config.animation }} </p>
  `
            }]
    }], null, { config: [{
            type: Input
        }] }); })();
export class MyApp {
    constructor() {
        this.name = 'slide';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
  <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
`, isInline: true, components: [{ type: ObjectComp, selector: "object-comp", inputs: ["config"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `
  <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [ObjectComp, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [ObjectComp, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: object_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ObjectComp {
    config: {
        [key: string]: any;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<ObjectComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ObjectComp, "object-comp", never, { "config": "config"; }, {}, never, never>;
}
export declare class MyApp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
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
NestedComp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NestedComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
NestedComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: NestedComp, selector: "nested-comp", inputs: { config: "config" }, ngImport: i0, template: `
    <p> {{ config.animation }} </p>
    <p> {{config.actions[0].opacity }} </p>
    <p> {{config.actions[1].duration }} </p>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NestedComp, [{
        type: Component,
        args: [{
                selector: 'nested-comp',
                template: `
    <p> {{ config.animation }} </p>
    <p> {{config.actions[0].opacity }} </p>
    <p> {{config.actions[1].duration }} </p>
  `
            }]
    }], null, { config: [{
            type: Input
        }] }); })();
export class MyApp {
    constructor() {
        this.name = 'slide';
        this.duration = 100;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
  <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1, duration: duration }]}">
  </nested-comp>
`, isInline: true, components: [{ type: NestedComp, selector: "nested-comp", inputs: ["config"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `
  <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1, duration: duration }]}">
  </nested-comp>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [NestedComp, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [NestedComp, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: literal_nested_expression.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class NestedComp {
    config: {
        [key: string]: any;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<NestedComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NestedComp, "nested-comp", never, { "config": "config"; }, {}, never, never>;
}
export declare class MyApp {
    name: string;
    duration: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof NestedComp, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

