/****************************************************************************************************
 * PARTIAL FILE: for_of.js
 ****************************************************************************************************/
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export class ForOfDirective {
    constructor(view, template) {
        this.view = view;
        this.template = template;
    }
    ngOnChanges(simpleChanges) { }
}
ForOfDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForOfDirective, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
ForOfDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: ForOfDirective, selector: "[forOf]", inputs: { forOf: "forOf" }, usesOnChanges: true, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ForOfDirective, [{
        type: Directive,
        args: [{ selector: '[forOf]' }]
    }], function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }]; }, { forOf: [{
            type: Input
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: for_of.d.ts
 ****************************************************************************************************/
import { SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export interface ForOfContext {
    $implicit: any;
    index: number;
    even: boolean;
    odd: boolean;
}
export declare class ForOfDirective {
    private view;
    private template;
    private previous;
    constructor(view: ViewContainerRef, template: TemplateRef<any>);
    forOf: any[];
    ngOnChanges(simpleChanges: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ForOfDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ForOfDirective, "[forOf]", never, { "forOf": "forOf"; }, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: svg_embedded_view.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import { ForOfDirective } from './for_of';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.items = [{ data: 42 }, { data: 42 }];
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `<svg><g *for="let item of items"><circle></circle></g></svg>`, isInline: true, directives: [{ type: i0.forwardRef(function () { return ForOfDirective; }), selector: "[forOf]", inputs: ["forOf"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `<svg><g *for="let item of items"><circle></circle></g></svg>`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, ForOfDirective] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, ForOfDirective] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: svg_embedded_view.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
import * as i1 from "./for_of";
export declare class MyComponent {
    items: {
        data: number;
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof i1.ForOfDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_of.js
 ****************************************************************************************************/
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export class ForOfDirective {
    constructor(view, template) {
        this.view = view;
        this.template = template;
    }
    ngOnChanges(simpleChanges) { }
}
ForOfDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForOfDirective, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
ForOfDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: ForOfDirective, selector: "[forOf]", inputs: { forOf: "forOf" }, usesOnChanges: true, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ForOfDirective, [{
        type: Directive,
        args: [{ selector: '[forOf]' }]
    }], function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }]; }, { forOf: [{
            type: Input
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: for_of.d.ts
 ****************************************************************************************************/
import { SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export interface ForOfContext {
    $implicit: any;
    index: number;
    even: boolean;
    odd: boolean;
}
export declare class ForOfDirective {
    private view;
    private template;
    private previous;
    constructor(view: ViewContainerRef, template: TemplateRef<any>);
    forOf: any[];
    ngOnChanges(simpleChanges: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ForOfDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ForOfDirective, "[forOf]", never, { "forOf": "forOf"; }, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: let_variable_and_reference.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import { ForOfDirective } from './for_of';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.items = [{ name: 'one' }, { name: 'two' }];
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `<ul><li *for="let item of items">{{item.name}}</li></ul>`, isInline: true, directives: [{ type: i0.forwardRef(function () { return ForOfDirective; }), selector: "[forOf]", inputs: ["forOf"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `<ul><li *for="let item of items">{{item.name}}</li></ul>`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, ForOfDirective] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, ForOfDirective] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: let_variable_and_reference.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
import * as i1 from "./for_of";
export declare class MyComponent {
    items: {
        name: string;
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof i1.ForOfDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_of.js
 ****************************************************************************************************/
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export class ForOfDirective {
    constructor(view, template) {
        this.view = view;
        this.template = template;
    }
    ngOnChanges(simpleChanges) { }
}
ForOfDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForOfDirective, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
ForOfDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: ForOfDirective, selector: "[forOf]", inputs: { forOf: "forOf" }, usesOnChanges: true, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ForOfDirective, [{
        type: Directive,
        args: [{ selector: '[forOf]' }]
    }], function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }]; }, { forOf: [{
            type: Input
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: for_of.d.ts
 ****************************************************************************************************/
import { SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export interface ForOfContext {
    $implicit: any;
    index: number;
    even: boolean;
    odd: boolean;
}
export declare class ForOfDirective {
    private view;
    private template;
    private previous;
    constructor(view: ViewContainerRef, template: TemplateRef<any>);
    forOf: any[];
    ngOnChanges(simpleChanges: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ForOfDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ForOfDirective, "[forOf]", never, { "forOf": "forOf"; }, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: parent_template_variable.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import { ForOfDirective } from './for_of';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.items = [
            { name: 'one', infos: [{ description: '11' }, { description: '12' }] },
            { name: 'two', infos: [{ description: '21' }, { description: '22' }] }
        ];
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
  <ul>
    <li *for="let item of items">
      <div>{{item.name}}</div>
      <ul>
        <li *for="let info of item.infos">
          {{item.name}}: {{info.description}}
        </li>
      </ul>
    </li>
  </ul>`, isInline: true, directives: [{ type: i0.forwardRef(function () { return ForOfDirective; }), selector: "[forOf]", inputs: ["forOf"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ul>
    <li *for="let item of items">
      <div>{{item.name}}</div>
      <ul>
        <li *for="let info of item.infos">
          {{item.name}}: {{info.description}}
        </li>
      </ul>
    </li>
  </ul>`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, ForOfDirective] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, ForOfDirective] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: parent_template_variable.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
import * as i1 from "./for_of";
export declare class MyComponent {
    items: {
        name: string;
        infos: {
            description: string;
        }[];
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof i1.ForOfDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: for_of.js
 ****************************************************************************************************/
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export class ForOfDirective {
    constructor(view, template) {
        this.view = view;
        this.template = template;
    }
    ngOnChanges(simpleChanges) { }
}
ForOfDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForOfDirective, deps: [{ token: i0.ViewContainerRef }, { token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
ForOfDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: ForOfDirective, selector: "[forOf]", inputs: { forOf: "forOf" }, usesOnChanges: true, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ForOfDirective, [{
        type: Directive,
        args: [{ selector: '[forOf]' }]
    }], function () { return [{ type: i0.ViewContainerRef }, { type: i0.TemplateRef }]; }, { forOf: [{
            type: Input
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: for_of.d.ts
 ****************************************************************************************************/
import { SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export interface ForOfContext {
    $implicit: any;
    index: number;
    even: boolean;
    odd: boolean;
}
export declare class ForOfDirective {
    private view;
    private template;
    private previous;
    constructor(view: ViewContainerRef, template: TemplateRef<any>);
    forOf: any[];
    ngOnChanges(simpleChanges: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ForOfDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ForOfDirective, "[forOf]", never, { "forOf": "forOf"; }, {}, never>;
}

