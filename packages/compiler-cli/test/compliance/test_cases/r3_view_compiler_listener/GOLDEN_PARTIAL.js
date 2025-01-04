/****************************************************************************************************
 * PARTIAL FILE: element_listener.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    onClick(event) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `<div (click)="onClick($event); 1 == 1"></div>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component', template: `<div (click)="onClick($event); 1 == 1"></div>`,
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
 * PARTIAL FILE: element_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    onClick(event: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: component_listener.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: `<div>My App</div>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app', template: `<div>My App</div>`,
                    standalone: false
                }]
        }] });
export class MyComponent {
    onClick(event) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `<my-app (click)="onClick($event);"></my-app>`, isInline: true, dependencies: [{ kind: "component", type: MyApp, selector: "my-app" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component', template: `<my-app (click)="onClick($event);"></my-app>`,
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent, MyApp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: component_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyComponent {
    onClick(event: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: shared_snapshot_listeners.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    onClick(name) { }
    onClick2(name) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `
    <div *ngIf="showing">
      <div (click)="onClick(foo)"></div>
      <button (click)="onClick2(bar)"></button>
    </div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div *ngIf="showing">
      <div (click)="onClick(foo)"></div>
      <button (click)="onClick2(bar)"></button>
    </div>
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
 * PARTIAL FILE: shared_snapshot_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    onClick(name: any): void;
    onClick2(name: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: local_ref_before_listener.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    onClick(v) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `
    <button (click)="onClick(user.value)">Save</button>
    <input #user>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <button (click)="onClick(user.value)">Save</button>
    <input #user>
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
 * PARTIAL FILE: local_ref_before_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    onClick(v: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: same_element_chained_listeners.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    click() { }
    change() { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `<div (click)="click()" (change)="change()"></div>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `<div (click)="click()" (change)="change()"></div>`,
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
 * PARTIAL FILE: same_element_chained_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    click(): void;
    change(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: cross_element_chained_listeners.js
 ****************************************************************************************************/
import { Component, EventEmitter, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeComp {
    constructor() {
        this.update = new EventEmitter();
        this.delete = new EventEmitter();
    }
}
SomeComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
SomeComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SomeComp, isStandalone: false, selector: "some-comp", outputs: { update: "update", delete: "delete" }, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'some-comp',
                    template: '',
                    standalone: false
                }]
        }], propDecorators: { update: [{
                type: Output
            }], delete: [{
                type: Output
            }] } });
