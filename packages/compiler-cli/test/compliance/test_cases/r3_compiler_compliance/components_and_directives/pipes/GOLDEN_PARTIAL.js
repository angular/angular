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
MyPipe.ɵfac = function MyPipe_Factory(t) { return new (t || MyPipe)(); };
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
MyPurePipe.ɵfac = function MyPurePipe_Factory(t) { return new (t || MyPurePipe)(); };
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
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
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
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyPurePipe, MyApp] }); })();
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
    static ɵfac: i0.ɵɵFactoryDef<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<MyPipe, "myPipe">;
}
export declare class MyPurePipe implements PipeTransform {
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDef<MyPurePipe, never>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<MyPurePipe, "myPurePipe">;
}
export declare class MyApp {
    name: string;
    size: number;
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyPipe, typeof MyPurePipe, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
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
MyPipe.ɵfac = function MyPipe_Factory(t) { return new (t || MyPipe)(); };
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
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
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
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyApp] }); })();
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
    static ɵfac: i0.ɵɵFactoryDef<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<MyPipe, "myPipe">;
}
export declare class MyApp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyPipe, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
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
MyPipe.ɵfac = function MyPipe_Factory(t) { return new (t || MyPipe)(i0.ɵɵinjectPipeChangeDetectorRef()); };
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
MyOtherPipe.ɵfac = function MyOtherPipe_Factory(t) { return new (t || MyOtherPipe)(i0.ɵɵinjectPipeChangeDetectorRef(8)); };
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
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>', isInline: true, pipes: { "myPipe": MyPipe, "myOtherPipe": MyOtherPipe } });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyOtherPipe, MyApp] }); })();
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
    static ɵfac: i0.ɵɵFactoryDef<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<MyPipe, "myPipe">;
}
export declare class MyOtherPipe implements PipeTransform {
    constructor(changeDetectorRef: ChangeDetectorRef);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDef<MyOtherPipe, [{ optional: true; }]>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<MyOtherPipe, "myOtherPipe">;
}
export declare class MyApp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyPipe, typeof MyOtherPipe, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

