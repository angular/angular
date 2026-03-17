/****************************************************************************************************
 * PARTIAL FILE: basic_linked.js
 ****************************************************************************************************/
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import * as i0 from "@angular/core";
export class BasicModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule, id: 'BasicModuleId' });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule, decorators: [{
            type: NgModule,
            args: [{ id: 'BasicModuleId', schemas: [NO_ERRORS_SCHEMA] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_linked.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class BasicModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BasicModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BasicModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BasicModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: basic_full.js
 ****************************************************************************************************/
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import * as i0 from "@angular/core";
export class BasicModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule, id: 'BasicModuleId' });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule, decorators: [{
            type: NgModule,
            args: [{ id: 'BasicModuleId', schemas: [NO_ERRORS_SCHEMA] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_full.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class BasicModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BasicModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BasicModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BasicModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: declarations.js
 ****************************************************************************************************/
import { Component, Directive, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class FooComponent {
    name = 'World';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: FooComponent, isStandalone: false, selector: "foo", ngImport: i0, template: '<div>Hello, {{name}}!</div>', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'foo', template: '<div>Hello, {{name}}!</div>',
                    standalone: false
                }]
        }] });
export class BarDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BarDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: BarDirective, isStandalone: false, selector: "[bar]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BarDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[bar]',
                    standalone: false
                }]
        }] });
export class QuxPipe {
    transform() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: QuxPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: QuxPipe, isStandalone: false, name: "qux" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: QuxPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'qux',
                    standalone: false
                }]
        }] });
export class FooModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, bootstrap: [FooComponent], declarations: [FooComponent, BarDirective, QuxPipe] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [FooComponent, BarDirective, QuxPipe], bootstrap: [FooComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: declarations.d.ts
 ****************************************************************************************************/
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class FooComponent {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FooComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FooComponent, "foo", never, {}, {}, never, never, false, never>;
}
export declare class BarDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<BarDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BarDirective, "[bar]", never, {}, {}, never, never, false, never>;
}
export declare class QuxPipe implements PipeTransform {
    transform(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<QuxPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<QuxPipe, "qux", false>;
}
export declare class FooModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FooModule, [typeof FooComponent, typeof BarDirective, typeof QuxPipe], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FooModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: declarations_jit_mode.js
 ****************************************************************************************************/
import { Component, Directive, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class FooComponent {
    name = 'World';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: FooComponent, isStandalone: false, selector: "foo", ngImport: i0, template: '<div>Hello, {{name}}!</div>', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'foo', template: '<div>Hello, {{name}}!</div>',
                    standalone: false
                }]
        }] });
export class BarDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BarDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: BarDirective, isStandalone: false, selector: "[bar]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BarDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[bar]',
                    standalone: false
                }]
        }] });
export class QuxPipe {
    transform() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: QuxPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: QuxPipe, isStandalone: false, name: "qux" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: QuxPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'qux',
                    standalone: false
                }]
        }] });
export class FooModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, bootstrap: [FooComponent], declarations: [FooComponent, BarDirective, QuxPipe] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [FooComponent, BarDirective, QuxPipe], bootstrap: [FooComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: declarations_jit_mode.d.ts
 ****************************************************************************************************/
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class FooComponent {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FooComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FooComponent, "foo", never, {}, {}, never, never, false, never>;
}
export declare class BarDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<BarDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BarDirective, "[bar]", never, {}, {}, never, never, false, never>;
}
export declare class QuxPipe implements PipeTransform {
    transform(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<QuxPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<QuxPipe, "qux", false>;
}
export declare class FooModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FooModule, [typeof FooComponent, typeof BarDirective, typeof QuxPipe], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FooModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: providers.js
 ****************************************************************************************************/
import { Injectable, InjectionToken, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class Thing {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Thing, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Thing });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Thing, decorators: [{
            type: Injectable
        }] });
export class BaseService {
    thing;
    constructor(thing) {
        this.thing = thing;
    }
    ;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseService, deps: [{ token: Thing }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: Thing }] });
