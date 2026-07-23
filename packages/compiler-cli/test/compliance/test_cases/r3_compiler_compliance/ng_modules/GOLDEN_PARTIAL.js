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

/****************************************************************************************************
 * PARTIAL FILE: all_options.js
 ****************************************************************************************************/
import { NgModule, NO_ERRORS_SCHEMA, forwardRef, Component, Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDecl {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDecl, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyDecl, isStandalone: false, selector: "[my-decl]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDecl, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-decl]',
                    standalone: false
                }]
        }] });
export class MyImport {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyImport, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyImport });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyImport });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyImport, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
export class MyExport {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyExport, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyExport, isStandalone: false, selector: "[my-export]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyExport, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-export]',
                    standalone: false
                }]
        }] });
export class MyBootstrap {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyBootstrap, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyBootstrap, isStandalone: false, selector: "my-bootstrap", ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyBootstrap, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-bootstrap',
                    template: '',
                    standalone: false
                }]
        }] });
export class MyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, bootstrap: [MyBootstrap], declarations: [MyDecl, MyExport], imports: [MyImport], exports: [MyExport], id: 'my-module-id' });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, imports: [MyImport] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [MyDecl, MyExport],
                    imports: [MyImport],
                    exports: [MyExport],
                    bootstrap: [forwardRef(() => MyBootstrap)],
                    schemas: [NO_ERRORS_SCHEMA],
                    id: 'my-module-id'
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: all_options.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDecl {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDecl, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDecl, "[my-decl]", never, {}, {}, never, never, false, never>;
}
export declare class MyImport {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyImport, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyImport, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyImport>;
}
export declare class MyExport {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyExport, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyExport, "[my-export]", never, {}, {}, never, never, false, never>;
}
export declare class MyBootstrap {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyBootstrap, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyBootstrap, "my-bootstrap", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyDecl, typeof MyExport], [typeof MyImport], [typeof MyExport]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: injector_providers.js
 ****************************************************************************************************/
import { Injectable, InjectionToken, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class Base {
}
export class Impl extends Base {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Impl, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Impl });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Impl, decorators: [{
            type: Injectable
        }] });
export class Legacy {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Legacy, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Legacy });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Legacy, decorators: [{
            type: Injectable
        }] });
export const TOKEN = new InjectionToken('TOKEN');
export const MULTI = new InjectionToken('MULTI');
export class ProvidersModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ProvidersModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ProvidersModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ProvidersModule, providers: [
            Impl,
            { provide: Base, useClass: Impl },
            { provide: Legacy, useExisting: Impl },
            { provide: TOKEN, useValue: 'hello' },
            { provide: MULTI, useValue: 'a', multi: true },
            { provide: MULTI, useValue: 'b', multi: true },
            { provide: 'STR', useFactory: (b) => b, deps: [Base] },
        ] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ProvidersModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        Impl,
                        { provide: Base, useClass: Impl },
                        { provide: Legacy, useExisting: Impl },
                        { provide: TOKEN, useValue: 'hello' },
                        { provide: MULTI, useValue: 'a', multi: true },
                        { provide: MULTI, useValue: 'b', multi: true },
                        { provide: 'STR', useFactory: (b) => b, deps: [Base] },
                    ],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: injector_providers.d.ts
 ****************************************************************************************************/
import { InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
export declare abstract class Base {
}
export declare class Impl extends Base {
    static ɵfac: i0.ɵɵFactoryDeclaration<Impl, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Impl>;
}
export declare class Legacy {
    static ɵfac: i0.ɵɵFactoryDeclaration<Legacy, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Legacy>;
}
export declare const TOKEN: InjectionToken<string>;
export declare const MULTI: InjectionToken<string[]>;
export declare class ProvidersModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<ProvidersModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ProvidersModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ProvidersModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: module_scope.js
 ****************************************************************************************************/
import { Component, Directive, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-cmp", ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-cmp',
                    template: '',
                    standalone: false,
                }]
        }] });
export class MyDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyDirective, isStandalone: false, selector: "[my-dir]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[my-dir]',
                    standalone: false,
                }]
        }] });
export class MyPipe {
    transform(value) {
        return value;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, isStandalone: false, name: "myPipe" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'myPipe',
                    standalone: false,
                }]
        }] });
