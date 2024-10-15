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
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '<todo [data]="list"></todo>', isInline: true, dependencies: [{ kind: "component", type: i0.forwardRef(() => TodoComponent), selector: "todo", inputs: ["data"] }] });
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
TodoComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TodoComponent, selector: "todo", inputs: { data: "data" }, ngImport: i0, template: '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>', isInline: true });
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
import { Component, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.foo = { bar: 'baz' };
    }
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "ng-component", ngImport: i0, template: `
    {{ 1 + 2 }}
	{{ (1 % 2) + 3 / 4 * 5 }}
	{{ +1 }}
  {{ typeof {} === 'object' }}
  {{ !(typeof {} === 'object') }}
  {{ typeof foo?.bar === 'string' }}
  {{ typeof foo?.bar | identity }}
`, isInline: true, dependencies: [{ kind: "pipe", type: i0.forwardRef(() => IdentityPipe), name: "identity" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{
                    template: `
    {{ 1 + 2 }}
	{{ (1 % 2) + 3 / 4 * 5 }}
	{{ +1 }}
  {{ typeof {} === 'object' }}
  {{ !(typeof {} === 'object') }}
  {{ typeof foo?.bar === 'string' }}
  {{ typeof foo?.bar | identity }}
`,
                    standalone: false
                }]
        }] });
export class IdentityPipe {
    transform(value) { return value; }
}
IdentityPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IdentityPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
IdentityPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IdentityPipe, name: "identity" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: IdentityPipe, decorators: [{
            type: Pipe,
            args: [{ name: 'identity' }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyApp, IdentityPipe] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyApp, IdentityPipe] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: operators.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    foo: {
        bar?: string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "ng-component", never, {}, {}, never, never, false, never>;
}
export declare class IdentityPipe {
    transform(value: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<IdentityPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<IdentityPipe, "identity", false>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp, typeof IdentityPipe], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

