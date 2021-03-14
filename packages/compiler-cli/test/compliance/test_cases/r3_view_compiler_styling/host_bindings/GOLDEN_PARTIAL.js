/****************************************************************************************************
 * PARTIAL FILE: static_and_dynamic.js
 ****************************************************************************************************/
import { Component, HostBinding, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.myStyle = { width: '100px' };
        this.myClass = { bar: false };
        this.myColorProp = 'red';
        this.myFooClass = 'red';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", host: { properties: { "style": "this.myStyle", "class": "this.myClass", "style.color": "this.myColorProp", "class.foo": "this.myFooClass" }, styleAttribute: "width:200px; height:500px", classAttribute: "foo baz" }, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: '',
                host: { 'style': 'width:200px; height:500px', 'class': 'foo baz' }
            }]
    }], null, { myStyle: [{
            type: HostBinding,
            args: ['style']
        }], myClass: [{
            type: HostBinding,
            args: ['class']
        }], myColorProp: [{
            type: HostBinding,
            args: ['style.color']
        }], myFooClass: [{
            type: HostBinding,
            args: ['class.foo']
        }] }); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: static_and_dynamic.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    myStyle: {
        width: string;
    };
    myClass: {
        bar: boolean;
    };
    myColorProp: string;
    myFooClass: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: multiple_dynamic.js
 ****************************************************************************************************/
