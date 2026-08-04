/****************************************************************************************************
 * PARTIAL FILE: basic_service.js
 ****************************************************************************************************/
import { Service } from '@angular/core';
import * as i0 from "@angular/core";
export class MyService {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Service });
    static ɵprov = i0.ɵɵngDeclareService({ minVersion: "22.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Service
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_service.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: service_with_factory.js
 ****************************************************************************************************/
import { Service } from '@angular/core';
import * as i0 from "@angular/core";
class Alternate {
}
export class MyService {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Service });
    static ɵprov = i0.ɵɵngDeclareService({ minVersion: "22.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, factory: () => new Alternate() });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Service,
            args: [{ factory: () => new Alternate() }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: service_with_factory.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: not_provided_service.js
 ****************************************************************************************************/
import { Service } from '@angular/core';
import * as i0 from "@angular/core";
export class MyService {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Service });
    static ɵprov = i0.ɵɵngDeclareService({ minVersion: "22.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, autoProvided: false });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Service,
            args: [{ autoProvided: false }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: not_provided_service.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: explicitly_provided_service.js
 ****************************************************************************************************/
import { Service } from '@angular/core';
import * as i0 from "@angular/core";
export class MyService {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Service });
    static ɵprov = i0.ɵɵngDeclareService({ minVersion: "22.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Service,
            args: [{ autoProvided: true }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: explicitly_provided_service.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: generic_service.js
 ****************************************************************************************************/
import { Service } from '@angular/core';
import * as i0 from "@angular/core";
export class MyService {
    getOne() {
        return null;
    }
    getTwo() {
        return null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Service });
    static ɵprov = i0.ɵɵngDeclareService({ minVersion: "22.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Service
        }] });

/****************************************************************************************************
 * PARTIAL FILE: generic_service.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService<T extends number, V = T> {
    getOne(): T;
    getTwo(): V;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService<any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService<any, any>>;
}

/****************************************************************************************************
 * PARTIAL FILE: provided_in_variants.js
 ****************************************************************************************************/
import { Injectable, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeModule, decorators: [{
            type: NgModule,
            args: [{}]
        }] });
export class PlatformService {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PlatformService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PlatformService, providedIn: 'platform' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: PlatformService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'platform' }]
        }] });
export class AnyService {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AnyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AnyService, providedIn: 'any' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AnyService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'any' }]
        }] });
export class ModuleScopedService {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModuleScopedService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModuleScopedService, providedIn: SomeModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ModuleScopedService, decorators: [{
            type: Injectable,
            args: [{ providedIn: SomeModule }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: provided_in_variants.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<SomeModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<SomeModule>;
}
export declare class PlatformService {
    static ɵfac: i0.ɵɵFactoryDeclaration<PlatformService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PlatformService>;
}
export declare class AnyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<AnyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AnyService>;
}
export declare class ModuleScopedService {
    static ɵfac: i0.ɵɵFactoryDeclaration<ModuleScopedService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ModuleScopedService>;
}

