/****************************************************************************************************
 * PARTIAL FILE: bind.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.title = 'Hello World';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-app", ngImport: i0, template: '<a [title]="title"></a>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-app', template: '<a [title]="title"></a>' }]
    }], null, null); })();
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
 * PARTIAL FILE: bind.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    title: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolation.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.name = 'World';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <a title="Hello {{name}}"></a>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <a title="Hello {{name}}"></a>`
            }]
    }], null, null); })();
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
 * PARTIAL FILE: interpolation.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolated_properties.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.name = 'John Doe';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-app", ngImport: i0, template: `
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
    <div title="a{{one}}b{{two}}c{{three}}d"></div>
    <div title="a{{one}}b{{two}}c"></div>
    <div title="a{{one}}b"></div>
    <div title="{{one}}"></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
    <div title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
    <div title="a{{one}}b{{two}}c{{three}}d"></div>
    <div title="a{{one}}b{{two}}c"></div>
    <div title="a{{one}}b"></div>
    <div title="{{one}}"></div>
  `
            }]
    }], null, null); })();
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
 * PARTIAL FILE: interpolated_properties.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    name: string;
    one: any;
    two: any;
    three: any;
    four: any;
    five: any;
    six: any;
    seven: any;
    eight: any;
    nine: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: special_property_remapping.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.forValue = 'some-input';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <label [for]="forValue"></label>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <label [for]="forValue"></label>`
            }]
    }], null, null); })();
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
 * PARTIAL FILE: special_property_remapping.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    forValue: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: temporary_variables.js
 ****************************************************************************************************/
import { Component, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class AsyncPipe {
    transform(v) { }
}
AsyncPipe.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AsyncPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
AsyncPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AsyncPipe, name: "async" });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AsyncPipe, [{
        type: Pipe,
        args: [{ name: 'async' }]
    }], null, null); })();
// https://github.com/angular/angular/issues/37194
// Verifies that temporary expressions used for expressions with potential side-effects in
// the LHS of a safe navigation access are emitted within the binding expression itself, to
// ensure that these temporaries are evaluated during the evaluation of the binding. This
// is important for when the LHS contains a pipe, as pipe evaluation depends on the current
// binding index.
export class MyComponent {
    constructor() {
        this.myTitle = 'hello';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: '<button [title]="myTitle" [id]="(auth().identity() | async)?.id" [tabindex]="1"></button>', isInline: true, pipes: { "async": AsyncPipe } });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: '<button [title]="myTitle" [id]="(auth().identity() | async)?.id" [tabindex]="1"></button>'
            }]
    }], null, null); })();
export class MyMod {
}
MyMod.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyMod.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [MyComponent, AsyncPipe] });
MyMod.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyMod, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, AsyncPipe] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: temporary_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class AsyncPipe {
    transform(v: any): null | any;
    static ɵfac: i0.ɵɵFactoryDeclaration<AsyncPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<AsyncPipe, "async">;
}
export declare class MyComponent {
    myTitle: string;
    auth: () => {
        identity(): any;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never>;
}
export declare class MyMod {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof MyComponent, typeof AsyncPipe], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.myTitle = 'hello';
        this.buttonId = 'special-button';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: '<button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ template: '<button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>' }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    myTitle: string;
    buttonId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_mixed.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ButtonDir {
}
ButtonDir.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ButtonDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
ButtonDir.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: ButtonDir, selector: "button", inputs: { al: ["aria-label", "al"] }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ButtonDir, [{
        type: Directive,
        args: [{ selector: 'button' }]
    }], null, { al: [{
            type: Input,
            args: ['aria-label']
        }] }); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: '<button [title]="1" [attr.id]="2" [tabindex]="3" aria-label="{{1 + 3}}"></button>', isInline: true, directives: [{ type: ButtonDir, selector: "button", inputs: ["aria-label"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ template: '<button [title]="1" [attr.id]="2" [tabindex]="3" aria-label="{{1 + 3}}"></button>' }]
    }], null, null); })();
