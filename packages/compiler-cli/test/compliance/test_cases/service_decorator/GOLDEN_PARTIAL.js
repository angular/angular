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

