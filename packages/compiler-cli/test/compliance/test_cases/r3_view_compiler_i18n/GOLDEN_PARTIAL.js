/****************************************************************************************************
 * PARTIAL FILE: repeated_placeholder.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `
    <div i18n>Hello, {{ placeholder }}! You are a very good {{ placeholder }}.</div>
    <div i18n>Hello, {{ placeholder // i18n(ph = "ph") }}! Hello again {{ placeholder // i18n(ph = "ph") }}.</div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div i18n>Hello, {{ placeholder }}! You are a very good {{ placeholder }}.</div>
    <div i18n>Hello, {{ placeholder // i18n(ph = "ph") }}! Hello again {{ placeholder // i18n(ph = "ph") }}.</div>
  `,
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: repeated_placeholder.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    placeholder: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: multiple_pipes.js
 ****************************************************************************************************/
import { Component, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `
  <div i18n>{{ valueA | pipeA }} and {{ valueB | pipeB }}</div>
  <div i18n><span>{{ valueA | pipeA }}</span> and {{ valueB | pipeB }} <span>and {{ valueC | pipeC }}</span></div>
`, isInline: true, dependencies: [{ kind: "pipe", type: i0.forwardRef(() => PipeA), name: "pipeA" }, { kind: "pipe", type: i0.forwardRef(() => PipeB), name: "pipeB" }, { kind: "pipe", type: i0.forwardRef(() => PipeC), name: "pipeC" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
  <div i18n>{{ valueA | pipeA }} and {{ valueB | pipeB }}</div>
  <div i18n><span>{{ valueA | pipeA }}</span> and {{ valueB | pipeB }} <span>and {{ valueC | pipeC }}</span></div>
`,
                    standalone: false
                }]
        }] });
export class PipeA {
    transform() {
        return null;
    }
}
PipeA.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeA, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
PipeA.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeA, isStandalone: false, name: "pipeA" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeA, decorators: [{
            type: Pipe,
            args: [{
                    name: 'pipeA',
                    standalone: false
                }]
        }] });
export class PipeB {
    transform() {
        return null;
    }
}
PipeB.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeB, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
PipeB.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeB, isStandalone: false, name: "pipeB" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeB, decorators: [{
            type: Pipe,
            args: [{
                    name: 'pipeB',
                    standalone: false
                }]
        }] });
export class PipeC {
    transform() {
        return null;
    }
}
PipeC.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeC, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
PipeC.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeC, isStandalone: false, name: "pipeC" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PipeC, decorators: [{
            type: Pipe,
            args: [{
                    name: 'pipeC',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, PipeA, PipeB, PipeC] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent, PipeA, PipeB, PipeC] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: multiple_pipes.d.ts
 ****************************************************************************************************/
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComponent {
    valueA: 0;
    valueB: 0;
    valueC: 0;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class PipeA implements PipeTransform {
    transform(): null;
    static ɵfac: i0.ɵɵFactoryDeclaration<PipeA, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PipeA, "pipeA", false>;
}
export declare class PipeB implements PipeTransform {
    transform(): null;
    static ɵfac: i0.ɵɵFactoryDeclaration<PipeB, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PipeB, "pipeB", false>;
}
export declare class PipeC implements PipeTransform {
    transform(): null;
    static ɵfac: i0.ɵɵFactoryDeclaration<PipeC, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PipeC, "pipeC", false>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof PipeA, typeof PipeB, typeof PipeC], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: icu_and_i18n.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", ngImport: i0, template: `
    <div i18n>
      <div *ngFor="let diskView of disks">
        {{diskView.name}} has {diskView.length, plural, =1 {VM} other {VMs}}
      </div>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div i18n>
      <div *ngFor="let diskView of disks">
        {{diskView.name}} has {diskView.length, plural, =1 {VM} other {VMs}}
      </div>
    </div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: icu_and_i18n.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    disks: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

