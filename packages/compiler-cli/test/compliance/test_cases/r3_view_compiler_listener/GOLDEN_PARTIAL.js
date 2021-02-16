/****************************************************************************************************
 * PARTIAL FILE: element_listener.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    onClick(event) { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `<div (click)="onClick($event); 1 == 1"></div>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: `<div (click)="onClick($event); 1 == 1"></div>` }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: element_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    onClick(event: any): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: component_listener.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `<div>My App</div>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: `<div>My App</div>` }]
    }], null, null); })();
export class MyComponent {
    onClick(event) { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `<my-app (click)="onClick($event);"></my-app>`, isInline: true, directives: [{ type: MyApp, selector: "my-app" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: `<my-app (click)="onClick($event);"></my-app>` }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, MyApp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: component_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyComponent {
    onClick(event: any): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: shared_snapshot_listeners.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    onClick(name) { }
    onClick2(name) { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div *ngIf="showing">
      <div (click)="onClick(foo)"></div>
      <button (click)="onClick2(bar)"></button>
    </div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <div *ngIf="showing">
      <div (click)="onClick(foo)"></div>
      <button (click)="onClick2(bar)"></button>
    </div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: shared_snapshot_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    onClick(name: any): void;
    onClick2(name: any): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: local_ref_before_listener.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    onClick(v) { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <button (click)="onClick(user.value)">Save</button>
    <input #user>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <button (click)="onClick(user.value)">Save</button>
    <input #user>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: local_ref_before_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    onClick(v: any): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: same_element_chained_listeners.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    click() { }
    change() { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `<div (click)="click()" (change)="change()"></div>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `<div (click)="click()" (change)="change()"></div>`,
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: same_element_chained_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    click(): void;
    change(): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: cross_element_chained_listeners.js
 ****************************************************************************************************/
import { Component, EventEmitter, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeComp {
    constructor() {
        this.update = new EventEmitter();
        this.delete = new EventEmitter();
    }
}
SomeComp.ɵfac = function SomeComp_Factory(t) { return new (t || SomeComp)(); };
SomeComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: SomeComp, selector: "some-comp", outputs: { update: "update", delete: "delete" }, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeComp, [{
        type: Component,
        args: [{
                selector: 'some-comp',
                template: '',
            }]
    }], null, { update: [{
            type: Output
        }], delete: [{
            type: Output
        }] }); })();
export class MyComponent {
    click() { }
    change() { }
    delete() { }
    update() { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
      <div (click)="click()" (change)="change()"></div>
      <some-comp (update)="update()" (delete)="delete()"></some-comp>
    `, isInline: true, directives: [{ type: SomeComp, selector: "some-comp", outputs: ["update", "delete"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
      <div (click)="click()" (change)="change()"></div>
      <some-comp (update)="update()" (delete)="delete()"></some-comp>
    `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, SomeComp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, SomeComp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: cross_element_chained_listeners.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class SomeComp {
    update: EventEmitter<any>;
    delete: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDef<SomeComp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<SomeComp, "some-comp", never, {}, { "update": "update"; "delete": "delete"; }, never, never>;
}
export declare class MyComponent {
    click(): void;
    change(): void;
    delete(): void;
    update(): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent, typeof SomeComp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: template_chained_listeners.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `<ng-template (click)="click()" (change)="change()"></ng-template>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `<ng-template (click)="click()" (change)="change()"></ng-template>`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: template_chained_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: no_event_arg_listener.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    onClick() { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `<div (click)="onClick();"></div>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ template: `<div (click)="onClick();"></div>` }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: no_event_arg_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    onClick(): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: no_event_arg_host_listener.js
 ****************************************************************************************************/
import { Component, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    mousedown() { }
    click() {
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", host: { listeners: { "mousedown": "mousedown()", "click": "click()" } }, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: '',
                host: {
                    '(mousedown)': 'mousedown()',
                }
            }]
    }], null, { click: [{
            type: HostListener,
            args: ['click']
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: no_event_arg_host_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    mousedown(): void;
    click(): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: has_event_arg_host_listener.js
 ****************************************************************************************************/
import { Directive, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    click(target) {
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: MyComponent, host: { listeners: { "click": "click($event.target)" } }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Directive
    }], null, { click: [{
            type: HostListener,
            args: ['click', ['$event.target']]
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: has_event_arg_host_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    click(target: any): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyComponent, never, never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: event_arg_listener_implicit_meaning.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class Comp {
    c(event) { }
}
Comp.ɵfac = function Comp_Factory(t) { return new (t || Comp)(); };
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: Comp, selector: "ng-component", ngImport: i0, template: '<div (click)="c($event)"></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Comp, [{
        type: Component,
        args: [{ template: '<div (click)="c($event)"></div>' }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: event_arg_listener_implicit_meaning.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: event_explicit_access.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class Comp {
    constructor() {
        this.$event = {};
    }
    c(value) { }
}
Comp.ɵfac = function Comp_Factory(t) { return new (t || Comp)(); };
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: Comp, selector: "ng-component", ngImport: i0, template: '<div (click)="c(this.$event)"></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Comp, [{
        type: Component,
        args: [{ template: '<div (click)="c(this.$event)"></div>' }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: event_explicit_access.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: event_in_property_binding.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class DivDir {
}
DivDir.ɵfac = function DivDir_Factory(t) { return new (t || DivDir)(); };
DivDir.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: DivDir, selector: "div", inputs: { event: "event" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DivDir, [{
        type: Directive,
        args: [{ selector: 'div' }]
    }], null, { event: [{
            type: Input
        }] }); })();
class Comp {
    constructor() {
        this.$event = 1;
    }
}
Comp.ɵfac = function Comp_Factory(t) { return new (t || Comp)(); };
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: Comp, selector: "ng-component", ngImport: i0, template: '<div [event]="$event"></div>', isInline: true, directives: [{ type: DivDir, selector: "div", inputs: ["event"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Comp, [{
        type: Component,
        args: [{ template: '<div [event]="$event"></div>' }]
    }], null, null); })();
export class MyMod {
}
MyMod.ɵmod = i0.ɵɵdefineNgModule({ type: MyMod });
MyMod.ɵinj = i0.ɵɵdefineInjector({ factory: function MyMod_Factory(t) { return new (t || MyMod)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyMod, { declarations: [Comp, DivDir] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyMod, [{
        type: NgModule,
        args: [{ declarations: [Comp, DivDir] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: event_in_property_binding.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DivDir {
    event: any;
    static ɵfac: i0.ɵɵFactoryDef<DivDir, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<DivDir, "div", never, { "event": "event"; }, {}, never>;
}
export declare class MyMod {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyMod, [typeof Comp, typeof DivDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: event_arg_host_listener_implicit_meaning.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
class Dir {
    c(event) { }
}
Dir.ɵfac = function Dir_Factory(t) { return new (t || Dir)(); };
Dir.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: Dir, host: { listeners: { "click": "c($event)" } }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Dir, [{
        type: Directive,
        args: [{ host: { '(click)': 'c($event)' } }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: event_arg_host_listener_implicit_meaning.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: event_host_explicit_access.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
class Dir {
    constructor() {
        this.$event = {};
    }
    c(value) { }
}
Dir.ɵfac = function Dir_Factory(t) { return new (t || Dir)(); };
Dir.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: Dir, host: { listeners: { "click": "c(this.$event)" } }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Dir, [{
        type: Directive,
        args: [{
                host: {
                    '(click)': 'c(this.$event)',
                }
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: event_host_explicit_access.d.ts
 ****************************************************************************************************/
export {};

