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
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '<todo [data]="list"></todo>', isInline: true, directives: [{ type: i0.forwardRef(function () { return TodoComponent; }), selector: "todo", inputs: ["data"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '<todo [data]="list"></todo>' }]
    }], null, null); })();
export class TodoComponent {
    constructor() {
        this.data = [];
    }
}
TodoComponent.ɵfac = function TodoComponent_Factory(t) { return new (t || TodoComponent)(); };
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
TodoModule.ɵmod = i0.ɵɵdefineNgModule({ type: TodoModule });
TodoModule.ɵinj = i0.ɵɵdefineInjector({ factory: function TodoModule_Factory(t) { return new (t || TodoModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(TodoModule, { declarations: [TodoComponent, MyApp] }); })();
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
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class TodoComponent {
    data: any[];
    myTitle: string;
    static ɵfac: i0.ɵɵFactoryDef<TodoComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<TodoComponent, "todo", never, { "data": "data"; }, {}, never, never>;
}
export declare class TodoModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<TodoModule, [typeof TodoComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<TodoModule>;
}

