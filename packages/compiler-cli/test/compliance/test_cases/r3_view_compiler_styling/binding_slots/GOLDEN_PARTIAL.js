/****************************************************************************************************
 * PARTIAL FILE: component_host_binding_slots.js
 ****************************************************************************************************/
import { Component, HostBinding, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.myStyle = { width: '100px' };
        this.myClass = { bar: false };
        this.id = 'some id';
        this.title = 'some title';
        this.name = '';
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", inputs: { name: "name" }, host: { attributes: { "title": "foo title" }, properties: { "style": "this.myStyle", "class": "this.myClass", "id": "this.id", "title": "this.title" }, styleAttribute: "width:200px; height:500px", classAttribute: "foo baz" }, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: '',
                host: { 'style': 'width:200px; height:500px', 'class': 'foo baz', 'title': 'foo title' }
            }]
    }], null, { myStyle: [{
            type: HostBinding,
            args: ['style']
        }], myClass: [{
            type: HostBinding,
            args: ['class']
        }], id: [{
            type: HostBinding,
            args: ['id']
        }], title: [{
            type: HostBinding,
            args: ['title']
        }], name: [{
            type: Input,
            args: ['name']
        }] }); })();
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
 * PARTIAL FILE: component_host_binding_slots.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    myStyle: {
        width: string;
    };
    myClass: {
        bar: boolean;
    };
    id: string;
    title: string;
    name: string;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, { "name": "name"; }, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: directive_host_binding_slots.js
 ****************************************************************************************************/
import { Directive, HostBinding } from '@angular/core';
import * as i0 from "@angular/core";
export class WidthDirective {
    constructor() {
        this.myWidth = 200;
        this.myFooClass = true;
        this.id = 'some id';
        this.title = 'some title';
    }
}
WidthDirective.ɵfac = function WidthDirective_Factory(t) { return new (t || WidthDirective)(); };
WidthDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: WidthDirective, selector: "[myWidthDir]", host: { properties: { "style.width": "this.myWidth", "class.foo": "this.myFooClass", "id": "this.id", "title": "this.title" } }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidthDirective, [{
        type: Directive,
        args: [{ selector: '[myWidthDir]' }]
    }], null, { myWidth: [{
            type: HostBinding,
            args: ['style.width']
        }], myFooClass: [{
            type: HostBinding,
            args: ['class.foo']
        }], id: [{
            type: HostBinding,
            args: ['id']
        }], title: [{
            type: HostBinding,
            args: ['title']
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: directive_host_binding_slots.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class WidthDirective {
    myWidth: number;
    myFooClass: boolean;
    id: string;
    title: string;
    static ɵfac: i0.ɵɵFactoryDef<WidthDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<WidthDirective, "[myWidthDir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_binding_slots.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDir {
    constructor() {
        this.title = '';
        this.foo = true;
        this._animValue = null;
        this._animParam1 = null;
        this._animParam2 = null;
    }
}
MyDir.ɵfac = function MyDir_Factory(t) { return new (t || MyDir)(); };
MyDir.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: MyDir, selector: "[my-dir]", host: { properties: { "title": "title", "class.foo": "foo", "@anim": "{\n      value: _animValue,\n      params: {\n        param1: _animParam1,\n        param2: _animParam2\n      }\n    }" } }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyDir, [{
        type: Directive,
        args: [{
                selector: '[my-dir]',
                host: {
                    '[title]': 'title',
                    '[class.foo]': 'foo',
                    '[@anim]': `{
      value: _animValue,
      params: {
        param1: _animParam1,
        param2: _animParam2
      }
    }`
                }
            }]
    }], null, null); })();
export class MyAppComp {
}
MyAppComp.ɵfac = function MyAppComp_Factory(t) { return new (t || MyAppComp)(); };
MyAppComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyAppComp, selector: "my-app", ngImport: i0, template: `
    <div my-dir></div>
  `, isInline: true, directives: [{ type: MyDir, selector: "[my-dir]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyAppComp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `
    <div my-dir></div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyAppComp, MyDir] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyAppComp, MyDir] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: host_binding_slots.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDir {
    title: string;
    foo: boolean;
    _animValue: null;
    _animParam1: null;
    _animParam2: null;
    static ɵfac: i0.ɵɵFactoryDef<MyDir, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDir, "[my-dir]", never, {}, {}, never>;
}
export declare class MyAppComp {
    static ɵfac: i0.ɵɵFactoryDef<MyAppComp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyAppComp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyAppComp, typeof MyDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

