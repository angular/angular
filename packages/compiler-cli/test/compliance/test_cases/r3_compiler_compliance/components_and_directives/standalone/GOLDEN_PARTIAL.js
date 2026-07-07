/****************************************************************************************************
 * PARTIAL FILE: component.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class OtherCmp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: OtherCmp, isStandalone: true, selector: "other-cmp", ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'other-cmp',
                    template: '',
                }]
        }] });
export class StandaloneCmp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: StandaloneCmp, isStandalone: true, selector: "ng-component", ngImport: i0, template: '<other-cmp></other-cmp>', isInline: true, dependencies: [{ kind: "component", type: OtherCmp, selector: "other-cmp" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneCmp, decorators: [{
            type: Component,
            args: [{
                    template: '<other-cmp></other-cmp>',
                    imports: [OtherCmp],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: component.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class OtherCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<OtherCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OtherCmp, "other-cmp", never, {}, {}, never, never, true, never>;
}
export declare class StandaloneCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StandaloneCmp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class StandaloneDir {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: StandaloneDir, isStandalone: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneDir, decorators: [{
            type: Directive,
            args: [{}]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class StandaloneDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<StandaloneDir, never, never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: pipe.js
 ****************************************************************************************************/
import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class StandalonePipe {
    transform(value) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandalonePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandalonePipe, isStandalone: true, name: "stpipe" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandalonePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'stpipe',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: pipe.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class StandalonePipe {
    transform(value: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<StandalonePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<StandalonePipe, "stpipe", true>;
}

/****************************************************************************************************
 * PARTIAL FILE: imports.js
 ****************************************************************************************************/
import { Component, Directive, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class NotStandaloneDir {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NotStandaloneDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: NotStandaloneDir, isStandalone: false, selector: "[not-standalone]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NotStandaloneDir, decorators: [{
            type: Directive,
            args: [{
                    selector: '[not-standalone]',
                    standalone: false
                }]
        }] });
export class NotStandalonePipe {
    transform(value) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NotStandalonePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NotStandalonePipe, isStandalone: false, name: "nspipe" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NotStandalonePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'nspipe',
                    standalone: false
                }]
        }] });
export class NotStandaloneStuffModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NotStandaloneStuffModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NotStandaloneStuffModule, declarations: [NotStandaloneDir, NotStandalonePipe], exports: [NotStandaloneDir, NotStandalonePipe] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NotStandaloneStuffModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NotStandaloneStuffModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [NotStandaloneDir, NotStandalonePipe],
                    exports: [NotStandaloneDir, NotStandalonePipe],
                }]
        }] });
export class IndirectDir {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IndirectDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: IndirectDir, isStandalone: true, selector: "[indirect]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IndirectDir, decorators: [{
            type: Directive,
            args: [{
                    selector: '[indirect]',
                }]
        }] });
export class IndirectPipe {
    transform(value) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IndirectPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IndirectPipe, isStandalone: true, name: "indirectpipe" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IndirectPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'indirectpipe',
                }]
        }] });
export class SomeModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeModule, imports: [IndirectDir, IndirectPipe], exports: [NotStandaloneStuffModule, IndirectDir, IndirectPipe] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeModule, imports: [NotStandaloneStuffModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [IndirectDir, IndirectPipe],
                    exports: [NotStandaloneStuffModule, IndirectDir, IndirectPipe],
                }]
        }] });
export class DirectDir {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DirectDir, isStandalone: true, selector: "[direct]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectDir, decorators: [{
            type: Directive,
            args: [{
                    selector: '[direct]',
                }]
        }] });
export class DirectPipe {
    transform(value) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectPipe, isStandalone: true, name: "directpipe" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'directpipe',
                }]
        }] });
