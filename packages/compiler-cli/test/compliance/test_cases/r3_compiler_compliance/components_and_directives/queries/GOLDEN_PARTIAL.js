/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{
                selector: '[someDir]',
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: view_query_for_directive.js
 ****************************************************************************************************/
import { Component, NgModule, ViewChild, ViewChildren } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ViewQueryComponent {
}
ViewQueryComponent.ɵfac = function ViewQueryComponent_Factory(t) { return new (t || ViewQueryComponent)(); };
ViewQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ViewQueryComponent, selector: "view-query-component", viewQueries: [{ propertyName: "someDir", first: true, predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true }, { propertyName: "someDirs", predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true }], ngImport: i0, template: `
    <div someDir></div>
  `, isInline: true, directives: [{ type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ViewQueryComponent, [{
        type: Component,
        args: [{
                selector: 'view-query-component',
                template: `
    <div someDir></div>
  `
            }]
    }], null, { someDir: [{
            type: ViewChild,
            args: [SomeDirective]
        }], someDirs: [{
            type: ViewChildren,
            args: [SomeDirective]
        }] }); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, ViewQueryComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective, ViewQueryComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: view_query_for_directive.d.ts
 ****************************************************************************************************/
import { QueryList } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
import * as i1 from "./some.directive";
export declare class ViewQueryComponent {
    someDir: SomeDirective;
    someDirs: QueryList<SomeDirective>;
    static ɵfac: i0.ɵɵFactoryDef<ViewQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ViewQueryComponent, "view-query-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof i1.SomeDirective, typeof ViewQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: view_query_for_local_ref.js
 ****************************************************************************************************/
import { Component, NgModule, ViewChild, ViewChildren } from '@angular/core';
import * as i0 from "@angular/core";
export class ViewQueryComponent {
}
ViewQueryComponent.ɵfac = function ViewQueryComponent_Factory(t) { return new (t || ViewQueryComponent)(); };
ViewQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ViewQueryComponent, selector: "view-query-component", viewQueries: [{ propertyName: "myRef", first: true, predicate: ["myRef"], emitDistinctChangesOnly: false, descendants: true }, { propertyName: "myRefs", predicate: ["myRef1, myRef2, myRef3"], emitDistinctChangesOnly: false, descendants: true }], ngImport: i0, template: `
    <div #myRef></div>
    <div #myRef1></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ViewQueryComponent, [{
        type: Component,
        args: [{
                selector: 'view-query-component',
                template: `
    <div #myRef></div>
    <div #myRef1></div>
  `
            }]
    }], null, { myRef: [{
            type: ViewChild,
            args: ['myRef']
        }], myRefs: [{
            type: ViewChildren,
            args: ['myRef1, myRef2, myRef3']
        }] }); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ViewQueryComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [ViewQueryComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: view_query_for_local_ref.d.ts
 ****************************************************************************************************/
import { QueryList } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ViewQueryComponent {
    myRef: any;
    myRefs: QueryList<any>;
    static ɵfac: i0.ɵɵFactoryDef<ViewQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ViewQueryComponent, "view-query-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof ViewQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{
                selector: '[someDir]',
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: static_view_query.js
 ****************************************************************************************************/
import { Component, ElementRef, NgModule, ViewChild } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ViewQueryComponent {
}
ViewQueryComponent.ɵfac = function ViewQueryComponent_Factory(t) { return new (t || ViewQueryComponent)(); };
ViewQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ViewQueryComponent, selector: "view-query-component", viewQueries: [{ propertyName: "someDir", first: true, predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true, static: true }, { propertyName: "foo", first: true, predicate: ["foo"], emitDistinctChangesOnly: false, descendants: true }], ngImport: i0, template: `
    <div someDir></div>
  `, isInline: true, directives: [{ type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ViewQueryComponent, [{
        type: Component,
        args: [{
                selector: 'view-query-component',
                template: `
    <div someDir></div>
  `
            }]
    }], null, { someDir: [{
            type: ViewChild,
            args: [SomeDirective, { static: true }]
        }], foo: [{
            type: ViewChild,
            args: ['foo']
        }] }); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, ViewQueryComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective, ViewQueryComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: static_view_query.d.ts
 ****************************************************************************************************/
import { ElementRef } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
import * as i1 from "./some.directive";
export declare class ViewQueryComponent {
    someDir: SomeDirective;
    foo: ElementRef;
    static ɵfac: i0.ɵɵFactoryDef<ViewQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ViewQueryComponent, "view-query-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof i1.SomeDirective, typeof ViewQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{
                selector: '[someDir]',
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: view_query_read_token.js
 ****************************************************************************************************/
import { Component, ElementRef, NgModule, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ViewQueryComponent {
}
ViewQueryComponent.ɵfac = function ViewQueryComponent_Factory(t) { return new (t || ViewQueryComponent)(); };
ViewQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ViewQueryComponent, selector: "view-query-component", viewQueries: [{ propertyName: "myRef", first: true, predicate: ["myRef"], emitDistinctChangesOnly: false, descendants: true, read: TemplateRef }, { propertyName: "someDir", first: true, predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true, read: ElementRef }, { propertyName: "myRefs", predicate: ["myRef1, myRef2, myRef3"], emitDistinctChangesOnly: false, descendants: true, read: ElementRef }, { propertyName: "someDirs", predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true, read: TemplateRef }], ngImport: i0, template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ViewQueryComponent, [{
        type: Component,
        args: [{
                selector: 'view-query-component',
                template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `
            }]
    }], null, { myRef: [{
            type: ViewChild,
            args: ['myRef', { read: TemplateRef }]
        }], myRefs: [{
            type: ViewChildren,
            args: ['myRef1, myRef2, myRef3', { read: ElementRef }]
        }], someDir: [{
            type: ViewChild,
            args: [SomeDirective, { read: ElementRef }]
        }], someDirs: [{
            type: ViewChildren,
            args: [SomeDirective, { read: TemplateRef }]
        }] }); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ViewQueryComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [ViewQueryComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: view_query_read_token.d.ts
 ****************************************************************************************************/
import { ElementRef, QueryList, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ViewQueryComponent {
    myRef: TemplateRef<unknown>;
    myRefs: QueryList<ElementRef>;
    someDir: ElementRef;
    someDirs: QueryList<TemplateRef<unknown>>;
    static ɵfac: i0.ɵɵFactoryDef<ViewQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ViewQueryComponent, "view-query-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof ViewQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{
                selector: '[someDir]',
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: content_query_for_directive.js
 ****************************************************************************************************/
import { Component, ContentChild, ContentChildren, NgModule } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = function ContentQueryComponent_Factory(t) { return new (t || ContentQueryComponent)(); };
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "someDir", first: true, predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true }, { propertyName: "someDirList", predicate: SomeDirective, emitDistinctChangesOnly: false }], ngImport: i0, template: `
    <div><ng-content></ng-content></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContentQueryComponent, [{
        type: Component,
        args: [{
                selector: 'content-query-component',
                template: `
    <div><ng-content></ng-content></div>
  `
            }]
    }], null, { someDir: [{
            type: ContentChild,
            args: [SomeDirective]
        }], someDirList: [{
            type: ContentChildren,
            args: [SomeDirective]
        }] }); })();
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `, isInline: true, directives: [{ type: i0.forwardRef(function () { return ContentQueryComponent; }), selector: "content-query-component" }, { type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, ContentQueryComponent, MyApp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective, ContentQueryComponent, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: content_query_for_directive.d.ts
 ****************************************************************************************************/
import { QueryList } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
import * as i1 from "./some.directive";
export declare class ContentQueryComponent {
    someDir: SomeDirective;
    someDirList: QueryList<SomeDirective>;
    static ɵfac: i0.ɵɵFactoryDef<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ContentQueryComponent, "content-query-component", never, {}, {}, ["someDir", "someDirList"], ["*"]>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof i1.SomeDirective, typeof ContentQueryComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: content_query_for_local_ref.js
 ****************************************************************************************************/
import { Component, ContentChild, ContentChildren, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = function ContentQueryComponent_Factory(t) { return new (t || ContentQueryComponent)(); };
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "myRef", first: true, predicate: ["myRef"], emitDistinctChangesOnly: false, descendants: true }, { propertyName: "myRefs", predicate: ["myRef1, myRef2, myRef3"], emitDistinctChangesOnly: false }], ngImport: i0, template: `
    <div #myRef></div>
    <div #myRef1></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContentQueryComponent, [{
        type: Component,
        args: [{
                selector: 'content-query-component',
                template: `
    <div #myRef></div>
    <div #myRef1></div>
  `
            }]
    }], null, { myRef: [{
            type: ContentChild,
            args: ['myRef']
        }], myRefs: [{
            type: ContentChildren,
            args: ['myRef1, myRef2, myRef3']
        }] }); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ContentQueryComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [ContentQueryComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: content_query_for_local_ref.d.ts
 ****************************************************************************************************/
import { QueryList } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ContentQueryComponent {
    myRef: any;
    myRefs: QueryList<any>;
    static ɵfac: i0.ɵɵFactoryDef<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ContentQueryComponent, "content-query-component", never, {}, {}, ["myRef", "myRefs"], never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof ContentQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{
                selector: '[someDir]',
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: static_content_query.js
 ****************************************************************************************************/
import { Component, ContentChild, ElementRef, NgModule } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = function ContentQueryComponent_Factory(t) { return new (t || ContentQueryComponent)(); };
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "someDir", first: true, predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true, static: true }, { propertyName: "foo", first: true, predicate: ["foo"], emitDistinctChangesOnly: false, descendants: true }], ngImport: i0, template: `
    <div><ng-content></ng-content></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContentQueryComponent, [{
        type: Component,
        args: [{
                selector: 'content-query-component',
                template: `
    <div><ng-content></ng-content></div>
  `
            }]
    }], null, { someDir: [{
            type: ContentChild,
            args: [SomeDirective, { static: true }]
        }], foo: [{
            type: ContentChild,
            args: ['foo']
        }] }); })();
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `, isInline: true, directives: [{ type: i0.forwardRef(function () { return ContentQueryComponent; }), selector: "content-query-component" }, { type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, ContentQueryComponent, MyApp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective, ContentQueryComponent, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: static_content_query.d.ts
 ****************************************************************************************************/
import { ElementRef } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
import * as i1 from "./some.directive";
export declare class ContentQueryComponent {
    someDir: SomeDirective;
    foo: ElementRef;
    static ɵfac: i0.ɵɵFactoryDef<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ContentQueryComponent, "content-query-component", never, {}, {}, ["someDir", "foo"], ["*"]>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof i1.SomeDirective, typeof ContentQueryComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{
                selector: '[someDir]',
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: content_query_read_token.js
 ****************************************************************************************************/
import { Component, ContentChild, ContentChildren, ElementRef, NgModule, TemplateRef } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = function ContentQueryComponent_Factory(t) { return new (t || ContentQueryComponent)(); };
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "myRef", first: true, predicate: ["myRef"], emitDistinctChangesOnly: false, descendants: true, read: TemplateRef }, { propertyName: "someDir", first: true, predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true, read: ElementRef }, { propertyName: "myRefs", predicate: ["myRef1, myRef2, myRef3"], emitDistinctChangesOnly: false, read: ElementRef }, { propertyName: "someDirs", predicate: SomeDirective, emitDistinctChangesOnly: false, read: TemplateRef }], ngImport: i0, template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContentQueryComponent, [{
        type: Component,
        args: [{
                selector: 'content-query-component',
                template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `
            }]
    }], null, { myRef: [{
            type: ContentChild,
            args: ['myRef', { read: TemplateRef }]
        }], myRefs: [{
            type: ContentChildren,
            args: ['myRef1, myRef2, myRef3', { read: ElementRef }]
        }], someDir: [{
            type: ContentChild,
            args: [SomeDirective, { read: ElementRef }]
        }], someDirs: [{
            type: ContentChildren,
            args: [SomeDirective, { read: TemplateRef }]
        }] }); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ContentQueryComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [ContentQueryComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: content_query_read_token.d.ts
 ****************************************************************************************************/
import { ElementRef, QueryList, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ContentQueryComponent {
    myRef: TemplateRef<unknown>;
    myRefs: QueryList<ElementRef>;
    someDir: ElementRef;
    someDirs: QueryList<TemplateRef<unknown>>;
    static ɵfac: i0.ɵɵFactoryDef<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ContentQueryComponent, "content-query-component", never, {}, {}, ["myRef", "someDir", "myRefs", "someDirs"], never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof ContentQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{
                selector: '[someDir]',
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: query_with_emit_distinct_changes_only.js
 ****************************************************************************************************/
import { Component, ContentChildren, NgModule, ViewChildren } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = function ContentQueryComponent_Factory(t) { return new (t || ContentQueryComponent)(); };
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "myRefs", predicate: ["myRef"] }, { propertyName: "oldMyRefs", predicate: ["myRef"], emitDistinctChangesOnly: false }], viewQueries: [{ propertyName: "someDirs", predicate: SomeDirective, descendants: true }, { propertyName: "oldSomeDirs", predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true }], ngImport: i0, template: `
    <div someDir></div>
    <div #myRef></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContentQueryComponent, [{
        type: Component,
        args: [{
                selector: 'content-query-component',
                template: `
    <div someDir></div>
    <div #myRef></div>
  `
            }]
    }], null, { myRefs: [{
            type: ContentChildren,
            args: ['myRef', { emitDistinctChangesOnly: true }]
        }], oldMyRefs: [{
            type: ContentChildren,
            args: ['myRef', { emitDistinctChangesOnly: false }]
        }], someDirs: [{
            type: ViewChildren,
            args: [SomeDirective, { emitDistinctChangesOnly: true }]
        }], oldSomeDirs: [{
            type: ViewChildren,
            args: [SomeDirective, { emitDistinctChangesOnly: false }]
        }] }); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ContentQueryComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [ContentQueryComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: query_with_emit_distinct_changes_only.d.ts
 ****************************************************************************************************/
import { ElementRef, QueryList } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ContentQueryComponent {
    myRefs: QueryList<ElementRef>;
    oldMyRefs: QueryList<ElementRef>;
    someDirs: QueryList<any>;
    oldSomeDirs: QueryList<any>;
    static ɵfac: i0.ɵɵFactoryDef<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ContentQueryComponent, "content-query-component", never, {}, {}, ["myRefs", "oldMyRefs"], never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof ContentQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

