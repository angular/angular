/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[someDir]',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: view_query_for_directive.js
 ****************************************************************************************************/
import { Component, NgModule, ViewChild, ViewChildren } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ViewQueryComponent {
}
ViewQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ViewQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ViewQueryComponent, selector: "view-query-component", viewQueries: [{ propertyName: "someDir", first: true, predicate: SomeDirective, descendants: true }, { propertyName: "someDirs", predicate: SomeDirective, descendants: true }], ngImport: i0, template: `
    <div someDir></div>
  `, isInline: true, dependencies: [{ kind: "directive", type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'view-query-component',
                    template: `
    <div someDir></div>
  `
                }]
        }], propDecorators: { someDir: [{
                type: ViewChild,
                args: [SomeDirective]
            }], someDirs: [{
                type: ViewChildren,
                args: [SomeDirective]
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, ViewQueryComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeDirective, ViewQueryComponent] }]
        }] });

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
    static ɵfac: i0.ɵɵFactoryDeclaration<ViewQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ViewQueryComponent, "view-query-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof i1.SomeDirective, typeof ViewQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: view_query_forward_ref.js
 ****************************************************************************************************/
import { Component, Directive, forwardRef, NgModule, ViewChild, ViewChildren } from '@angular/core';
import * as i0 from "@angular/core";
export class ViewQueryComponent {
}
ViewQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ViewQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ViewQueryComponent, selector: "view-query-component", viewQueries: [{ propertyName: "someDir", first: true, predicate: i0.forwardRef(function () { return SomeDirective; }), descendants: true }, { propertyName: "someDirList", predicate: i0.forwardRef(function () { return SomeDirective; }), descendants: true }], ngImport: i0, template: `
    <div someDir></div>
  `, isInline: true, dependencies: [{ kind: "directive", type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'view-query-component',
                    template: `
    <div someDir></div>
  `
                }]
        }], propDecorators: { someDir: [{
                type: ViewChild,
                args: [forwardRef(() => SomeDirective)]
            }], someDirList: [{
                type: ViewChildren,
                args: [forwardRef(() => SomeDirective)]
            }] } });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
    <view-query-component></view-query-component>
  `, isInline: true, dependencies: [{ kind: "component", type: ViewQueryComponent, selector: "view-query-component" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
    <view-query-component></view-query-component>
  `
                }]
        }] });
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[someDir]',
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, ViewQueryComponent, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeDirective, ViewQueryComponent, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: view_query_forward_ref.d.ts
 ****************************************************************************************************/
import { QueryList } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ViewQueryComponent {
    someDir: SomeDirective;
    someDirList: QueryList<SomeDirective>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ViewQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ViewQueryComponent, "view-query-component", never, {}, {}, never, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeDirective, typeof ViewQueryComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: view_query_for_local_ref.js
 ****************************************************************************************************/
import { Component, NgModule, ViewChild, ViewChildren } from '@angular/core';
import * as i0 from "@angular/core";
export class ViewQueryComponent {
}
ViewQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ViewQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ViewQueryComponent, selector: "view-query-component", viewQueries: [{ propertyName: "myRef", first: true, predicate: ["myRef"], descendants: true }, { propertyName: "myRefs", predicate: ["myRef1, myRef2, myRef3"], descendants: true }], ngImport: i0, template: `
    <div #myRef></div>
    <div #myRef1></div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'view-query-component',
                    template: `
    <div #myRef></div>
    <div #myRef1></div>
  `
                }]
        }], propDecorators: { myRef: [{
                type: ViewChild,
                args: ['myRef']
            }], myRefs: [{
                type: ViewChildren,
                args: ['myRef1, myRef2, myRef3']
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [ViewQueryComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [ViewQueryComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: view_query_for_local_ref.d.ts
 ****************************************************************************************************/
import { QueryList } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ViewQueryComponent {
    myRef: any;
    myRefs: QueryList<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ViewQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ViewQueryComponent, "view-query-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ViewQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[someDir]',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: static_view_query.js
 ****************************************************************************************************/
import { Component, ElementRef, NgModule, ViewChild } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ViewQueryComponent {
}
ViewQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ViewQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ViewQueryComponent, selector: "view-query-component", viewQueries: [{ propertyName: "someDir", first: true, predicate: SomeDirective, descendants: true, static: true }, { propertyName: "foo", first: true, predicate: ["foo"], descendants: true }], ngImport: i0, template: `
    <div someDir></div>
  `, isInline: true, dependencies: [{ kind: "directive", type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'view-query-component',
                    template: `
    <div someDir></div>
  `
                }]
        }], propDecorators: { someDir: [{
                type: ViewChild,
                args: [SomeDirective, { static: true }]
            }], foo: [{
                type: ViewChild,
                args: ['foo']
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, ViewQueryComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeDirective, ViewQueryComponent] }]
        }] });

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
    static ɵfac: i0.ɵɵFactoryDeclaration<ViewQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ViewQueryComponent, "view-query-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof i1.SomeDirective, typeof ViewQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[someDir]',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: view_query_read_token.js
 ****************************************************************************************************/
import { Component, ElementRef, NgModule, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ViewQueryComponent {
}
ViewQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ViewQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ViewQueryComponent, selector: "view-query-component", viewQueries: [{ propertyName: "myRef", first: true, predicate: ["myRef"], descendants: true, read: TemplateRef }, { propertyName: "someDir", first: true, predicate: SomeDirective, descendants: true, read: ElementRef }, { propertyName: "myRefs", predicate: ["myRef1, myRef2, myRef3"], descendants: true, read: ElementRef }, { propertyName: "someDirs", predicate: SomeDirective, descendants: true, read: TemplateRef }], ngImport: i0, template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ViewQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'view-query-component',
                    template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `
                }]
        }], propDecorators: { myRef: [{
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
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [ViewQueryComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [ViewQueryComponent] }]
        }] });

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
    static ɵfac: i0.ɵɵFactoryDeclaration<ViewQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ViewQueryComponent, "view-query-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ViewQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[someDir]',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: content_query_for_directive.js
 ****************************************************************************************************/