export class TestCmp {
    data = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: true, selector: "test-cmp", ngImport: i0, template: `
    <p>Reference some non-standalone things:<span not-standalone>{{data | nspipe}}</span></p>
    <p>Reference some indirect standalone things:<span indirect>{{data | indirectpipe}}</span></p>
    <p>Reference some standalone things directly:<span direct>{{data | directpipe}}</span></p>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: SomeModule }, { kind: "directive", type: NotStandaloneDir, selector: "[not-standalone]" }, { kind: "directive", type: IndirectDir, selector: "[indirect]" }, { kind: "directive", type: DirectDir, selector: "[direct]" }, { kind: "pipe", type: NotStandalonePipe, name: "nspipe" }, { kind: "pipe", type: IndirectPipe, name: "indirectpipe" }, { kind: "pipe", type: DirectPipe, name: "directpipe" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'test-cmp',
                    template: `
    <p>Reference some non-standalone things:<span not-standalone>{{data | nspipe}}</span></p>
    <p>Reference some indirect standalone things:<span indirect>{{data | indirectpipe}}</span></p>
    <p>Reference some standalone things directly:<span direct>{{data | directpipe}}</span></p>
  `,
                    imports: [SomeModule, DirectDir, DirectPipe],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: imports.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class NotStandaloneDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<NotStandaloneDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NotStandaloneDir, "[not-standalone]", never, {}, {}, never, never, false, never>;
}
export declare class NotStandalonePipe {
    transform(value: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<NotStandalonePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<NotStandalonePipe, "nspipe", false>;
}
export declare class NotStandaloneStuffModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<NotStandaloneStuffModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NotStandaloneStuffModule, [typeof NotStandaloneDir, typeof NotStandalonePipe], never, [typeof NotStandaloneDir, typeof NotStandalonePipe]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NotStandaloneStuffModule>;
}
export declare class IndirectDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<IndirectDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IndirectDir, "[indirect]", never, {}, {}, never, never, true, never>;
}
export declare class IndirectPipe {
    transform(value: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<IndirectPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<IndirectPipe, "indirectpipe", true>;
}
export declare class SomeModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<SomeModule, never, [typeof IndirectDir, typeof IndirectPipe], [typeof NotStandaloneStuffModule, typeof IndirectDir, typeof IndirectPipe]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<SomeModule>;
}
export declare class DirectDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectDir, "[direct]", never, {}, {}, never, never, true, never>;
}
export declare class DirectPipe {
    transform(value: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<DirectPipe, "directpipe", true>;
}
export declare class TestCmp {
    data: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: recursive.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class RecursiveComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RecursiveComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: RecursiveComponent, isStandalone: true, selector: "recursive-cmp", ngImport: i0, template: '<recursive-cmp></recursive-cmp>', isInline: true, dependencies: [{ kind: "component", type: RecursiveComponent, selector: "recursive-cmp" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RecursiveComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'recursive-cmp',
                    // Simple recursion. Note: no `imports`.
                    template: '<recursive-cmp></recursive-cmp>',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: recursive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class RecursiveComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<RecursiveComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RecursiveComponent, "recursive-cmp", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: module_optimization.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class StandaloneCmp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: StandaloneCmp, isStandalone: true, selector: "standalone-cmp", ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'standalone-cmp',
                    template: '',
                }]
        }] });
export class StandaloneDir {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: StandaloneDir, isStandalone: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneDir, decorators: [{
            type: Directive,
            args: [{}]
        }] });
export class Module {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, imports: [StandaloneCmp, StandaloneDir] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, decorators: [{
            type: NgModule,
            args: [{
                    imports: [StandaloneCmp, StandaloneDir],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: module_optimization.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class StandaloneCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StandaloneCmp, "standalone-cmp", never, {}, {}, never, never, true, never>;
}
export declare class StandaloneDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<StandaloneDir, never, never, {}, {}, never, never, true, never>;
}
export declare class Module {
    static ɵfac: i0.ɵɵFactoryDeclaration<Module, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<Module, never, [typeof StandaloneCmp, typeof StandaloneDir], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<Module>;
}

/****************************************************************************************************
 * PARTIAL FILE: forward_ref.js
 ****************************************************************************************************/
import { Component, forwardRef } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: true, selector: "test", ngImport: i0, template: '<other-standalone></other-standalone>', isInline: true, dependencies: [{ kind: "component", type: i0.forwardRef(() => StandaloneComponent), selector: "other-standalone" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'test',
                    imports: [forwardRef(() => StandaloneComponent)],
                    template: '<other-standalone></other-standalone>',
                }]
        }] });
export class StandaloneComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: StandaloneComponent, isStandalone: true, selector: "other-standalone", ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'other-standalone',
                    template: '',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: forward_ref.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "test", never, {}, {}, never, never, true, never>;
}
export declare class StandaloneComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StandaloneComponent, "other-standalone", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: foreign_component.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export function FancyButton() { }
// @angular/core does not expose the `ForeignComponent` type this should return.
function frameworkImport(component) {
    return () => { };
}
export class TestCmp {
    title = 'Submit';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: true, selector: "main", ngImport: i0, template: `
    <FancyButton class="btn-cls" unsafe-attr="value" [label]="title" [unsafe-input]="title" />
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'main',
                    template: `
    <FancyButton class="btn-cls" unsafe-attr="value" [label]="title" [unsafe-input]="title" />
  `,
                    // @ts-ignore: @angular/core does not expose the `foreignImports` property.
                    foreignImports: [
                        // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
                        frameworkImport(FancyButton),
                    ],
                }]
        }] });