export class SharedModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SharedModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SharedModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SharedModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SharedModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
export class MyModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, MyDirective, MyPipe], imports: [SharedModule], exports: [MyComponent, SharedModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, imports: [SharedModule, SharedModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [MyComponent, MyDirective, MyPipe],
                    imports: [SharedModule],
                    exports: [MyComponent, SharedModule],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: module_scope.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-cmp", never, {}, {}, never, never, false, never>;
}
export declare class MyDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDirective, "[my-dir]", never, {}, {}, never, never, false, never>;
}
export declare class MyPipe {
    transform(value: unknown): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe", false>;
}
export declare class SharedModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<SharedModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof MyDirective, typeof MyPipe], [typeof SharedModule], [typeof MyComponent, typeof SharedModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: module_with_providers.js
 ****************************************************************************************************/
import { InjectionToken, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export const CONFIG = new InjectionToken('CONFIG');
export class LibModule {
    static forRoot(value) {
        return {
            ngModule: LibModule,
            providers: [{ provide: CONFIG, useValue: value }],
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LibModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LibModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LibModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LibModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
export class AppModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [LibModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [LibModule.forRoot('app')] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [LibModule.forRoot('app')],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: module_with_providers.d.ts
 ****************************************************************************************************/
import { InjectionToken, ModuleWithProviders } from '@angular/core';
import * as i0 from "@angular/core";
export declare const CONFIG: InjectionToken<string>;
export declare class LibModule {
    static forRoot(value: string): ModuleWithProviders<LibModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<LibModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<LibModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<LibModule>;
}
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, [typeof LibModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AppModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_array_imports.js
 ****************************************************************************************************/
import { NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ModA {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModA, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModA });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModA });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModA, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
export class ModB {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModB, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModB });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModB });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModB, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
export const GROUP = [ModA, ModB];
// A nested-array import element and a referenced-constant import element. The compiler emits the
// injector `imports` preserving these composite elements.
export class NestedModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NestedModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NestedModule, imports: [ModA, ModB, ModA, ModB] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NestedModule, imports: [[ModA, ModB], GROUP] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NestedModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [[ModA, ModB], GROUP],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_array_imports.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ModA {
    static ɵfac: i0.ɵɵFactoryDeclaration<ModA, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ModA, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ModA>;
}
export declare class ModB {
    static ɵfac: i0.ɵɵFactoryDeclaration<ModB, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ModB, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ModB>;
}
export declare const GROUP: (typeof ModA)[];
export declare class NestedModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<NestedModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NestedModule, never, [typeof ModA, typeof ModB, typeof ModA, typeof ModB], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NestedModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: reexport_only.js
 ****************************************************************************************************/
import { NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ChildModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ChildModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
// `ChildModule` is only exported (never imported). In full mode the compiler still adds it to the
// injector's `imports` so its providers remain available transitively.
export class ParentModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ParentModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ParentModule, exports: [ChildModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ParentModule, imports: [ChildModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ParentModule, decorators: [{
            type: NgModule,
            args: [{
                    exports: [ChildModule],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: reexport_only.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ChildModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<ChildModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ChildModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ChildModule>;
}
export declare class ParentModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<ParentModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ParentModule, never, never, [typeof ChildModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ParentModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: standalone_imports.js
 ****************************************************************************************************/
import { Component, Directive, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class StandaloneComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: StandaloneComponent, isStandalone: true, selector: "std-cmp", ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'std-cmp',
                    template: '',
                }]
        }] });
export class StandaloneDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: StandaloneDirective, isStandalone: true, selector: "[std-dir]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[std-dir]',
                }]
        }] });
export class StandalonePipe {
    transform(value) {
        return value;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandalonePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandalonePipe, isStandalone: true, name: "stdPipe" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandalonePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'stdPipe',
                }]
        }] });
export class ConsumerModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ConsumerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ConsumerModule, imports: [StandaloneComponent, StandaloneDirective, StandalonePipe], exports: [StandaloneComponent, StandaloneDirective, StandalonePipe] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ConsumerModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ConsumerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [StandaloneComponent, StandaloneDirective, StandalonePipe],
                    exports: [StandaloneComponent, StandaloneDirective, StandalonePipe],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: standalone_imports.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class StandaloneComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StandaloneComponent, "std-cmp", never, {}, {}, never, never, true, never>;
}
export declare class StandaloneDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<StandaloneDirective, "[std-dir]", never, {}, {}, never, never, true, never>;
}
export declare class StandalonePipe {
    transform(value: unknown): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<StandalonePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<StandalonePipe, "stdPipe", true>;
}
export declare class ConsumerModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<ConsumerModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ConsumerModule, never, [typeof StandaloneComponent, typeof StandaloneDirective, typeof StandalonePipe], [typeof StandaloneComponent, typeof StandaloneDirective, typeof StandalonePipe]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ConsumerModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: forwardref_imports.js
 ****************************************************************************************************/
import { forwardRef, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
// `AppModule` references `LaterModule` before it is declared, via `forwardRef`. In full mode the
// compiler resolves the forwardRef and emits the bare module reference in the injector imports.
export class AppModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: () => [LaterModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [forwardRef(() => LaterModule)] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [forwardRef(() => LaterModule)],
                }]
        }] });
export class LaterModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LaterModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LaterModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LaterModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LaterModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: forwardref_imports.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, [typeof LaterModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AppModule>;
}
export declare class LaterModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<LaterModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<LaterModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<LaterModule>;
}

