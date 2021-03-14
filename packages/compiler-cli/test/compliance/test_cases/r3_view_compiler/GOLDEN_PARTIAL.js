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
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '<todo [data]="list"></todo>', isInline: true, components: [{ type: i0.forwardRef(function () { return TodoComponent; }), selector: "todo", inputs: ["data"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '<todo [data]="list"></todo>' }]
    }], null, null); })();
export class TodoComponent {
    constructor() {
        this.data = [];
    }
}
TodoComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
TodoComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: TodoComponent, selector: "todo", inputs: { data: "data" }, ngImport: i0, template: '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TodoComponent, [{
        type: Component,
        args: [{
                selector: 'todo',
                template: '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>'
            }]
    }], null, { data: [{
            type: Input
        }] }); })();
export class TodoModule {
}
TodoModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
TodoModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoModule, declarations: [TodoComponent, MyApp] });
TodoModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TodoModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TodoModule, [{
        type: NgModule,
        args: [{
                declarations: [TodoComponent, MyApp],
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: todo_example.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    list: any[];
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class TodoComponent {
    data: any[];
    myTitle: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TodoComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TodoComponent, "todo", never, { "data": "data"; }, {}, never, never>;
}
export declare class TodoModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<TodoModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<TodoModule, [typeof TodoComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<TodoModule>;
}

