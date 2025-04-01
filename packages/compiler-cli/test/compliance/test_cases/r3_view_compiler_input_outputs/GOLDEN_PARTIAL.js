/****************************************************************************************************
 * PARTIAL FILE: component.js
 ****************************************************************************************************/
import { Component, Input, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", inputs: { componentInput: "componentInput", originalComponentInput: ["renamedComponentInput", "originalComponentInput"] }, outputs: { componentOutput: "componentOutput", originalComponentOutput: "renamedComponentOutput" }, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component', template: '',
                    standalone: false
                }]
        }], propDecorators: { componentInput: [{
                type: Input
            }], originalComponentInput: [{
                type: Input,
                args: ['renamedComponentInput']
            }], componentOutput: [{
                type: Output
            }], originalComponentOutput: [{
                type: Output,
                args: ['renamedComponentOutput']
            }] } });
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
 * PARTIAL FILE: component.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    componentInput: any;
    originalComponentInput: any;
    componentOutput: any;
    originalComponentOutput: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, { "componentInput": { "alias": "componentInput"; "required": false; }; "originalComponentInput": { "alias": "renamedComponentInput"; "required": false; }; }, { "componentOutput": "componentOutput"; "originalComponentOutput": "renamedComponentOutput"; }, never, never, false, never>;
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
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, isStandalone: false, selector: "[my-directive]", inputs: { directiveInput: "directiveInput", originalDirectiveInput: ["renamedDirectiveInput", "originalDirectiveInput"] }, outputs: { directiveOutput: "directiveOutput", originalDirectiveOutput: "renamedDirectiveOutput" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-directive]',
                    standalone: false
                }]
        }], propDecorators: { directiveInput: [{
                type: Input
            }], originalDirectiveInput: [{
                type: Input,
                args: ['renamedDirectiveInput']
            }], directiveOutput: [{
                type: Output
            }], originalDirectiveOutput: [{
                type: Output,
                args: ['renamedDirectiveOutput']
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyDirective] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyDirective] }]
        }] });

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
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-directive]", never, { "directiveInput": { "alias": "directiveInput"; "required": false; }; "originalDirectiveInput": { "alias": "renamedDirectiveInput"; "required": false; }; }, { "directiveOutput": "directiveOutput"; "originalDirectiveOutput": "renamedDirectiveOutput"; }, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: input_transform.js
 ****************************************************************************************************/
import { Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function toNumber(value) {
    return value ? 1 : 0;
}
export class MyDirective {
}
MyDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, isStandalone: false, selector: "[my-directive]", inputs: { functionDeclarationInput: ["functionDeclarationInput", "functionDeclarationInput", toNumber], inlineFunctionInput: ["inlineFunctionInput", "inlineFunctionInput", (value, _) => value ? 1 : 0] }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-directive]',
                    standalone: false
                }]
        }], propDecorators: { functionDeclarationInput: [{
                type: Input,
                args: [{ transform: toNumber }]
            }], inlineFunctionInput: [{
                type: Input,
                args: [{ transform: (value, _) => value ? 1 : 0 }]
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyDirective] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyDirective] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: input_transform.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    functionDeclarationInput: any;
    inlineFunctionInput: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-directive]", never, { "functionDeclarationInput": { "alias": "functionDeclarationInput"; "required": false; }; "inlineFunctionInput": { "alias": "inlineFunctionInput"; "required": false; }; }, {}, never, never, false, never>;
    static ngAcceptInputType_functionDeclarationInput: number | string;
    static ngAcceptInputType_inlineFunctionInput: string | number;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

