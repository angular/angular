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
MyPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
MyPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, isStandalone: false, name: "myPipe", pure: false });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'myPipe', pure: false,
                    standalone: false
                }]
        }] });
export class MyPurePipe {
    transform(value, ...args) {
        return value;
    }
}
MyPurePipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPurePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
MyPurePipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPurePipe, isStandalone: false, name: "myPurePipe" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPurePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'myPurePipe',
                    pure: true,
                    standalone: false
                }]
        }] });
export class MyApp {
    constructor() {
        this.name = 'World';
        this.size = 0;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: '{{name | myPipe:size | myPurePipe:size }}<p>{{ name | myPipe:1:2:3:4:5 }} {{ name ? 1 : 2 | myPipe }}</p>', isInline: true, dependencies: [{ kind: "pipe", type: MyPipe, name: "myPipe" }, { kind: "pipe", type: MyPurePipe, name: "myPurePipe" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: '{{name | myPipe:size | myPurePipe:size }}<p>{{ name | myPipe:1:2:3:4:5 }} {{ name ? 1 : 2 | myPipe }}</p>',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyPipe, MyPurePipe, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyPipe, MyPurePipe, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: pipes.d.ts
 ****************************************************************************************************/
import { OnDestroy, PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyPipe implements PipeTransform, OnDestroy {
    transform(value: any, ...args: any[]): any;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe", false>;
}
export declare class MyPurePipe implements PipeTransform {
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPurePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPurePipe, "myPurePipe", false>;
}
export declare class MyApp {
    name: string;
    size: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
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
MyPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
MyPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, isStandalone: false, name: "myPipe", pure: false });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'myPipe', pure: false,
                    standalone: false
                }]
        }] });
export class MyApp {
    constructor() {
        this.name = '';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: '0:{{name | myPipe}}1:{{name | myPipe:1}}2:{{name | myPipe:1:2}}3:{{name | myPipe:1:2:3}}4:{{name | myPipe:1:2:3:4}}', isInline: true, dependencies: [{ kind: "pipe", type: MyPipe, name: "myPipe" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: '0:{{name | myPipe}}1:{{name | myPipe:1}}2:{{name | myPipe:1:2}}3:{{name | myPipe:1:2:3}}4:{{name | myPipe:1:2:3:4}}',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyPipe, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyPipe, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: pipe_invocation.d.ts
 ****************************************************************************************************/
import { OnDestroy, PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyPipe implements PipeTransform, OnDestroy {
    transform(value: any, ...args: any[]): any;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe", false>;
}
export declare class MyApp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
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
MyPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Pipe });
MyPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, isStandalone: false, name: "myPipe" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'myPipe',
                    standalone: false
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }] });
export class MyOtherPipe {
    constructor(changeDetectorRef) { }
    transform(value, ...args) {
        return value;
    }
}
MyOtherPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, deps: [{ token: i0.ChangeDetectorRef, optional: true }], target: i0.ɵɵFactoryTarget.Pipe });
MyOtherPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, isStandalone: false, name: "myOtherPipe" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'myOtherPipe',
                    standalone: false
                }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef, decorators: [{
                    type: Optional
                }] }] });
export class MyApp {
    constructor() {
        this.name = 'World';
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: '{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>', isInline: true, dependencies: [{ kind: "pipe", type: MyPipe, name: "myPipe" }, { kind: "pipe", type: MyOtherPipe, name: "myOtherPipe" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app', template: '{{name | myPipe }}<p>{{ name | myOtherPipe }}</p>',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyPipe, MyOtherPipe, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyPipe, MyOtherPipe, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: pipe_di_change_detector_ref.d.ts
 ****************************************************************************************************/
import { ChangeDetectorRef, PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyPipe implements PipeTransform {
    constructor(changeDetectorRef: ChangeDetectorRef);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe", false>;
}
export declare class MyOtherPipe implements PipeTransform {
    constructor(changeDetectorRef: ChangeDetectorRef);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherPipe, [{ optional: true; }]>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyOtherPipe, "myOtherPipe", false>;
}
export declare class MyApp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyPipe, typeof MyOtherPipe, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: nameless_pipe.js
 ****************************************************************************************************/
import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
// TODO(crisbeto): remove `null!` from the pipes when public API is updated.
export class PipeWithoutName {
    transform(value) {
        return value;
    }
}
PipeWithoutName.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeWithoutName, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
PipeWithoutName.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeWithoutName, isStandalone: true, name: "PipeWithoutName" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeWithoutName, decorators: [{
            type: Pipe,
            args: [null]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nameless_pipe.d.ts
 ****************************************************************************************************/
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class PipeWithoutName implements PipeTransform {
    transform(value: unknown): unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<PipeWithoutName, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PipeWithoutName, null, true>;
}