export class MyComponent {
    click() { }
    change() { }
    delete() { }
    update() { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `
      <div (click)="click()" (change)="change()"></div>
      <some-comp (update)="update()" (delete)="delete()"></some-comp>
    `, isInline: true, dependencies: [{ kind: "component", type: SomeComp, selector: "some-comp", outputs: ["update", "delete"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
      <div (click)="click()" (change)="change()"></div>
      <some-comp (update)="update()" (delete)="delete()"></some-comp>
    `,
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, SomeComp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent, SomeComp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: cross_element_chained_listeners.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class SomeComp {
    update: EventEmitter<any>;
    delete: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SomeComp, "some-comp", never, {}, { "update": "update"; "delete": "delete"; }, never, never, false, never>;
}
export declare class MyComponent {
    click(): void;
    change(): void;
    delete(): void;
    update(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof SomeComp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: template_chained_listeners.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `<ng-template (click)="click()" (change)="change()"></ng-template>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `<ng-template (click)="click()" (change)="change()"></ng-template>`,
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
 * PARTIAL FILE: template_chained_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: no_event_arg_listener.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    onClick() { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", ngImport: i0, template: `<div (click)="onClick();"></div>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `<div (click)="onClick();"></div>`,
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: no_event_arg_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    onClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: no_event_arg_host_listener.js
 ****************************************************************************************************/
import { Component, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    mousedown() { }
    click() {
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "ng-component", host: { listeners: { "mousedown": "mousedown()", "click": "click()" } }, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: '',
                    host: {
                        '(mousedown)': 'mousedown()',
                    },
                    standalone: false
                }]
        }], propDecorators: { click: [{
                type: HostListener,
                args: ['click']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: no_event_arg_host_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    mousedown(): void;
    click(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: has_event_arg_host_listener.js
 ****************************************************************************************************/
import { Directive, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    click(target) {
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyComponent.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, host: { listeners: { "click": "click($event.target)" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Directive
        }], propDecorators: { click: [{
                type: HostListener,
                args: ['click', ['$event.target']]
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: has_event_arg_host_listener.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    click(target: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyComponent, never, never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: event_arg_listener_implicit_meaning.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class Comp {
    c(event) { }
}
Comp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Comp, isStandalone: false, selector: "ng-component", ngImport: i0, template: '<div (click)="c($event)"></div>', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, decorators: [{
            type: Component,
            args: [{
                    template: '<div (click)="c($event)"></div>',
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: event_arg_listener_implicit_meaning.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: event_explicit_access.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class Comp {
    constructor() {
        this.$event = {};
    }
    c(value) { }
}
Comp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Comp, isStandalone: false, selector: "ng-component", ngImport: i0, template: '<div (click)="c(this.$event)"></div>', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, decorators: [{
            type: Component,
            args: [{
                    template: '<div (click)="c(this.$event)"></div>',
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: event_explicit_access.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: event_in_property_binding.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class DivDir {
}
DivDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DivDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DivDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DivDir, isStandalone: false, selector: "div", inputs: { event: "event" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DivDir, decorators: [{
            type: Directive,
            args: [{
                    selector: 'div',
                    standalone: false
                }]
        }], propDecorators: { event: [{
                type: Input
            }] } });
class Comp {
    constructor() {
        this.$event = 1;
    }
}
Comp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Comp, isStandalone: false, selector: "ng-component", ngImport: i0, template: '<div [event]="$event"></div>', isInline: true, dependencies: [{ kind: "directive", type: DivDir, selector: "div", inputs: ["event"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, decorators: [{
            type: Component,
            args: [{
                    template: '<div [event]="$event"></div>',
                    standalone: false
                }]
        }] });
export class MyMod {
}
MyMod.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyMod.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [Comp, DivDir] });
MyMod.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, decorators: [{
            type: NgModule,
            args: [{ declarations: [Comp, DivDir] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: event_in_property_binding.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DivDir {
    event: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<DivDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DivDir, "div", never, { "event": { "alias": "event"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyMod {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyMod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyMod, [typeof Comp, typeof DivDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: event_arg_host_listener_implicit_meaning.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
class Dir {
    c(event) { }
}
Dir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Dir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
Dir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Dir, isStandalone: false, host: { listeners: { "click": "c($event)" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Dir, decorators: [{
            type: Directive,
            args: [{
                    host: { '(click)': 'c($event)' },
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: event_arg_host_listener_implicit_meaning.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: event_host_explicit_access.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
class Dir {
    constructor() {
        this.$event = {};
    }
    c(value) { }
}
Dir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Dir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
Dir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Dir, isStandalone: false, host: { listeners: { "click": "c(this.$event)" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Dir, decorators: [{
            type: Directive,
            args: [{
                    host: {
                        '(click)': 'c(this.$event)',
                    },
                    standalone: false
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: event_host_explicit_access.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: implicit_receiver_keyed_write_inside_template.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.message = '';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `
    <ng-template #template>
      <button (click)="this['mes' + 'sage'] = 'hello'">Click me</button>
    </ng-template>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <ng-template #template>
      <button (click)="this['mes' + 'sage'] = 'hello'">Click me</button>
    </ng-template>
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
 * PARTIAL FILE: implicit_receiver_keyed_write_inside_template.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    message: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: embedded_view_listener_context.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", ngImport: i0, template: `
    <ng-template let-obj>
      <button (click)="obj.value = 1">Change</button>
    </ng-template>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <ng-template let-obj>
      <button (click)="obj.value = 1">Change</button>
    </ng-template>
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
 * PARTIAL FILE: embedded_view_listener_context.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: simple_two_way.js
 ****************************************************************************************************/
import { Component, Directive, EventEmitter, Input, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class TestCmp {
    constructor() {
        this.name = '';
    }
}
TestCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: false, selector: "test-cmp", ngImport: i0, template: 'Name: <input [(ngModel)]="name">', isInline: true, dependencies: [{ kind: "directive", type: i0.forwardRef(() => NgModelDirective), selector: "[ngModel]", inputs: ["ngModel"], outputs: ["ngModelChanges"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'test-cmp',
                    template: 'Name: <input [(ngModel)]="name">',
                    standalone: false
                }]
        }] });
export class NgModelDirective {
    constructor() {
        this.ngModel = '';
        this.ngModelChanges = new EventEmitter();
    }
}
NgModelDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NgModelDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgModelDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: NgModelDirective, isStandalone: false, selector: "[ngModel]", inputs: { ngModel: "ngModel" }, outputs: { ngModelChanges: "ngModelChanges" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NgModelDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngModel]',
                    standalone: false
                }]
        }], propDecorators: { ngModel: [{
                type: Input
            }], ngModelChanges: [{
                type: Output
            }] } });
export class AppModule {
}
AppModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AppModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, declarations: [TestCmp, NgModelDirective] });
AppModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [TestCmp, NgModelDirective] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: simple_two_way.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class TestCmp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>;
}
export declare class NgModelDirective {
    ngModel: string;
    ngModelChanges: EventEmitter<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgModelDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgModelDirective, "[ngModel]", never, { "ngModel": { "alias": "ngModel"; "required": false; }; }, { "ngModelChanges": "ngModelChanges"; }, never, never, false, never>;
}
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, [typeof TestCmp, typeof NgModelDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AppModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_two_way.js
 ****************************************************************************************************/
import { Component, Directive, EventEmitter, Input, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class TestCmp {
    constructor() {
        this.name = '';
    }
}
TestCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: false, selector: "test-cmp", ngImport: i0, template: 'Name: <ng-template><input [(ngModel)]="name"></ng-template>', isInline: true, dependencies: [{ kind: "directive", type: i0.forwardRef(() => NgModelDirective), selector: "[ngModel]", inputs: ["ngModel"], outputs: ["ngModelChanges"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'test-cmp',
                    template: 'Name: <ng-template><input [(ngModel)]="name"></ng-template>',
                    standalone: false
                }]
        }] });
export class NgModelDirective {
    constructor() {
        this.ngModel = '';
        this.ngModelChanges = new EventEmitter();
    }
}
NgModelDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NgModelDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgModelDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: NgModelDirective, isStandalone: false, selector: "[ngModel]", inputs: { ngModel: "ngModel" }, outputs: { ngModelChanges: "ngModelChanges" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NgModelDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngModel]',
                    standalone: false
                }]
        }], propDecorators: { ngModel: [{
                type: Input
            }], ngModelChanges: [{
                type: Output
            }] } });
export class AppModule {
}
AppModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AppModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, declarations: [TestCmp, NgModelDirective] });
AppModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [TestCmp, NgModelDirective] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_two_way.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class TestCmp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>;
}
export declare class NgModelDirective {
    ngModel: string;
    ngModelChanges: EventEmitter<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgModelDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgModelDirective, "[ngModel]", never, { "ngModel": { "alias": "ngModel"; "required": false; }; }, { "ngModelChanges": "ngModelChanges"; }, never, never, false, never>;
}
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, [typeof TestCmp, typeof NgModelDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AppModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: multiple_statements.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "my-component", host: { listeners: { "click": "$event.preventDefault(); $event.target.blur()" } }, ngImport: i0, template: `
    <div (click)="$event.preventDefault(); $event.target.blur()"></div>
  `, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    host: { '(click)': '$event.preventDefault(); $event.target.blur()' },
                    template: `
    <div (click)="$event.preventDefault(); $event.target.blur()"></div>
  `
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: multiple_statements.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: mixed_one_way_two_way_listener_order.js
 ****************************************************************************************************/
import { Component, Directive, Input, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class Dir {
}
Dir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Dir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
Dir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Dir, isStandalone: true, selector: "[dir]", inputs: { a: "a", c: "c" }, outputs: { aChange: "aChange", b: "b", cChange: "cChange", d: "d" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Dir, decorators: [{
            type: Directive,
            args: [{ selector: '[dir]' }]
        }], propDecorators: { a: [{
                type: Input
            }], aChange: [{
                type: Output
            }], b: [{
                type: Output
            }], c: [{
                type: Input
            }], cChange: [{
                type: Output
            }], d: [{
                type: Output
            }] } });
export class App {
    constructor() {
        this.value = 'hi';
        this.noop = () => { };
    }
}
App.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: App, deps: [], target: i0.ɵɵFactoryTarget.Component });
App.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: App, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div dir [(a)]="value" (b)="noop()" [(c)]="value" (d)="noop()"></div>
  `, isInline: true, dependencies: [{ kind: "directive", type: Dir, selector: "[dir]", inputs: ["a", "c"], outputs: ["aChange", "b", "cChange", "d"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: App, decorators: [{
            type: Component,
            args: [{
                    imports: [Dir],
                    template: `
    <div dir [(a)]="value" (b)="noop()" [(c)]="value" (d)="noop()"></div>
  `,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: mixed_one_way_two_way_listener_order.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Dir {
    a: unknown;
    aChange: unknown;
    b: unknown;
    c: unknown;
    cChange: unknown;
    d: unknown;
    static ɵfac: i0.ɵɵFactoryDeclaration<Dir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Dir, "[dir]", never, { "a": { "alias": "a"; "required": false; }; "c": { "alias": "c"; "required": false; }; }, { "aChange": "aChange"; "b": "b"; "cChange": "cChange"; "d": "d"; }, never, never, true, never>;
}
export declare class App {
    value: string;
    noop: () => void;
    static ɵfac: i0.ɵɵFactoryDeclaration<App, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<App, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: two_way_binding_to_signal_loop_variable.js
 ****************************************************************************************************/
import { Component, Directive, model, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class NgModelDirective {
    constructor() {
        this.ngModel = model.required();
    }
}
NgModelDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NgModelDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgModelDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: NgModelDirective, isStandalone: true, selector: "[ngModel]", inputs: { ngModel: { classPropertyName: "ngModel", publicName: "ngModel", isSignal: true, isRequired: true, transformFunction: null } }, outputs: { ngModel: "ngModelChange" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NgModelDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngModel]',
                }]
        }] });
export class TestCmp {
    constructor() {
        this.names = [signal('Angular')];
    }
}
TestCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    @for (name of names; track $index) {
      <input [(ngModel)]="name" />
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgModelDirective, selector: "[ngModel]", inputs: ["ngModel"], outputs: ["ngModelChange"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    template: `
    @for (name of names; track $index) {
      <input [(ngModel)]="name" />
    }
  `,
                    imports: [NgModelDirective],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: two_way_binding_to_signal_loop_variable.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class NgModelDirective {
    ngModel: import("@angular/core").ModelSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgModelDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgModelDirective, "[ngModel]", never, { "ngModel": { "alias": "ngModel"; "required": true; "isSignal": true; }; }, { "ngModel": "ngModelChange"; }, never, never, true, never>;
}
export declare class TestCmp {
    names: import("@angular/core").WritableSignal<string>[];
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: two_way_to_any.js
 ****************************************************************************************************/
import { Component, Directive, model } from '@angular/core';
import * as i0 from "@angular/core";
export class NgModelDirective {
    constructor() {
        this.ngModel = model('');
    }
}
NgModelDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NgModelDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
NgModelDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: NgModelDirective, isStandalone: true, selector: "[ngModel]", inputs: { ngModel: { classPropertyName: "ngModel", publicName: "ngModel", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { ngModel: "ngModelChange" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NgModelDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[ngModel]' }]
        }] });
export class TestCmp {
    constructor() {
        this.value = 123;
    }
}
TestCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: true, selector: "test-cmp", ngImport: i0, template: '<input [(ngModel)]="$any(value)">', isInline: true, dependencies: [{ kind: "directive", type: NgModelDirective, selector: "[ngModel]", inputs: ["ngModel"], outputs: ["ngModelChange"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'test-cmp',
                    template: '<input [(ngModel)]="$any(value)">',
                    imports: [NgModelDirective],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: two_way_to_any.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class NgModelDirective {
    ngModel: import("@angular/core").ModelSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgModelDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgModelDirective, "[ngModel]", never, { "ngModel": { "alias": "ngModel"; "required": false; "isSignal": true; }; }, { "ngModel": "ngModelChange"; }, never, never, true, never>;
}
export declare class TestCmp {
    value: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never>;
}