export class ChildService extends BaseService {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildService, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildService, decorators: [{
            type: Injectable
        }] });
const MY_TOKEN = new InjectionToken('MY_TOKEN');
export class FooModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, providers: [
            Thing,
            BaseService,
            ChildService,
            { provide: MY_TOKEN, useFactory: (child) => ({ child }), deps: [ChildService] },
        ] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        Thing,
                        BaseService,
                        ChildService,
                        { provide: MY_TOKEN, useFactory: (child) => ({ child }), deps: [ChildService] },
                    ]
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: providers.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Thing {
    static ɵfac: i0.ɵɵFactoryDeclaration<Thing, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Thing>;
}
export declare class BaseService {
    protected thing: Thing;
    constructor(thing: Thing);
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BaseService>;
}
export declare class ChildService extends BaseService {
    static ɵfac: i0.ɵɵFactoryDeclaration<ChildService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ChildService>;
}
export declare class FooModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FooModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FooModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: imports_exports.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class A1Component {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: A1Component, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: A1Component, isStandalone: false, selector: "a1", ngImport: i0, template: 'A1', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: A1Component, decorators: [{
            type: Component,
            args: [{
                    selector: 'a1', template: 'A1',
                    standalone: false
                }]
        }] });
export class A2Component {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: A2Component, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: A2Component, isStandalone: false, selector: "a2", ngImport: i0, template: 'A2', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: A2Component, decorators: [{
            type: Component,
            args: [{
                    selector: 'a2', template: 'A2',
                    standalone: false
                }]
        }] });
export class AModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, declarations: [A1Component, A2Component], exports: [A1Component, A2Component] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [A1Component, A2Component], exports: [A1Component, A2Component] }]
        }] });
export class B1Component {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: B1Component, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: B1Component, isStandalone: false, selector: "b1", ngImport: i0, template: 'B1', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: B1Component, decorators: [{
            type: Component,
            args: [{
                    selector: 'b1', template: 'B1',
                    standalone: false
                }]
        }] });
export class B2Component {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: B2Component, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: B2Component, isStandalone: false, selector: "b2", ngImport: i0, template: 'B2', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: B2Component, decorators: [{
            type: Component,
            args: [{
                    selector: 'b2', template: 'B2',
                    standalone: false
                }]
        }] });
export class BModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, declarations: [B1Component, B2Component], exports: [AModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, imports: [AModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [B1Component, B2Component], exports: [AModule] }]
        }] });
export class AppModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [BModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [BModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, decorators: [{
            type: NgModule,
            args: [{ imports: [BModule] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: imports_exports.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class A1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A1Component, "a1", never, {}, {}, never, never, false, never>;
}
export declare class A2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A2Component, "a2", never, {}, {}, never, never, false, never>;
}
export declare class AModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AModule, [typeof A1Component, typeof A2Component], never, [typeof A1Component, typeof A2Component]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AModule>;
}
export declare class B1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B1Component, "b1", never, {}, {}, never, never, false, never>;
}
export declare class B2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B2Component, "b2", never, {}, {}, never, never, false, never>;
}
export declare class BModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BModule, [typeof B1Component, typeof B2Component], never, [typeof AModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BModule>;
}
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, [typeof BModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AppModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: imports_exports_jit_mode.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class A1Component {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: A1Component, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: A1Component, isStandalone: false, selector: "a1", ngImport: i0, template: 'A1', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: A1Component, decorators: [{
            type: Component,
            args: [{
                    selector: 'a1', template: 'A1',
                    standalone: false
                }]
        }] });
export class A2Component {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: A2Component, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: A2Component, isStandalone: false, selector: "a2", ngImport: i0, template: 'A2', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: A2Component, decorators: [{
            type: Component,
            args: [{
                    selector: 'a2', template: 'A2',
                    standalone: false
                }]
        }] });
export class AModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, declarations: [A1Component, A2Component], exports: [A1Component, A2Component] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [A1Component, A2Component], exports: [A1Component, A2Component] }]
        }] });
