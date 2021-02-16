/****************************************************************************************************
 * PARTIAL FILE: local_reference.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<input #user>Hello {{user.value}}!', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<input #user>Hello {{user.value}}!' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: local_reference.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: local_reference_nested.js
 ****************************************************************************************************/
import { Component, Directive, NgModule, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export class IfDirective {
    constructor(template) { }
}
IfDirective.ɵfac = function IfDirective_Factory(t) { return new (t || IfDirective)(i0.ɵɵdirectiveInject(i0.TemplateRef)); };
IfDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: IfDirective, selector: "[if]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(IfDirective, [{
        type: Directive,
        args: [{ selector: '[if]' }]
    }], function () { return [{ type: i0.TemplateRef }]; }, null); })();
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div #foo></div>
    {{foo}}
    <div *if>
      {{foo}}-{{bar}}
      <span *if>{{foo}}-{{bar}}-{{baz}}</span>
      <span #bar></span>
    </div>
    <div #baz></div>
    `, isInline: true, directives: [{ type: IfDirective, selector: "[if]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <div #foo></div>
    {{foo}}
    <div *if>
      {{foo}}-{{bar}}
      <span *if>{{foo}}-{{bar}}-{{baz}}</span>
      <span #bar></span>
    </div>
    <div #baz></div>
    `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [IfDirective, MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [IfDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: local_reference_nested.d.ts
 ****************************************************************************************************/
import { TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export declare class IfDirective {
    constructor(template: TemplateRef<any>);
    static ɵfac: i0.ɵɵFactoryDef<IfDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<IfDirective, "[if]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof IfDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: local_reference_and_context_variables.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div *ngFor="let item of items">
       <div #foo></div>
        <span *ngIf="showing">
          {{ foo }} - {{ item }}
        </span>
    </div>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <div *ngFor="let item of items">
       <div #foo></div>
        <span *ngIf="showing">
          {{ foo }} - {{ item }}
        </span>
    </div>`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: local_reference_and_context_variables.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: lifecycle_hooks.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
let events = [];
export class LifecycleComp {
    ngOnChanges() {
        events.push('changes' + this.nameMin);
    }
    ngOnInit() {
        events.push('init' + this.nameMin);
    }
    ngDoCheck() {
        events.push('check' + this.nameMin);
    }
    ngAfterContentInit() {
        events.push('content init' + this.nameMin);
    }
    ngAfterContentChecked() {
        events.push('content check' + this.nameMin);
    }
    ngAfterViewInit() {
        events.push('view init' + this.nameMin);
    }
    ngAfterViewChecked() {
        events.push('view check' + this.nameMin);
    }
    ngOnDestroy() {
        events.push(this.nameMin);
    }
}
LifecycleComp.ɵfac = function LifecycleComp_Factory(t) { return new (t || LifecycleComp)(); };
LifecycleComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: LifecycleComp, selector: "lifecycle-comp", inputs: { nameMin: ["name", "nameMin"] }, usesOnChanges: true, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LifecycleComp, [{
        type: Component,
        args: [{ selector: 'lifecycle-comp', template: '' }]
    }], null, { nameMin: [{
            type: Input,
            args: ['name']
        }] }); })();
export class SimpleLayout {
    constructor() {
        this.name1 = '1';
        this.name2 = '2';
    }
}
SimpleLayout.ɵfac = function SimpleLayout_Factory(t) { return new (t || SimpleLayout)(); };
SimpleLayout.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: SimpleLayout, selector: "simple-layout", ngImport: i0, template: `
    <lifecycle-comp [name]="name1"></lifecycle-comp>
    <lifecycle-comp [name]="name2"></lifecycle-comp>
  `, isInline: true, directives: [{ type: LifecycleComp, selector: "lifecycle-comp", inputs: ["name"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SimpleLayout, [{
        type: Component,
        args: [{
                selector: 'simple-layout',
                template: `
    <lifecycle-comp [name]="name1"></lifecycle-comp>
    <lifecycle-comp [name]="name2"></lifecycle-comp>
  `
            }]
    }], null, null); })();
export class LifecycleModule {
}
LifecycleModule.ɵmod = i0.ɵɵdefineNgModule({ type: LifecycleModule });
LifecycleModule.ɵinj = i0.ɵɵdefineInjector({ factory: function LifecycleModule_Factory(t) { return new (t || LifecycleModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(LifecycleModule, { declarations: [LifecycleComp, SimpleLayout] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LifecycleModule, [{
        type: NgModule,
        args: [{ declarations: [LifecycleComp, SimpleLayout] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: lifecycle_hooks.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class LifecycleComp {
    nameMin: string;
    ngOnChanges(): void;
    ngOnInit(): void;
    ngDoCheck(): void;
    ngAfterContentInit(): void;
    ngAfterContentChecked(): void;
    ngAfterViewInit(): void;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDef<LifecycleComp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<LifecycleComp, "lifecycle-comp", never, { "nameMin": "name"; }, {}, never, never>;
}
export declare class SimpleLayout {
    name1: string;
    name2: string;
    static ɵfac: i0.ɵɵFactoryDef<SimpleLayout, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<SimpleLayout, "simple-layout", never, {}, {}, never, never>;
}
export declare class LifecycleModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<LifecycleModule, [typeof LifecycleComp, typeof SimpleLayout], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<LifecycleModule>;
}

