/****************************************************************************************************
 * PARTIAL FILE: host_bindings.js
 ****************************************************************************************************/
import { Directive, HostBinding, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingDir {
    constructor() {
        this.dirId = 'some id';
    }
}
HostBindingDir.ɵfac = function HostBindingDir_Factory(t) { return new (t || HostBindingDir)(); };
HostBindingDir.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: HostBindingDir, selector: "[hostBindingDir]", host: { properties: { "id": "dirId" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HostBindingDir, [{
        type: Directive,
        args: [{ selector: '[hostBindingDir]' }]
    }], null, { dirId: [{
            type: HostBinding,
            args: ['id']
        }] }); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingDir] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [HostBindingDir] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: host_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingDir {
    dirId: string;
    static ɵfac: i0.ɵɵFactoryDef<HostBindingDir, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<HostBindingDir, "[hostBindingDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof HostBindingDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_with_temporaries.js
 ****************************************************************************************************/
import { Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingDir {
}
HostBindingDir.ɵfac = function HostBindingDir_Factory(t) { return new (t || HostBindingDir)(); };
HostBindingDir.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: HostBindingDir, selector: "[hostBindingDir]", host: { properties: { "id": "getData()?.id" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HostBindingDir, [{
        type: Directive,
        args: [{ selector: '[hostBindingDir]', host: { '[id]': 'getData()?.id' } }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingDir] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [HostBindingDir] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_with_temporaries.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingDir {
    getData?: () => {
        id: number;
    };
    static ɵfac: i0.ɵɵFactoryDef<HostBindingDir, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<HostBindingDir, "[hostBindingDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof HostBindingDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_with_pure_functions.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingComp {
    constructor() {
        this.id = 'some id';
    }
}
HostBindingComp.ɵfac = function HostBindingComp_Factory(t) { return new (t || HostBindingComp)(); };
HostBindingComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: 1, type: HostBindingComp, selector: "host-binding-comp", host: { properties: { "id": "[\"red\", id]" } }, ngImport: i0, template: { source: '', isInline: true } });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HostBindingComp, [{
        type: Component,
        args: [{ selector: 'host-binding-comp', host: { '[id]': '["red", id]' }, template: '' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingComp] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [HostBindingComp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: host_bindings_with_pure_functions.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingComp {
    id: string;
    static ɵfac: i0.ɵɵFactoryDef<HostBindingComp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<HostBindingComp, "host-binding-comp", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof HostBindingComp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_attribute_bindings.js
 ****************************************************************************************************/
import { Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostAttributeDir {
    constructor() {
        this.required = true;
    }
}
HostAttributeDir.ɵfac = function HostAttributeDir_Factory(t) { return new (t || HostAttributeDir)(); };
HostAttributeDir.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: HostAttributeDir, selector: "[hostAttributeDir]", host: { properties: { "attr.required": "required" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HostAttributeDir, [{
        type: Directive,
        args: [{ selector: '[hostAttributeDir]', host: { '[attr.required]': 'required' } }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostAttributeDir] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [HostAttributeDir] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: host_attribute_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostAttributeDir {
    required: boolean;
    static ɵfac: i0.ɵɵFactoryDef<HostAttributeDir, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<HostAttributeDir, "[hostAttributeDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof HostAttributeDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_attributes.js
 ****************************************************************************************************/
import { Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostAttributeDir {
}
HostAttributeDir.ɵfac = function HostAttributeDir_Factory(t) { return new (t || HostAttributeDir)(); };
HostAttributeDir.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: HostAttributeDir, selector: "[hostAttributeDir]", host: { attributes: { "aria-label": "label" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HostAttributeDir, [{
        type: Directive,
        args: [{ selector: '[hostAttributeDir]', host: { 'aria-label': 'label' } }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostAttributeDir] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [HostAttributeDir] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: host_attributes.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostAttributeDir {
    static ɵfac: i0.ɵɵFactoryDef<HostAttributeDir, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<HostAttributeDir, "[hostAttributeDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof HostAttributeDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: host_attributes_with_classes_and_styles.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostAttributeComp {
}
HostAttributeComp.ɵfac = function HostAttributeComp_Factory(t) { return new (t || HostAttributeComp)(); };
HostAttributeComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: 1, type: HostAttributeComp, selector: "my-host-attribute-component", host: { attributes: { "title": "hello there from component" }, styleAttribute: "opacity:1" }, ngImport: i0, template: { source: '...', isInline: true } });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HostAttributeComp, [{
        type: Component,
        args: [{
                selector: 'my-host-attribute-component',
                template: '...',
                host: { 'title': 'hello there from component', 'style': 'opacity:1' }
            }]
    }], null, null); })();
export class HostAttributeDir {
}
HostAttributeDir.ɵfac = function HostAttributeDir_Factory(t) { return new (t || HostAttributeDir)(); };
HostAttributeDir.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: HostAttributeDir, selector: "[hostAttributeDir]", host: { attributes: { "title": "hello there from directive" }, properties: { "style.opacity": "true", "class.three": "true" }, styleAttribute: "width: 200px; height: 500px", classAttribute: "one two" }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HostAttributeDir, [{
        type: Directive,
        args: [{
                selector: '[hostAttributeDir]',
                host: {
                    'style': 'width: 200px; height: 500px',
                    '[style.opacity]': 'true',
                    'class': 'one two',
                    '[class.three]': 'true',
                    'title': 'hello there from directive',
                }
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostAttributeComp, HostAttributeDir] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [HostAttributeComp, HostAttributeDir] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: host_attributes_with_classes_and_styles.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostAttributeComp {
    static ɵfac: i0.ɵɵFactoryDef<HostAttributeComp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<HostAttributeComp, "my-host-attribute-component", never, {}, {}, never, never>;
}
export declare class HostAttributeDir {
    static ɵfac: i0.ɵɵFactoryDef<HostAttributeDir, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<HostAttributeDir, "[hostAttributeDir]", never, {}, {}, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof HostAttributeComp, typeof HostAttributeDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_property_bindings.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.myTitle = 'hello';
        this.myId = 'special-directive';
    }
}
MyDirective.ɵfac = function MyDirective_Factory(t) { return new (t || MyDirective)(); };
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: MyDirective, selector: "[my-dir]", host: { properties: { "title": "myTitle", "tabindex": "1", "id": "myId" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyDirective, [{
        type: Directive,
        args: [{ selector: '[my-dir]', host: { '[title]': 'myTitle', '[tabindex]': '1', '[id]': 'myId' } }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_property_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    myTitle: string;
    myId: string;
    static ɵfac: i0.ɵɵFactoryDef<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_property_bindings_all.js
 ****************************************************************************************************/
import { Directive, HostBinding } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.myTitle = 'hello';
        this.myId = 'special-directive';
    }
}
MyDirective.ɵfac = function MyDirective_Factory(t) { return new (t || MyDirective)(); };
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: MyDirective, selector: "[my-dir]", host: { properties: { "tabindex": "1", "title": "myTitle", "id": "myId" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyDirective, [{
        type: Directive,
        args: [{ selector: '[my-dir]', host: { '[tabindex]': '1' } }]
    }], null, { myTitle: [{
            type: HostBinding,
            args: ['title']
        }], myId: [{
            type: HostBinding,
            args: ['id']
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_property_bindings_all.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    myTitle: string;
    myId: string;
    static ɵfac: i0.ɵɵFactoryDef<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_property_bindings_mixed.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
}
MyDirective.ɵfac = function MyDirective_Factory(t) { return new (t || MyDirective)(); };
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: MyDirective, selector: "[my-dir]", host: { properties: { "title": "\"my title\"", "attr.tabindex": "1", "id": "\"my-id\"" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyDirective, [{
        type: Directive,
        args: [{
                selector: '[my-dir]',
                host: { '[title]': '"my title"', '[attr.tabindex]': '1', '[id]': '"my-id"' }
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_property_bindings_mixed.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    static ɵfac: i0.ɵɵFactoryDef<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_properties.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.expandedState = 'collapsed';
        this.isSmall = true;
    }
}
MyDirective.ɵfac = function MyDirective_Factory(t) { return new (t || MyDirective)(); };
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: MyDirective, selector: "[my-dir]", host: { properties: { "@expand": "expandedState", "@fadeOut": "true", "@shrink": "isSmall" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyDirective, [{
        type: Directive,
        args: [{
                selector: '[my-dir]',
                host: { '[@expand]': 'expandedState', '[@fadeOut]': 'true', '[@shrink]': 'isSmall' }
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_properties.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    expandedState: string;
    isSmall: boolean;
    static ɵfac: i0.ɵɵFactoryDef<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_attribute_bindings.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.myTitle = 'hello';
        this.myId = 'special-directive';
    }
}
MyDirective.ɵfac = function MyDirective_Factory(t) { return new (t || MyDirective)(); };
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: MyDirective, selector: "[my-dir]", host: { properties: { "attr.title": "myTitle", "attr.tabindex": "1", "attr.id": "myId" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyDirective, [{
        type: Directive,
        args: [{
                selector: '[my-dir]',
                host: { '[attr.title]': 'myTitle', '[attr.tabindex]': '1', '[attr.id]': 'myId' }
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_attribute_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    myTitle: string;
    myId: string;
    static ɵfac: i0.ɵɵFactoryDef<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_attribute_bindings_all.js
 ****************************************************************************************************/
import { Directive, HostBinding } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    constructor() {
        this.myTitle = 'hello';
        this.myId = 'special-directive';
    }
}
MyDirective.ɵfac = function MyDirective_Factory(t) { return new (t || MyDirective)(); };
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: MyDirective, selector: "[my-dir]", host: { properties: { "attr.tabindex": "1", "attr.title": "myTitle", "attr.id": "myId" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyDirective, [{
        type: Directive,
        args: [{ selector: '[my-dir]', host: { '[attr.tabindex]': '1' } }]
    }], null, { myTitle: [{
            type: HostBinding,
            args: ['attr.title']
        }], myId: [{
            type: HostBinding,
            args: ['attr.id']
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_attribute_bindings_all.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    myTitle: string;
    myId: string;
    static ɵfac: i0.ɵɵFactoryDef<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_attribute_bindings_mixed.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
}
MyDirective.ɵfac = function MyDirective_Factory(t) { return new (t || MyDirective)(); };
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: MyDirective, selector: "[my-dir]", host: { properties: { "attr.title": "\"my title\"", "tabindex": "1", "attr.id": "\"my-id\"" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyDirective, [{
        type: Directive,
        args: [{
                selector: '[my-dir]',
                host: { '[attr.title]': '"my title"', '[tabindex]': '1', '[attr.id]': '"my-id"' }
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_attribute_bindings_mixed.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    static ɵfac: i0.ɵɵFactoryDef<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_listeners.js
 ****************************************************************************************************/
import { Directive, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyDirective {
    mousedown() { }
    mouseup() { }
    click() {
    }
}
MyDirective.ɵfac = function MyDirective_Factory(t) { return new (t || MyDirective)(); };
MyDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: MyDirective, selector: "[my-dir]", host: { listeners: { "mousedown": "mousedown()", "mouseup": "mouseup()", "click": "click()" } }, ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyDirective, [{
        type: Directive,
        args: [{
                selector: '[my-dir]',
                host: {
                    '(mousedown)': 'mousedown()',
                    '(mouseup)': 'mouseup()',
                }
            }]
    }], null, { click: [{
            type: HostListener,
            args: ['click']
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDirective {
    mousedown(): void;
    mouseup(): void;
    click(): void;
    static ɵfac: i0.ɵɵFactoryDef<MyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<MyDirective, "[my-dir]", never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_listeners.js
 ****************************************************************************************************/
import { Component, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    start() {
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: 1, type: MyComponent, selector: "my-comp", host: { listeners: { "@animation.done": "done()", "@animation.start": "start()" } }, ngImport: i0, template: { source: '', isInline: true } });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-comp',
                template: '',
                host: {
                    '(@animation.done)': 'done()',
                }
            }]
    }], null, { start: [{
            type: HostListener,
            args: ['@animation.start']
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_listeners.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    start(): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-comp", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_listeners_mixed.js
 ****************************************************************************************************/
import { Component, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    start() {
    }
    click() {
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: 1, type: MyComponent, selector: "my-comp", host: { listeners: { "mousedown": "mousedown()", "@animation.done": "done()", "mouseup": "mouseup()", "@animation.start": "start()", "click": "click()" } }, ngImport: i0, template: { source: '', isInline: true } });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-comp',
                template: '',
                host: {
                    '(mousedown)': 'mousedown()',
                    '(@animation.done)': 'done()',
                    '(mouseup)': 'mouseup()',
                }
            }]
    }], null, { start: [{
            type: HostListener,
            args: ['@animation.start']
        }], click: [{
            type: HostListener,
            args: ['click']
        }] }); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_synthetic_listeners_mixed.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    start(): void;
    click(): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-comp", never, {}, {}, never, never>;
}

