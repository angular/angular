/****************************************************************************************************
 * PARTIAL FILE: custom.js
 ****************************************************************************************************/
export function CustomClassDecorator() {
    return (clazz) => clazz;
}
export function CustomPropDecorator() {
    return () => { };
}
export function CustomParamDecorator() {
    return () => { };
}

/****************************************************************************************************
 * PARTIAL FILE: custom.d.ts
 ****************************************************************************************************/
export declare function CustomClassDecorator(): ClassDecorator;
export declare function CustomPropDecorator(): PropertyDecorator;
export declare function CustomParamDecorator(): ParameterDecorator;

/****************************************************************************************************
 * PARTIAL FILE: class_decorators.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Injectable } from '@angular/core';
import { CustomClassDecorator } from './custom';
import * as i0 from "@angular/core";
class BasicInjectable {
}
BasicInjectable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicInjectable, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
BasicInjectable.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicInjectable });
export { BasicInjectable };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicInjectable, decorators: [{
            type: Injectable
        }] });
class RootInjectable {
}
RootInjectable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RootInjectable, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
RootInjectable.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RootInjectable, providedIn: 'root' });
export { RootInjectable };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RootInjectable, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
let CustomInjectable = class CustomInjectable {
};
CustomInjectable.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CustomInjectable, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
CustomInjectable.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CustomInjectable });
CustomInjectable = __decorate([
    CustomClassDecorator()
], CustomInjectable);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CustomInjectable, decorators: [{
            type: Injectable
        }] });
class ComponentWithExternalResource {
}
ComponentWithExternalResource.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ComponentWithExternalResource, deps: [], target: i0.ɵɵFactoryTarget.Component });
ComponentWithExternalResource.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: ComponentWithExternalResource, selector: "test-cmp", ngImport: i0, template: "<span>Test template</span>\n" });
export { ComponentWithExternalResource };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ComponentWithExternalResource, decorators: [{
            type: Component,
            args: [{ selector: 'test-cmp', template: "<span>Test template</span>\n" }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: class_decorators.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class BasicInjectable {
    static ɵfac: i0.ɵɵFactoryDeclaration<BasicInjectable, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BasicInjectable>;
}
export declare class RootInjectable {
    static ɵfac: i0.ɵɵFactoryDeclaration<RootInjectable, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<RootInjectable>;
}
export declare class ComponentWithExternalResource {
    static ɵfac: i0.ɵɵFactoryDeclaration<ComponentWithExternalResource, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ComponentWithExternalResource, "test-cmp", never, {}, {}, never, never, false, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: custom.js
 ****************************************************************************************************/
export function CustomClassDecorator() {
    return (clazz) => clazz;
}
export function CustomPropDecorator() {
    return () => { };
}
export function CustomParamDecorator() {
    return () => { };
}

/****************************************************************************************************
 * PARTIAL FILE: custom.d.ts
 ****************************************************************************************************/
export declare function CustomClassDecorator(): ClassDecorator;
export declare function CustomPropDecorator(): PropertyDecorator;
export declare function CustomParamDecorator(): ParameterDecorator;

/****************************************************************************************************
 * PARTIAL FILE: property_decorators.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, Input, Output } from '@angular/core';
import { CustomPropDecorator } from './custom';
import * as i0 from "@angular/core";
class MyDir {
}
MyDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
MyDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyDir, inputs: { foo: "foo", bar: ["baz", "bar"], mixed: "mixed" }, outputs: { mixed: "mixed" }, ngImport: i0 });
__decorate([
    CustomPropDecorator(),
    __metadata("design:type", String)
], MyDir.prototype, "custom", void 0);
__decorate([
    CustomPropDecorator(),
    __metadata("design:type", String)
], MyDir.prototype, "mixed", void 0);
export { MyDir };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDir, decorators: [{
            type: Directive
        }], propDecorators: { foo: [{
                type: Input
            }], bar: [{
                type: Input,
                args: ['baz']
            }], custom: [], mixed: [{
                type: Input
            }, {
                type: Output
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: property_decorators.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyDir {
    foo: string;
    bar: string;
    custom: string;
    mixed: string;
    none: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDir, never, never, { "foo": "foo"; "bar": "baz"; "mixed": "mixed"; }, { "mixed": "mixed"; }, never, never, false, never>;
}

