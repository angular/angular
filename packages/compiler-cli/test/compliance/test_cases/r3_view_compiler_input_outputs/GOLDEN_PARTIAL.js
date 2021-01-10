/****************************************************************************************************
 * PARTIAL FILE: component.js
 ****************************************************************************************************/
import { Component, Input, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", inputs: { componentInput: "componentInput", originalComponentInput: ["renamedComponentInput", "originalComponentInput"] }, outputs: { componentOutput: "componentOutput", originalComponentOutput: "renamedComponentOutput" }, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '' }]
    }], null, { componentInput: [{
            type: Input
        }], originalComponentInput: [{
            type: Input,
            args: ['renamedComponentInput']
        }], componentOutput: [{
            type: Output
        }], originalComponentOutput: [{
            type: Output,
            args: ['renamedComponentOutput']
        }] }); })();
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
 * PARTIAL FILE: component.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    componentInput: any;
    originalComponentInput: any;
    componentOutput: any;
    originalComponentOutput: any;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, { "componentInput": "componentInput"; "originalComponentInput": "renamedComponentInput"; }, { "componentOutput": "componentOutput"; "originalComponentOutput": "renamedComponentOutput"; }, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: directive.js
 ****************************************************************************************************/
import { Directive, Input, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
}
MyDirective.ɵfac = function MyDirective_Factory(t) { return new (t || MyDirective)(); };
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: MyDirective, selector: "[my-directive]", inputs: { directiveInput: "directiveInput", originalDirectiveInput: ["renamedDirectiveInput", "originalDirectiveInput"] }, outputs: { directiveOutput: "directiveOutput", originalDirectiveOutput: "renamedDirectiveOutput" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyDirective, [{
        type: Directive,
        args: [{ selector: '[my-directive]' }]
    }], null, { directiveInput: [{
            type: Input
        }], originalDirectiveInput: [{
            type: Input,
            args: ['renamedDirectiveInput']
        }], directiveOutput: [{
            type: Output
        }], originalDirectiveOutput: [{
            type: Output,
            args: ['renamedDirectiveOutput']
        }] }); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyDirective] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyDirective] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    directiveInput: any;
    originalDirectiveInput: any;
    directiveOutput: any;
    originalDirectiveOutput: any;
    static ɵfac: i0.ɵɵFactoryDef<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDirective, "[my-directive]", never, { "directiveInput": "directiveInput"; "originalDirectiveInput": "renamedDirectiveInput"; }, { "directiveOutput": "directiveOutput"; "originalDirectiveOutput": "renamedDirectiveOutput"; }, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