export class TestCmpChildren {
    title = 'Submit';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmpChildren, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmpChildren, isStandalone: true, selector: "main-children", ngImport: i0, template: `
    <FancyButton [label]="title">
      @content (icon) {
        <span>Icon!</span>
      }
      @content (description) {
        <span>Description text</span>
      }
      <span>Other children</span>
    </FancyButton>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmpChildren, decorators: [{
            type: Component,
            args: [{
                    selector: 'main-children',
                    template: `
    <FancyButton [label]="title">
      @content (icon) {
        <span>Icon!</span>
      }
      @content (description) {
        <span>Description text</span>
      }
      <span>Other children</span>
    </FancyButton>
  `,
                    // @ts-ignore: @angular/core does not expose the `foreignImports` property.
                    foreignImports: [
                        // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
                        frameworkImport(FancyButton),
                    ],
                }]
        }] });
export class TestCmpRenderProps {
    title = 'Submit';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmpRenderProps, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmpRenderProps, isStandalone: true, selector: "main-render-props", ngImport: i0, template: `
    <FancyButton [label]="title">
      @content (items; let item, index) {
        <span>#{{index}}: {{item}}</span>
      }
    </FancyButton>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmpRenderProps, decorators: [{
            type: Component,
            args: [{
                    selector: 'main-render-props',
                    template: `
    <FancyButton [label]="title">
      @content (items; let item, index) {
        <span>#{{index}}: {{item}}</span>
      }
    </FancyButton>
  `,
                    // @ts-ignore: @angular/core does not expose the `foreignImports` property.
                    foreignImports: [
                        // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
                        frameworkImport(FancyButton),
                    ],
                }]
        }] });
export class TestCmpConditional {
    title = 'Submit';
    condition = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmpConditional, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmpConditional, isStandalone: true, selector: "main-conditional", ngImport: i0, template: `
    @if (condition) {
      <FancyButton [label]="title" />
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmpConditional, decorators: [{
            type: Component,
            args: [{
                    selector: 'main-conditional',
                    template: `
    @if (condition) {
      <FancyButton [label]="title" />
    }
  `,
                    // @ts-ignore: @angular/core does not expose the `foreignImports` property.
                    foreignImports: [
                        // @ts-ignore: @angular/core does not expose the `ForeignComponent` type this expects.
                        frameworkImport(FancyButton),
                    ],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: foreign_component.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare function FancyButton(): void;
export declare class TestCmp {
    title: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "main", never, {}, {}, never, never, true, never>;
}
export declare class TestCmpChildren {
    title: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmpChildren, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmpChildren, "main-children", never, {}, {}, never, never, true, never>;
}
export declare class TestCmpRenderProps {
    title: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmpRenderProps, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmpRenderProps, "main-render-props", never, {}, {}, never, never, true, never>;
}
export declare class TestCmpConditional {
    title: string;
    condition: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmpConditional, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmpConditional, "main-conditional", never, {}, {}, never, never, true, never>;
}