import { Component, HostBinding, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.myHeightProp = 20;
        this.myBarClass = true;
        this.myStyle = {};
        this.myWidthProp = '500px';
        this.myFooClass = true;
        this.myClasses = { a: true, b: true };
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", host: { properties: { "style.height.pt": "myHeightProp", "class.bar": "myBarClass", "style": "this.myStyle", "style.width": "this.myWidthProp", "class.foo": "this.myFooClass", "class": "this.myClasses" } }, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: '',
                host: { '[style.height.pt]': 'myHeightProp', '[class.bar]': 'myBarClass' }
            }]
    }], null, { myStyle: [{
            type: HostBinding,
            args: ['style']
        }], myWidthProp: [{
            type: HostBinding,
            args: ['style.width']
        }], myFooClass: [{
            type: HostBinding,
            args: ['class.foo']
        }], myClasses: [{
            type: HostBinding,
            args: ['class']
        }] }); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: multiple_dynamic.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    myHeightProp: number;
    myBarClass: boolean;
    myStyle: {};
    myWidthProp: string;
    myFooClass: boolean;
    myClasses: {
        a: boolean;
        b: boolean;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: important.js
 ****************************************************************************************************/
import { Component, HostBinding, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.myStyleExp = '';
        this.myClassExp = '';
        this.myFooClassExp = true;
        this.myWidthExp = '100px';
        this.myBarClassExp = true;
        this.myHeightExp = '200px';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", host: { properties: { "style!important": "myStyleExp", "class!important": "myClassExp", "class.foo!important": "this.myFooClassExp", "style.width!important": "this.myWidthExp" } }, ngImport: i0, template: `
    <div [style.height!important]="myHeightExp"
         [class.bar!important]="myBarClassExp"></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <div [style.height!important]="myHeightExp"
         [class.bar!important]="myBarClassExp"></div>
  `,
                host: { '[style!important]': 'myStyleExp', '[class!important]': 'myClassExp' }
            }]
    }], null, { myFooClassExp: [{
            type: HostBinding,
            args: ['class.foo!important']
        }], myWidthExp: [{
            type: HostBinding,
            args: ['style.width!important']
        }] }); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: important.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    myStyleExp: string;
    myClassExp: string;
    myFooClassExp: boolean;
    myWidthExp: string;
    myBarClassExp: boolean;
    myHeightExp: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: class_interpolation.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.p1 = 100;
        this.p2 = 100;
        this.p3 = 100;
        this.p4 = 100;
        this.p5 = 100;
        this.p6 = 100;
        this.p7 = 100;
        this.p8 = 100;
        this.p9 = 100;
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div class="A{{p1}}B"></div>
    <div class="A{{p1}}B{{p2}}C"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I{{p9}}J"></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <div class="A{{p1}}B"></div>
    <div class="A{{p1}}B{{p2}}C"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I"></div>
    <div class="A{{p1}}B{{p2}}C{{p3}}D{{p4}}E{{p5}}F{{p6}}G{{p7}}H{{p8}}I{{p9}}J"></div>
  `,
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: class_interpolation.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5: number;
    p6: number;
    p7: number;
    p8: number;
    p9: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: style_interpolation.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.p1 = 100;
        this.p2 = 100;
        this.p3 = 100;
        this.p4 = 100;
        this.p5 = 100;
        this.p6 = 100;
        this.p7 = 100;
        this.p8 = 100;
        this.p9 = 100;
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <div style="p1:{{p1}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};p9:{{p9}};"></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <div style="p1:{{p1}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};"></div>
    <div style="p1:{{p1}};p2:{{p2}};p3:{{p3}};p4:{{p4}};p5:{{p5}};p6:{{p6}};p7:{{p7}};p8:{{p8}};p9:{{p9}};"></div>
  `,
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: style_interpolation.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5: number;
    p6: number;
    p7: number;
    p8: number;
    p9: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: multiple_directives.js
 ****************************************************************************************************/
import { Component, Directive, HostBinding, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class ClassDirective {
    constructor() {
        this.myClassMap = { red: true };
    }
}
ClassDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ClassDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
ClassDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: ClassDirective, selector: "[myClassDir]", host: { properties: { "class": "this.myClassMap" } }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ClassDirective, [{
        type: Directive,
        args: [{ selector: '[myClassDir]' }]
    }], null, { myClassMap: [{
            type: HostBinding,
            args: ['class']
        }] }); })();
export class WidthDirective {
    constructor() {
        this.myWidth = 200;
        this.myFooClass = true;
    }
}
WidthDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: WidthDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
WidthDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: WidthDirective, selector: "[myWidthDir]", host: { properties: { "style.width": "this.myWidth", "class.foo": "this.myFooClass" } }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidthDirective, [{
        type: Directive,
        args: [{ selector: '[myWidthDir]' }]
    }], null, { myWidth: [{
            type: HostBinding,
            args: ['style.width']
        }], myFooClass: [{
            type: HostBinding,
            args: ['class.foo']
        }] }); })();
export class HeightDirective {
    constructor() {
        this.myHeight = 200;
        this.myBarClass = true;
    }
}
HeightDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HeightDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
HeightDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: HeightDirective, selector: "[myHeightDir]", host: { properties: { "style.height": "this.myHeight", "class.bar": "this.myBarClass" } }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HeightDirective, [{
        type: Directive,
        args: [{ selector: '[myHeightDir]' }]
    }], null, { myHeight: [{
            type: HostBinding,
            args: ['style.height']
        }], myBarClass: [{
            type: HostBinding,
            args: ['class.bar']
        }] }); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div myWidthDir myHeightDir myClassDir></div>', isInline: true, directives: [{ type: WidthDirective, selector: "[myWidthDir]" }, { type: HeightDirective, selector: "[myHeightDir]" }, { type: ClassDirective, selector: "[myClassDir]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: '<div myWidthDir myHeightDir myClassDir></div>',
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent, WidthDirective, HeightDirective, ClassDirective] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, WidthDirective, HeightDirective, ClassDirective] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: multiple_directives.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class ClassDirective {
    myClassMap: {
        red: boolean;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<ClassDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ClassDirective, "[myClassDir]", never, {}, {}, never>;
}
export declare class WidthDirective {
    myWidth: number;
    myFooClass: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidthDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<WidthDirective, "[myWidthDir]", never, {}, {}, never>;
}
export declare class HeightDirective {
    myHeight: number;
    myBarClass: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<HeightDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HeightDirective, "[myHeightDir]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent, typeof WidthDirective, typeof HeightDirective, typeof ClassDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