export class MyMod {
}
MyMod.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyMod.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [ButtonDir, MyComponent] });
MyMod.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyMod, [{
        type: NgModule,
        args: [{ declarations: [ButtonDir, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_mixed.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ButtonDir {
    al: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<ButtonDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ButtonDir, "button", never, { "al": "aria-label"; }, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never>;
}
export declare class MyMod {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof ButtonDir, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_bindings_with_interpolations.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ButtonDir {
}
ButtonDir.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ButtonDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
ButtonDir.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: ButtonDir, selector: "button", inputs: { al: ["aria-label", "al"] }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ButtonDir, [{
        type: Directive,
        args: [{ selector: 'button' }]
    }], null, { al: [{
            type: Input,
            args: ['aria-label']
        }] }); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: '<button [title]="1" [id]="2" tabindex="{{0 + 3}}" aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>', isInline: true, directives: [{ type: ButtonDir, selector: "button", inputs: ["aria-label"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: '<button [title]="1" [id]="2" tabindex="{{0 + 3}}" aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>'
            }]
    }], null, null); })();
export class MyMod {
}
MyMod.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyMod.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [ButtonDir, MyComponent] });
MyMod.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyMod, [{
        type: NgModule,
        args: [{ declarations: [ButtonDir, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_bindings_with_interpolations.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ButtonDir {
    al: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<ButtonDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ButtonDir, "button", never, { "al": "aria-label"; }, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never>;
}
export declare class MyMod {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof ButtonDir, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.expansionState = 'expanded';
        this.myTitle = '';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <button
      [title]="myTitle"
      [@expand]="expansionState"
      [tabindex]="1"
      [@fade]="'out'"></button>
    `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: `
    <button
      [title]="myTitle"
      [@expand]="expansionState"
      [tabindex]="1"
      [@fade]="'out'"></button>
    `
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    expansionState: string;
    myTitle: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_ngtemplate_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.myTitle = 'hello';
        this.buttonId = 'custom-id';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: '<ng-template [title]="myTitle" [id]="buttonId" [tabindex]="1"></ng-template>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ template: '<ng-template [title]="myTitle" [id]="buttonId" [tabindex]="1"></ng-template>' }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_ngtemplate_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    myTitle: string;
    buttonId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_for_multiple_elements.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SpanDir {
}
SpanDir.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SpanDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SpanDir.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SpanDir, selector: "span", inputs: { someProp: "someProp" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SpanDir, [{
        type: Directive,
        args: [{ selector: 'span' }]
    }], null, { someProp: [{
            type: Input
        }] }); })();
export class CustomEl {
}
CustomEl.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CustomEl, deps: [], target: i0.ɵɵFactoryTarget.Component });
CustomEl.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: CustomEl, selector: "custom-element", inputs: { prop: "prop", otherProp: "otherProp" }, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CustomEl, [{
        type: Component,
        args: [{ selector: 'custom-element', template: '' }]
    }], null, { prop: [{
            type: Input
        }], otherProp: [{
            type: Input
        }] }); })();
export class MyComponent {
    constructor() {
        this.myTitle = 'hello';
        this.buttonId = 'special-button';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>
    <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    <custom-element [prop]="'one'" [otherProp]="2"></custom-element>
  `, isInline: true, components: [{ type: CustomEl, selector: "custom-element", inputs: ["prop", "otherProp"] }], directives: [{ type: SpanDir, selector: "span", inputs: ["someProp"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: `
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1"></button>
    <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    <custom-element [prop]="'one'" [otherProp]="2"></custom-element>
  `
            }]
    }], null, null); })();
export class MyMod {
}
MyMod.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyMod.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [MyComponent, CustomEl, SpanDir] });
MyMod.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyMod, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, CustomEl, SpanDir] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_for_multiple_elements.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SpanDir {
    someProp: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<SpanDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SpanDir, "span", never, { "someProp": "someProp"; }, {}, never>;
}
export declare class CustomEl {
    prop: any;
    otherProp: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<CustomEl, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CustomEl, "custom-element", never, { "prop": "prop"; "otherProp": "otherProp"; }, {}, never, never>;
}
export declare class MyComponent {
    myTitle: string;
    buttonId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never>;
}
export declare class MyMod {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof MyComponent, typeof CustomEl, typeof SpanDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_with_child_elements.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SpanDir {
}
SpanDir.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SpanDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SpanDir.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SpanDir, selector: "span", inputs: { someProp: "someProp" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SpanDir, [{
        type: Directive,
        args: [{ selector: 'span' }]
    }], null, { someProp: [{
            type: Input
        }] }); })();
export class MyComponent {
    constructor() {
        this.myTitle = 'hello';
        this.buttonId = 'special-button';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1">
      <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    </button>`, isInline: true, directives: [{ type: SpanDir, selector: "span", inputs: ["someProp"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: `
    <button [title]="myTitle" [id]="buttonId" [tabindex]="1">
      <span [id]="1" [title]="'hello'" [someProp]="1 + 2"></span>
    </button>`
            }]
    }], null, null); })();
export class MyMod {
}
MyMod.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyMod.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [MyComponent, SpanDir] });
MyMod.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyMod, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, SpanDir] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_with_child_elements.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SpanDir {
    someProp: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<SpanDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SpanDir, "span", never, { "someProp": "someProp"; }, {}, never>;
}
export declare class MyComponent {
    myTitle: string;
    buttonId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never>;
}
export declare class MyMod {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof MyComponent, typeof SpanDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyMod>;
}

