/****************************************************************************************************
 * PARTIAL FILE: root_template.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleComponent {
}
SimpleComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
SimpleComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SimpleComponent, isStandalone: false, selector: "simple", ngImport: i0, template: '<div><ng-content></ng-content></div>', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'simple', template: '<div><ng-content></ng-content></div>',
                    standalone: false
                }]
        }] });
export class ComplexComponent {
}
ComplexComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ComplexComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
ComplexComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ComplexComponent, isStandalone: false, selector: "complex", ngImport: i0, template: `
    <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
    <div id="second"><ng-content SELECT="span[title=toSecond]"></ng-content></div>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ComplexComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'complex',
                    template: `
    <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
    <div id="second"><ng-content SELECT="span[title=toSecond]"></ng-content></div>`,
                    standalone: false
                }]
        }] });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: '<simple>content</simple> <complex></complex>', isInline: true, dependencies: [{ kind: "component", type: SimpleComponent, selector: "simple" }, { kind: "component", type: ComplexComponent, selector: "complex" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app', template: '<simple>content</simple> <complex></complex>',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SimpleComponent, ComplexComponent, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SimpleComponent, ComplexComponent, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: root_template.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleComponent, "simple", never, {}, {}, never, ["*"], false, never>;
}
export declare class ComplexComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<ComplexComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ComplexComponent, "complex", never, {}, {}, never, ["span[title=toFirst]", "span[title=toSecond]"], false, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SimpleComponent, typeof ComplexComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: multiple_wildcards.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class Cmp {
}
Cmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Cmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Cmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Cmp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <ng-content></ng-content>
    <ng-content select="[spacer]"></ng-content>
    <ng-content></ng-content>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Cmp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <ng-content></ng-content>
    <ng-content select="[spacer]"></ng-content>
    <ng-content></ng-content>
  `,
                    standalone: false
                }]
        }] });
class Module {
}
Module.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
Module.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, declarations: [Cmp] });
Module.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, decorators: [{
            type: NgModule,
            args: [{ declarations: [Cmp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: multiple_wildcards.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: nested_template.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class Cmp {
}
Cmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Cmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Cmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Cmp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <div id="second" *ngIf="visible">
      <ng-content SELECT="span[title=toFirst]"></ng-content>
    </div>
    <div id="third" *ngIf="visible">
      No ng-content, no instructions generated.
    </div>
    <ng-template>
      '*' selector: <ng-content></ng-content>
    </ng-template>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Cmp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div id="second" *ngIf="visible">
      <ng-content SELECT="span[title=toFirst]"></ng-content>
    </div>
    <div id="third" *ngIf="visible">
      No ng-content, no instructions generated.
    </div>
    <ng-template>
      '*' selector: <ng-content></ng-content>
    </ng-template>
  `,
                    standalone: false
                }]
        }] });
class Module {
}
Module.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
Module.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, declarations: [Cmp] });
Module.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, decorators: [{
            type: NgModule,
            args: [{ declarations: [Cmp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_template.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: root_and_nested.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class Cmp {
}
Cmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Cmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Cmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Cmp, isStandalone: false, selector: "ng-component", ngImport: i0, template: `
    <ng-content select="[id=toMainBefore]"></ng-content>
    <ng-template>
      <ng-content select="[id=toTemplate]"></ng-content>
      <ng-template>
        <ng-content select="[id=toNestedTemplate]"></ng-content>
      </ng-template>
    </ng-template>
    <ng-template>
      '*' selector in a template: <ng-content></ng-content>
    </ng-template>
    <ng-content select="[id=toMainAfter]"></ng-content>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Cmp, decorators: [{
            type: Component,
            args: [{
                    template: `
    <ng-content select="[id=toMainBefore]"></ng-content>
    <ng-template>
      <ng-content select="[id=toTemplate]"></ng-content>
      <ng-template>
        <ng-content select="[id=toNestedTemplate]"></ng-content>
      </ng-template>
    </ng-template>
    <ng-template>
      '*' selector in a template: <ng-content></ng-content>
    </ng-template>
    <ng-content select="[id=toMainAfter]"></ng-content>
  `,
                    standalone: false
                }]
        }] });
class Module {
}
Module.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
Module.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, declarations: [Cmp] });
Module.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, decorators: [{
            type: NgModule,
            args: [{ declarations: [Cmp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: root_and_nested.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_selector.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleComponent {
}
SimpleComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
SimpleComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SimpleComponent, isStandalone: false, selector: "simple", ngImport: i0, template: '<div><ng-content select="[title]"></ng-content></div>', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'simple', template: '<div><ng-content select="[title]"></ng-content></div>',
                    standalone: false
                }]
        }] });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: '<simple><h1 ngProjectAs="[title]"></h1></simple>', isInline: true, dependencies: [{ kind: "component", type: SimpleComponent, selector: "simple" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app', template: '<simple><h1 ngProjectAs="[title]"></h1></simple>',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyApp, SimpleComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyApp, SimpleComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleComponent, "simple", never, {}, {}, never, ["[title]"], false, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp, typeof SimpleComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_compound_selector.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleComponent {
}
SimpleComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
SimpleComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SimpleComponent, isStandalone: false, selector: "simple", ngImport: i0, template: '<div><ng-content select="[title]"></ng-content></div>', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'simple', template: '<div><ng-content select="[title]"></ng-content></div>',
                    standalone: false
                }]
        }] });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: '<simple><h1 ngProjectAs="[title],[header]"></h1></simple>', isInline: true, dependencies: [{ kind: "component", type: SimpleComponent, selector: "simple" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app', template: '<simple><h1 ngProjectAs="[title],[header]"></h1></simple>',
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SimpleComponent, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [SimpleComponent, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_compound_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleComponent, "simple", never, {}, {}, never, ["[title]"], false, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SimpleComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_attribute.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.show = true;
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: '<div *ngIf="show" ngProjectAs=".someclass"></div>', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app', template: '<div *ngIf="show" ngProjectAs=".someclass"></div>',
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_attribute.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    show: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_content_with_structural_dir.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleComponent {
}
SimpleComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
SimpleComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SimpleComponent, isStandalone: false, selector: "simple", ngImport: i0, template: '<ng-content *ngIf="showContent"></ng-content>', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SimpleComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'simple', template: '<ng-content *ngIf="showContent"></ng-content>',
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_content_with_structural_dir.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<SimpleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SimpleComponent, "simple", never, {}, {}, never, ["*"], false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: project_as_ng_content.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class Card {
}
Card.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Card, deps: [], target: i0.ɵɵFactoryTarget.Component });
Card.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Card, isStandalone: false, selector: "card", ngImport: i0, template: `
		<ng-content select="[card-title]"></ng-content>
		---
		<ng-content select="[card-content]"></ng-content>
	`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Card, decorators: [{
            type: Component,
            args: [{
                    selector: 'card',
                    template: `
		<ng-content select="[card-title]"></ng-content>
		---
		<ng-content select="[card-content]"></ng-content>
	`,
                    standalone: false
                }]
        }] });
class CardWithTitle {
}
CardWithTitle.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CardWithTitle, deps: [], target: i0.ɵɵFactoryTarget.Component });
CardWithTitle.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: CardWithTitle, isStandalone: false, selector: "card-with-title", ngImport: i0, template: `
		<card>
			<h1 ngProjectAs="[card-title]">Title</h1>
			<ng-content ngProjectAs="[card-content]"></ng-content>
		</card>
	`, isInline: true, dependencies: [{ kind: "component", type: Card, selector: "card" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CardWithTitle, decorators: [{
            type: Component,
            args: [{
                    selector: 'card-with-title',
                    template: `
		<card>
			<h1 ngProjectAs="[card-title]">Title</h1>
			<ng-content ngProjectAs="[card-content]"></ng-content>
		</card>
	`,
                    standalone: false
                }]
        }] });
class App {
}
App.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: App, deps: [], target: i0.ɵɵFactoryTarget.Component });
App.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: App, isStandalone: false, selector: "app", ngImport: i0, template: `
		<card-with-title>content</card-with-title>
	`, isInline: true, dependencies: [{ kind: "component", type: CardWithTitle, selector: "card-with-title" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: App, decorators: [{
            type: Component,
            args: [{
                    selector: 'app',
                    template: `
		<card-with-title>content</card-with-title>
	`,
                    standalone: false
                }]
        }] });
class Module {
}
Module.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
Module.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, declarations: [Card, CardWithTitle, App] });
Module.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Module, decorators: [{
            type: NgModule,
            args: [{ declarations: [Card, CardWithTitle, App] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: project_as_ng_content.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: ng_content_fallback.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComponent {
    constructor() {
        this.type = 'complex';
        this.hasFooter = false;
        this.hasStructural = false;
    }
}
TestComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestComponent, isStandalone: true, selector: "test", ngImport: i0, template: `
    <ng-content select="basic">Basic fallback</ng-content>

    <div>
      <ng-content>
        <h1>This is {{type}} <strong>content</strong>!</h1>
      </ng-content>
    </div>

    @if (hasFooter) {
      <ng-content select="footer">
        Inside control flow
      </ng-content>
    }

    <ng-content select="structural" *ngIf="hasStructural">
      <h2>With a structural directive</h2>
    </ng-content>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'test',
                    template: `
    <ng-content select="basic">Basic fallback</ng-content>

    <div>
      <ng-content>
        <h1>This is {{type}} <strong>content</strong>!</h1>
      </ng-content>
    </div>

    @if (hasFooter) {
      <ng-content select="footer">
        Inside control flow
      </ng-content>
    }

    <ng-content select="structural" *ngIf="hasStructural">
      <h2>With a structural directive</h2>
    </ng-content>
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_content_fallback.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComponent {
    type: string;
    hasFooter: boolean;
    hasStructural: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComponent, "test", never, {}, {}, never, ["basic", "*", "footer", "structural"], true, never>;
}

