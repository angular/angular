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
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: false, selector: "my-component", inputs: { name: "name" }, host: { attributes: { "title": "foo title" }, properties: { "style": "this.myStyle", "class": "this.myClass", "id": "this.id", "title": "this.title" }, styleAttribute: "width:200px; height:500px", classAttribute: "foo baz" }, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-component',
                    template: '',
                    host: { 'style': 'width:200px; height:500px', 'class': 'foo baz', 'title': 'foo title' },
                    standalone: false
                }]
        }], propDecorators: { myStyle: [{
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
            }] } });
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
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, { "name": { "alias": "name"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
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
WidthDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: WidthDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
WidthDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: WidthDirective, isStandalone: false, selector: "[myWidthDir]", host: { properties: { "style.width": "this.myWidth", "class.foo": "this.myFooClass", "id": "this.id", "title": "this.title" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: WidthDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[myWidthDir]',
                    standalone: false
                }]
        }], propDecorators: { myWidth: [{
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
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: directive_host_binding_slots.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class WidthDirective {
    myWidth: number;
    myFooClass: boolean;
    id: string;
    title: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidthDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<WidthDirective, "[myWidthDir]", never, {}, {}, never, never, false, never>;
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
MyDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyDir, isStandalone: false, selector: "[my-dir]", host: { properties: { "title": "title", "class.foo": "foo", "@anim": "{\n      value: _animValue,\n      params: {\n        param1: _animParam1,\n        param2: _animParam2\n      }\n    }" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDir, decorators: [{
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
                    },
                    standalone: false
                }]
        }] });
export class MyAppComp {
}
MyAppComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAppComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyAppComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyAppComp, isStandalone: false, selector: "my-app", ngImport: i0, template: `
    <div my-dir></div>
  `, isInline: true, dependencies: [{ kind: "directive", type: MyDir, selector: "[my-dir]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAppComp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-app',
                    template: `
    <div my-dir></div>
  `,
                    standalone: false
                }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyAppComp, MyDir] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyAppComp, MyDir] }]
        }] });

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
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDir, "[my-dir]", never, {}, {}, never, never, false, never>;
}
export declare class MyAppComp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyAppComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyAppComp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyAppComp, typeof MyDir], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

