/****************************************************************************************************
 * PARTIAL FILE: nested_template_context.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
    constructor() {
        this.component = this;
    }
    format(outer, middle, inner) { }
    onClick(outer, middle, inner) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <ul *ngFor="let outer of items">
      <li *ngFor="let middle of outer.items">
        <div *ngFor="let inner of items"
             (click)="onClick(outer, middle, inner)"
             [title]="format(outer, middle, inner, component)"
             >
          {{format(outer, middle, inner, component)}}
        </div>
      </li>
    </ul>`, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <ul *ngFor="let outer of items">
      <li *ngFor="let middle of outer.items">
        <div *ngFor="let inner of items"
             (click)="onClick(outer, middle, inner)"
             [title]="format(outer, middle, inner, component)"
             >
          {{format(outer, middle, inner, component)}}
        </div>
      </li>
    </ul>`
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_template_context.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    component: this;
    format(outer: any, middle: any, inner: any): void;
    onClick(outer: any, middle: any, inner: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: nested_template_context_many_bindings.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
    constructor() {
        this._data = [1, 2, 3];
    }
    _handleClick(d, i) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div *ngFor="let d of _data; let i = index" (click)="_handleClick(d, i)"></div>
  `, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div *ngFor="let d of _data; let i = index" (click)="_handleClick(d, i)"></div>
  `
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_template_context_many_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    _data: number[];
    _handleClick(d: any, i: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: implicit_receiver.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
    greet(val) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div *ngIf="true" (click)="greet(this)"></div>
    <div *ngIf="true" [id]="this"></div>
  `, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div *ngIf="true" (click)="greet(this)"></div>
    <div *ngIf="true" [id]="this"></div>
  `
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: implicit_receiver.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    greet(val: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_for_context_variables.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <span *ngFor="let item of items; index as i">
      {{ i }} - {{ item }}
    </span>
  `, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <span *ngFor="let item of items; index as i">
      {{ i }} - {{ item }}
    </span>
  `
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_for_context_variables.d.ts
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
 * PARTIAL FILE: ng_for_parent_context_variables.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div *ngFor="let item of items; index as i">
        <span *ngIf="showing">
          {{ i }} - {{ item }}
        </span>
    </div>`, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div *ngFor="let item of items; index as i">
        <span *ngIf="showing">
          {{ i }} - {{ item }}
        </span>
    </div>`
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_for_parent_context_variables.d.ts
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
 * PARTIAL FILE: template_context_skip.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div *ngFor="let outer of items">
      <div *ngFor="let middle of outer.items">
        <div *ngFor="let inner of middle.items">
          {{ middle.value }} - {{ name }}
        </div>
      </div>
    </div>`, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div *ngFor="let outer of items">
      <div *ngFor="let middle of outer.items">
        <div *ngFor="let inner of middle.items">
          {{ middle.value }} - {{ name }}
        </div>
      </div>
    </div>`
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: template_context_skip.d.ts
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
 * PARTIAL FILE: ng_template.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <ng-template [boundAttr]="b" attr="l">
      some-content
    </ng-template>`, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <ng-template [boundAttr]="b" attr="l">
      some-content
    </ng-template>`
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_template.d.ts
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
 * PARTIAL FILE: ng_template_local_ref.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<ng-template #foo>some-content</ng-template>', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '<ng-template #foo>some-content</ng-template>',
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_template_local_ref.d.ts
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
 * PARTIAL FILE: ng_template_output.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<ng-template (outDirective)="$event.doSth()"></ng-template>', isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '<ng-template (outDirective)="$event.doSth()"></ng-template>',
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_template_output.d.ts
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
 * PARTIAL FILE: ng_template_interpolated_prop.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
class WithInput {
    constructor() {
        this.dir = '';
    }
}
WithInput.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: WithInput, deps: [], target: i0.ɵɵFactoryTarget.Directive });
WithInput.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: WithInput, selector: "[dir]", inputs: { dir: "dir" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: WithInput, decorators: [{
            type: Directive,
            args: [{ selector: '[dir]' }]
        }], propDecorators: { dir: [{
                type: Input
            }] } });
class TestComp {
    constructor() {
        this.message = 'Hello';
    }
}
TestComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, selector: "my-app", ngImport: i0, template: '<ng-template dir="{{ message }}"></ng-template>', isInline: true });
export { TestComp };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: '<ng-template dir="{{ message }}"></ng-template>',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_template_interpolated_prop.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    message: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "my-app", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_template_interpolated_prop_with_structural_directive.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
class WithInput {
    constructor() {
        this.dir = '';
    }
}
WithInput.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: WithInput, deps: [], target: i0.ɵɵFactoryTarget.Directive });
WithInput.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: WithInput, selector: "[dir]", inputs: { dir: "dir" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: WithInput, decorators: [{
            type: Directive,
            args: [{ selector: '[dir]' }]
        }], propDecorators: { dir: [{
                type: Input
            }] } });
class TestComp {
    constructor() {
        this.message = 'Hello';
    }
}
TestComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, selector: "my-app", ngImport: i0, template: '<ng-template *ngIf="true" dir="{{ message }}"></ng-template>', isInline: true });
export { TestComp };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: '<ng-template *ngIf="true" dir="{{ message }}"></ng-template>',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: ng_template_interpolated_prop_with_structural_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    message: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "my-app", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: unique_template_function_names.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class AComponent {
    constructor() {
        this.items = [4, 2];
    }
}
AComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
AComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: AComponent, selector: "a-component", ngImport: i0, template: `
    <div *ngFor="let item of items">
      <p *ngIf="item < 10">less than 10</p>
      <p *ngIf="item < 10">less than 10</p>
    </div>
    <div *ngFor="let item of items">
      <p *ngIf="item > 10">more than 10</p>
    </div>
  `, isInline: true });
export { AComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'a-component',
                    template: `
    <div *ngFor="let item of items">
      <p *ngIf="item < 10">less than 10</p>
      <p *ngIf="item < 10">less than 10</p>
    </div>
    <div *ngFor="let item of items">
      <p *ngIf="item > 10">more than 10</p>
    </div>
  `,
                }]
        }] });
class AModule {
}
AModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, declarations: [AComponent] });
AModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule });
export { AModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [AComponent] }]
        }] });
class BComponent {
    constructor() {
        this.items = [
            { subitems: [1, 3] },
            { subitems: [3, 7] },
        ];
    }
}
BComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
BComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: BComponent, selector: "b-component", ngImport: i0, template: `
    <div *ngFor="let item of items">
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem < 10">less than 10</p>
        <p *ngIf="subitem < 10">less than 10</p>
      </ng-container>
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem < 10">less than 10</p>
      </ng-container>
    </div>
    <div *ngFor="let item of items">
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem > 10">more than 10</p>
      </ng-container>
    </div>
  `, isInline: true });
export { BComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'b-component',
                    template: `
    <div *ngFor="let item of items">
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem < 10">less than 10</p>
        <p *ngIf="subitem < 10">less than 10</p>
      </ng-container>
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem < 10">less than 10</p>
      </ng-container>
    </div>
    <div *ngFor="let item of items">
      <ng-container *ngFor="let subitem of item.subitems">
        <p *ngIf="subitem > 10">more than 10</p>
      </ng-container>
    </div>
  `,
                }]
        }] });
class BModule {
}
BModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
BModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, declarations: [BComponent] });
BModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule });
export { BModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [BComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: unique_template_function_names.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class AComponent {
    items: number[];
    static ɵfac: i0.ɵɵFactoryDeclaration<AComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AComponent, "a-component", never, {}, {}, never, never, false, never>;
}
export declare class AModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AModule, [typeof AComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AModule>;
}
export declare class BComponent {
    items: {
        subitems: number[];
    }[];
    static ɵfac: i0.ɵɵFactoryDeclaration<BComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BComponent, "b-component", never, {}, {}, never, never, false, never>;
}
export declare class BModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BModule, [typeof BComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: unique_template_function_names_ng_content.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class AComponent {
    constructor() {
        this.show = true;
    }
}
AComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
AComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: AComponent, selector: "a-component", ngImport: i0, template: `
    <ng-content *ngIf="show"></ng-content>
  `, isInline: true });
export { AComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'a-component',
                    template: `
    <ng-content *ngIf="show"></ng-content>
  `,
                }]
        }] });
class BComponent {
    constructor() {
        this.show = true;
    }
}
BComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
BComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: BComponent, selector: "b-component", ngImport: i0, template: `
    <ng-content *ngIf="show"></ng-content>
  `, isInline: true });
export { BComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'b-component',
                    template: `
    <ng-content *ngIf="show"></ng-content>
  `,
                }]
        }] });
class AModule {
}
AModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
AModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, declarations: [AComponent, BComponent] });
AModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule });
export { AModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [AComponent, BComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: unique_template_function_names_ng_content.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class AComponent {
    show: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<AComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AComponent, "a-component", never, {}, {}, never, ["*"], false, never>;
}
export declare class BComponent {
    show: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<BComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BComponent, "b-component", never, {}, {}, never, ["*"], false, never>;
}
export declare class AModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AModule, [typeof AComponent, typeof BComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: unique_listener_function_names.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
    constructor() {
        this.items = [4, 2];
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
      <p (click)="$event">{{ item }}</p>
    </div>
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
    </div>
  `, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
      <p (click)="$event">{{ item }}</p>
    </div>
    <div *ngFor="let item of items">
      <p (click)="$event">{{ item }}</p>
    </div>
  `,
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: unique_listener_function_names.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    items: number[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: template_binding_pipe.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `<div *ngIf="val | pipe"></div>`, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `<div *ngIf="val | pipe"></div>`,
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: template_binding_pipe.d.ts
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
 * PARTIAL FILE: nested_ternary_operation.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    {{a?.b ? 1 : 2 }}`, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: `
    {{a?.b ? 1 : 2 }}`,
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: nested_ternary_operation.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    a: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: shorthand_property_declaration.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComponent {
    constructor() {
        this.a = 1;
        this.c = 3;
    }
    _handleClick(_value) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <div (click)="_handleClick({a, b: 2, c})"></div>
  `, isInline: true });
export { MyComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div (click)="_handleClick({a, b: 2, c})"></div>
  `
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: shorthand_property_declaration.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    a: number;
    c: number;
    _handleClick(_value: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: self_closing_tags.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComp {
}
MyComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComp, selector: "my-comp", ngImport: i0, template: 'hello', isInline: true });
export { MyComp };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, decorators: [{
            type: Component,
            args: [{ selector: 'my-comp', template: 'hello' }]
        }] });
class App {
}
App.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: App, deps: [], target: i0.ɵɵFactoryTarget.Component });
App.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: App, selector: "ng-component", ngImport: i0, template: `<my-comp/>`, isInline: true, dependencies: [{ kind: "component", type: MyComp, selector: "my-comp" }] });
export { App };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: App, decorators: [{
            type: Component,
            args: [{ template: `<my-comp/>` }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [App, MyComp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [App, MyComp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: self_closing_tags.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComp, "my-comp", never, {}, {}, never, never, false, never>;
}
export declare class App {
    static ɵfac: i0.ɵɵFactoryDeclaration<App, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<App, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof App, typeof MyComp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: self_closing_tags_nested.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class MyComp {
}
MyComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComp, selector: "my-comp", ngImport: i0, template: 'hello', isInline: true });
export { MyComp };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComp, decorators: [{
            type: Component,
            args: [{ selector: 'my-comp', template: 'hello' }]
        }] });
class App {
}
App.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: App, deps: [], target: i0.ɵɵFactoryTarget.Component });
App.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: App, selector: "ng-component", ngImport: i0, template: `
    <my-comp title="a">Before<my-comp title="b"></my-comp>After</my-comp>
  `, isInline: true, dependencies: [{ kind: "component", type: MyComp, selector: "my-comp" }] });
export { App };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: App, decorators: [{
            type: Component,
            args: [{
                    template: `
    <my-comp title="a">Before<my-comp title="b"></my-comp>After</my-comp>
  `
                }]
        }] });
class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [App, MyComp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
export { MyModule };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [App, MyComp] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: self_closing_tags_nested.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComp, "my-comp", never, {}, {}, never, never, false, never>;
}
export declare class App {
    static ɵfac: i0.ɵɵFactoryDeclaration<App, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<App, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof App, typeof MyComp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

