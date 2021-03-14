/****************************************************************************************************
 * PARTIAL FILE: component.js
 ****************************************************************************************************/
import { Component, Input, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
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
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
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
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, { "componentInput": "componentInput"; "originalComponentInput": "renamedComponentInput"; }, { "componentOutput": "componentOutput"; "originalComponentOutput": "renamedComponentOutput"; }, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: directive.js
 ****************************************************************************************************/
import { Directive, Input, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
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
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyDirective] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
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
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-directive]", never, { "directiveInput": "directiveInput"; "originalDirectiveInput": "renamedDirectiveInput"; }, { "directiveOutput": "directiveOutput"; "originalDirectiveOutput": "renamedDirectiveOutput"; }, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