export class B1Component {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: B1Component, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: B1Component, isStandalone: false, selector: "b1", ngImport: i0, template: 'B1', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: B1Component, decorators: [{
            type: Component,
            args: [{
                    selector: 'b1', template: 'B1',
                    standalone: false
                }]
        }] });
export class B2Component {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: B2Component, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: B2Component, isStandalone: false, selector: "b2", ngImport: i0, template: 'B2', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: B2Component, decorators: [{
            type: Component,
            args: [{
                    selector: 'b2', template: 'B2',
                    standalone: false
                }]
        }] });
export class BModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, declarations: [B1Component, B2Component], exports: [AModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, imports: [AModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [B1Component, B2Component], exports: [AModule] }]
        }] });
export class AppModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [BModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [BModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, decorators: [{
            type: NgModule,
            args: [{ imports: [BModule] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: imports_exports_jit_mode.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class A1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A1Component, "a1", never, {}, {}, never, never, false, never>;
}
export declare class A2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A2Component, "a2", never, {}, {}, never, never, false, never>;
}
export declare class AModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AModule, [typeof A1Component, typeof A2Component], never, [typeof A1Component, typeof A2Component]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AModule>;
}
export declare class B1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B1Component, "b1", never, {}, {}, never, never, false, never>;
}
export declare class B2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B2Component, "b2", never, {}, {}, never, never, false, never>;
}
export declare class BModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BModule, [typeof B1Component, typeof B2Component], never, [typeof AModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BModule>;
}
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, [typeof BModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AppModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: no_aot.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
let NoAotModule = class NoAotModule {
};
NoAotModule = __decorate([
    NgModule({ jit: true })
], NoAotModule);
export { NoAotModule };

/****************************************************************************************************
 * PARTIAL FILE: no_aot.d.ts
 ****************************************************************************************************/
export declare class NoAotModule {
}

/****************************************************************************************************
 * PARTIAL FILE: inheritance.js
 ****************************************************************************************************/
import { Injectable, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class Service {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service, decorators: [{
            type: Injectable
        }] });
export class BaseModule {
    service;
    constructor(service) {
        this.service = service;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseModule, deps: [{ token: Service }], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseModule, providers: [Service] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseModule, decorators: [{
            type: NgModule,
            args: [{ providers: [Service] }]
        }], ctorParameters: () => [{ type: Service }] });
export class BasicModule extends BaseModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule, deps: null, target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: inheritance.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Service {
    static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Service>;
}
export declare class BaseModule {
    private service;
    constructor(service: Service);
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BaseModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BaseModule>;
}
export declare class BasicModule extends BaseModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BasicModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BasicModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BasicModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: forward_refs.js
 ****************************************************************************************************/
import { NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export function provideModule() {
    return { ngModule: ForwardModule };
}
export class TestModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, imports: () => [ForwardModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, imports: [provideModule()] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, decorators: [{
            type: NgModule,
            args: [{ imports: [provideModule()] }]
        }] });
export class ForwardModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForwardModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForwardModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForwardModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForwardModule, decorators: [{
            type: NgModule
        }] });

/****************************************************************************************************
 * PARTIAL FILE: forward_refs.d.ts
 ****************************************************************************************************/
import { ModuleWithProviders } from '@angular/core';
import * as i0 from "@angular/core";
export declare function provideModule(): ModuleWithProviders<ForwardModule>;
export declare class TestModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<TestModule, never, [typeof ForwardModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<TestModule>;
}
export declare class ForwardModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<ForwardModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ForwardModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ForwardModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: empty_fields.js
 ****************************************************************************************************/
import { NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class FooModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [],
                    declarations: [],
                    imports: [],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: empty_fields.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class FooModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FooModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FooModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: variable_providers.js
 ****************************************************************************************************/
import { InjectionToken, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
const PROVIDERS = [{ provide: new InjectionToken('token'), useValue: 1 }];
export class FooModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, providers: PROVIDERS });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, decorators: [{
            type: NgModule,
            args: [{ providers: PROVIDERS }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: variable_providers.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class FooModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FooModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<FooModule>;
}

