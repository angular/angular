/****************************************************************************************************
 * PARTIAL FILE: todo_example.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.list = [];
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: false, selector: "my-app", ngImport: i0, template: '<todo [data]="list"></todo>', isInline: true, dependencies: [{ kind: "component", type: i0.forwardRef(() => TodoComponent), selector: "todo", inputs: ["data"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app', template: '<todo [data]="list"></todo>',
                    standalone: false
                }]
        }] });
export class TodoComponent {
    constructor() {
        this.data = [];
    }
}
TodoComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
TodoComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TodoComponent, isStandalone: false, selector: "todo", inputs: { data: "data" }, ngImport: i0, template: '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'todo',
                    template: '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>',
                    standalone: false
                }]
        }], propDecorators: { data: [{
                type: Input
            }] } });
export class TodoModule {
}
TodoModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
TodoModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoModule, declarations: [TodoComponent, MyApp] });
TodoModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [TodoComponent, MyApp],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: todo_example.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    list: any[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class TodoComponent {
    data: any[];
    myTitle: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TodoComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TodoComponent, "todo", never, { "data": { "alias": "data"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class TodoModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<TodoModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<TodoModule, [typeof TodoComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<TodoModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: operators.js
 ****************************************************************************************************/
import { Component, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class IdentityPipe {
    transform(value) {
        return value;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IdentityPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IdentityPipe, isStandalone: true, name: "identity" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IdentityPipe, decorators: [{
            type: Pipe,
            args: [{ name: 'identity' }]
        }] });
export class MyApp {
    foo = { bar: 'baz' };
    number = 1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    {{ 1 + 2 }}
    {{ (1 % 2) + 3 / 4 * 5 ** 6 }}
    {{ +1 }}
    {{ typeof {} === 'object' }}
    {{ !(typeof {} === 'object') }}
    {{ typeof foo?.bar === 'string' }}
    {{ typeof foo?.bar | identity }}
    {{ void 'test' }}
    {{ (-1) ** 3 }}
    {{ 'bar' in foo }}
    <button (click)="number += 1"></button>
    <button (click)="number -= 1"></button>
    <button (click)="number *= 1"></button>
    <button (click)="number /= 1"></button>
    <button (click)="number %= 1"></button>
    <button (click)="number **= 1"></button>
    <button (click)="number &&= 1"></button>
    <button (click)="number ||= 1"></button>
    <button (click)="number ??= 1"></button>
  `, isInline: true, dependencies: [{ kind: "pipe", type: IdentityPipe, name: "identity" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{ 1 + 2 }}
    {{ (1 % 2) + 3 / 4 * 5 ** 6 }}
    {{ +1 }}
    {{ typeof {} === 'object' }}
    {{ !(typeof {} === 'object') }}
    {{ typeof foo?.bar === 'string' }}
    {{ typeof foo?.bar | identity }}
    {{ void 'test' }}
    {{ (-1) ** 3 }}
    {{ 'bar' in foo }}
    <button (click)="number += 1"></button>
    <button (click)="number -= 1"></button>
    <button (click)="number *= 1"></button>
    <button (click)="number /= 1"></button>
    <button (click)="number %= 1"></button>
    <button (click)="number **= 1"></button>
    <button (click)="number &&= 1"></button>
    <button (click)="number ||= 1"></button>
    <button (click)="number ??= 1"></button>
  `,
                    imports: [IdentityPipe],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: operators.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class IdentityPipe {
    transform(value: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<IdentityPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<IdentityPipe, "identity", true>;
}
export declare class MyApp {
    foo: {
        bar?: string;
    };
    number: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, true, never>;
}

