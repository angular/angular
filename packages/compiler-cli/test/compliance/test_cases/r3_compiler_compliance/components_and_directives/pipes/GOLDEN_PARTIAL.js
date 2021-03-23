/****************************************************************************************************
 * PARTIAL FILE: pipes.js
 ****************************************************************************************************/
import { Component, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class MyPipe {
    transform(value, ...args) {
        return value;
    }
    ngOnDestroy() { }
}
MyPipe.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
MyPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, name: "myPipe", pure: false });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyPipe, [{
        type: Pipe,
        args: [{ name: 'myPipe', pure: false }]
    }], null, null); })();
export class MyPurePipe {
    transform(value, ...args) {
        return value;
    }
}
MyPurePipe.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPurePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
MyPurePipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPurePipe, name: "myPurePipe" });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyPurePipe, [{
        type: Pipe,
        args: [{
                name: 'myPurePipe',
                pure: true,
            }]
    }], null, null); })();
export class MyApp {
    constructor() {
        this.name = 'World';
        this.size = 0;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '{{name | myPipe:size | myPurePipe:size }}<p>{{ name | myPipe:1:2:3:4:5 }} {{ name ? 1 : 2 | myPipe }}</p>', isInline: true, pipes: { "myPurePipe": MyPurePipe, "myPipe": MyPipe } });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: '{{name | myPipe:size | myPurePipe:size }}<p>{{ name | myPipe:1:2:3:4:5 }} {{ name ? 1 : 2 | myPipe }}</p>'
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyPipe, MyPurePipe, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyPipe, MyPurePipe, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: pipes.d.ts
 ****************************************************************************************************/
import { OnDestroy, PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyPipe implements PipeTransform, OnDestroy {
    transform(value: any, ...args: any[]): any;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe">;
}
export declare class MyPurePipe implements PipeTransform {
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPurePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPurePipe, "myPurePipe">;
}
export declare class MyApp {
    name: string;
    size: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyPipe, typeof MyPurePipe, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: pipe_invocation.js
 ****************************************************************************************************/
import { Component, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class MyPipe {
    transform(value, ...args) {
        return value;
    }
    ngOnDestroy() { }
}
MyPipe.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
MyPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, name: "myPipe", pure: false });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyPipe, [{
        type: Pipe,
        args: [{ name: 'myPipe', pure: false }]
    }], null, null); })();
export class MyApp {
    constructor() {
        this.name = '';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '0:{{name | myPipe}}1:{{name | myPipe:1}}2:{{name | myPipe:1:2}}3:{{name | myPipe:1:2:3}}4:{{name | myPipe:1:2:3:4}}', isInline: true, pipes: { "myPipe": MyPipe } });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: '0:{{name | myPipe}}1:{{name | myPipe:1}}2:{{name | myPipe:1:2}}3:{{name | myPipe:1:2:3}}4:{{name | myPipe:1:2:3:4}}'
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyPipe, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyPipe, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: pipe_invocation.d.ts
 ****************************************************************************************************/
import { OnDestroy, PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyPipe implements PipeTransform, OnDestroy {
    transform(value: any, ...args: any[]): any;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe">;
}
export declare class MyApp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyPipe, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: pipe_di_change_detector_ref.js
 ****************************************************************************************************/
import { ChangeDetectorRef, Component, NgModule, Optional, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class MyPipe {
    constructor(changeDetectorRef) { }
    transform(value, ...args) {
        return value;
    }
}
MyPipe.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Pipe });
MyPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, name: "myPipe" });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyPipe, [{
        type: Pipe,
        args: [{ name: 'myPipe' }]
    }], function () { return [{ type: i0.ChangeDetectorRef }]; }, null); })();
export class MyOtherPipe {
    constructor(changeDetectorRef) { }
    transform(value, ...args) {
        return value;
    }
}
MyOtherPipe.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, deps: [{ token: i0.ChangeDetectorRef, optional: true }], target: i0.ɵɵFactoryTarget.Pipe });
MyOtherPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, name: "myOtherPipe" });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyOtherPipe, [{
        type: Pipe,
        args: [{ name: 'myOtherPipe' }]
    }], function () { return [{ type: i0.ChangeDetectorRef, decorators: [{
                type: Optional
            }] }]; }, null); })();
export class MyApp {
    constructor() {
        this.name = 'World';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>', isInline: true, pipes: { "myPipe": MyPipe, "myOtherPipe": MyOtherPipe } });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyPipe, MyOtherPipe, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyPipe, MyOtherPipe, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: pipe_di_change_detector_ref.d.ts
 ****************************************************************************************************/
import { ChangeDetectorRef, PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyPipe implements PipeTransform {
    constructor(changeDetectorRef: ChangeDetectorRef);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe">;
}
export declare class MyOtherPipe implements PipeTransform {
    constructor(changeDetectorRef: ChangeDetectorRef);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherPipe, [{ optional: true; }]>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyOtherPipe, "myOtherPipe">;
}
export declare class MyApp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyPipe, typeof MyOtherPipe, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