import { Component, ContentChild, ContentChildren, NgModule } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "someDir", first: true, predicate: SomeDirective, descendants: true }, { propertyName: "someDirList", predicate: SomeDirective }], ngImport: i0, template: `
    <div><ng-content></ng-content></div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'content-query-component',
                    template: `
    <div><ng-content></ng-content></div>
  `
                }]
        }], propDecorators: { someDir: [{
                type: ContentChild,
                args: [SomeDirective]
            }], someDirList: [{
                type: ContentChildren,
                args: [SomeDirective]
            }] } });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `, isInline: true, dependencies: [{ kind: "component", type: i0.forwardRef(function () { return ContentQueryComponent; }), selector: "content-query-component" }, { kind: "directive", type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, ContentQueryComponent, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeDirective, ContentQueryComponent, MyApp] }]
        }] });

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
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContentQueryComponent, "content-query-component", never, {}, {}, ["someDir", "someDirList"], ["*"]>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof i1.SomeDirective, typeof ContentQueryComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: content_query_forward_ref.js
 ****************************************************************************************************/
import { Component, ContentChild, ContentChildren, Directive, forwardRef, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "someDir", first: true, predicate: i0.forwardRef(function () { return SomeDirective; }), descendants: true }, { propertyName: "someDirList", predicate: i0.forwardRef(function () { return SomeDirective; }) }], ngImport: i0, template: `
    <div><ng-content></ng-content></div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'content-query-component',
                    template: `
    <div><ng-content></ng-content></div>
  `
                }]
        }], propDecorators: { someDir: [{
                type: ContentChild,
                args: [forwardRef(() => SomeDirective)]
            }], someDirList: [{
                type: ContentChildren,
                args: [forwardRef(() => SomeDirective)]
            }] } });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `, isInline: true, dependencies: [{ kind: "component", type: i0.forwardRef(function () { return ContentQueryComponent; }), selector: "content-query-component" }, { kind: "directive", type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `
                }]
        }] });
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[someDir]',
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, ContentQueryComponent, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeDirective, ContentQueryComponent, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: content_query_forward_ref.d.ts
 ****************************************************************************************************/
import { QueryList } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ContentQueryComponent {
    someDir: SomeDirective;
    someDirList: QueryList<SomeDirective>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContentQueryComponent, "content-query-component", never, {}, {}, ["someDir", "someDirList"], ["*"]>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeDirective, typeof ContentQueryComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: content_query_for_local_ref.js
 ****************************************************************************************************/
import { Component, ContentChild, ContentChildren, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "myRef", first: true, predicate: ["myRef"], descendants: true }, { propertyName: "myRefs", predicate: ["myRef1, myRef2, myRef3"] }], ngImport: i0, template: `
    <div #myRef></div>
    <div #myRef1></div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'content-query-component',
                    template: `
    <div #myRef></div>
    <div #myRef1></div>
  `
                }]
        }], propDecorators: { myRef: [{
                type: ContentChild,
                args: ['myRef']
            }], myRefs: [{
                type: ContentChildren,
                args: ['myRef1, myRef2, myRef3']
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [ContentQueryComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [ContentQueryComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: content_query_for_local_ref.d.ts
 ****************************************************************************************************/
import { QueryList } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ContentQueryComponent {
    myRef: any;
    myRefs: QueryList<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContentQueryComponent, "content-query-component", never, {}, {}, ["myRef", "myRefs"], never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ContentQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[someDir]',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: static_content_query.js
 ****************************************************************************************************/
import { Component, ContentChild, ElementRef, NgModule } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "someDir", first: true, predicate: SomeDirective, descendants: true, static: true }, { propertyName: "foo", first: true, predicate: ["foo"], descendants: true }], ngImport: i0, template: `
    <div><ng-content></ng-content></div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'content-query-component',
                    template: `
    <div><ng-content></ng-content></div>
  `
                }]
        }], propDecorators: { someDir: [{
                type: ContentChild,
                args: [SomeDirective, { static: true }]
            }], foo: [{
                type: ContentChild,
                args: ['foo']
            }] } });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `, isInline: true, dependencies: [{ kind: "component", type: i0.forwardRef(function () { return ContentQueryComponent; }), selector: "content-query-component" }, { kind: "directive", type: i0.forwardRef(function () { return SomeDirective; }), selector: "[someDir]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
    <content-query-component>
      <div someDir></div>
    </content-query-component>
  `
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, ContentQueryComponent, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SomeDirective, ContentQueryComponent, MyApp] }]
        }] });

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
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContentQueryComponent, "content-query-component", never, {}, {}, ["someDir", "foo"], ["*"]>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof i1.SomeDirective, typeof ContentQueryComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[someDir]',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: content_query_read_token.js
 ****************************************************************************************************/
import { Component, ContentChild, ContentChildren, ElementRef, NgModule, TemplateRef } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "myRef", first: true, predicate: ["myRef"], descendants: true, read: TemplateRef }, { propertyName: "someDir", first: true, predicate: SomeDirective, descendants: true, read: ElementRef }, { propertyName: "myRefs", predicate: ["myRef1, myRef2, myRef3"], read: ElementRef }, { propertyName: "someDirs", predicate: SomeDirective, read: TemplateRef }], ngImport: i0, template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'content-query-component',
                    template: `
    <div someDir></div>
    <div #myRef></div>
    <div #myRef1></div>
  `
                }]
        }], propDecorators: { myRef: [{
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
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [ContentQueryComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [ContentQueryComponent] }]
        }] });

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
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContentQueryComponent, "content-query-component", never, {}, {}, ["myRef", "someDir", "myRefs", "someDirs"], never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ContentQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: some.directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDir]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[someDir]',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: some.directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: query_with_emit_distinct_changes_only.js
 ****************************************************************************************************/
import { Component, ContentChildren, NgModule, ViewChildren } from '@angular/core';
import { SomeDirective } from './some.directive';
import * as i0 from "@angular/core";
export class ContentQueryComponent {
}
ContentQueryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ContentQueryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: ContentQueryComponent, selector: "content-query-component", queries: [{ propertyName: "myRefs", predicate: ["myRef"] }, { propertyName: "oldMyRefs", predicate: ["myRef"], emitDistinctChangesOnly: false }], viewQueries: [{ propertyName: "someDirs", predicate: SomeDirective, descendants: true }, { propertyName: "oldSomeDirs", predicate: SomeDirective, emitDistinctChangesOnly: false, descendants: true }], ngImport: i0, template: `
    <div someDir></div>
    <div #myRef></div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ContentQueryComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'content-query-component',
                    template: `
    <div someDir></div>
    <div #myRef></div>
  `
                }]
        }], propDecorators: { myRefs: [{
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
            }] } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [ContentQueryComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [ContentQueryComponent] }]
        }] });

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
    static ɵfac: i0.ɵɵFactoryDeclaration<ContentQueryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ContentQueryComponent, "content-query-component", never, {}, {}, ["myRefs", "oldMyRefs"], never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof ContentQueryComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

