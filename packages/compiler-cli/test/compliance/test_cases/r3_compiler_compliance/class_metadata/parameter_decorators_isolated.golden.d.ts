import { InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
export declare const TOKEN: InjectionToken<string>;
declare class Service {
}
export declare class ParameterizedInjectable {
    constructor(service: Service, token: string, custom: Service, mixed: string);
    static ɵfac: i0.ɵɵFactoryDeclaration<ParameterizedInjectable, [null, null, null, { skipSelf: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ParameterizedInjectable>;
}
export declare class NoCtor {
    static ɵfac: i0.ɵɵFactoryDeclaration<NoCtor, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NoCtor>;
}
export declare class EmptyCtor {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<EmptyCtor, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<EmptyCtor>;
}
export declare class NoDecorators {
    constructor(service: Service);
    static ɵfac: i0.ɵɵFactoryDeclaration<NoDecorators, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NoDecorators>;
}
export declare class CustomInjectable {
    constructor(service: Service);
    static ɵfac: i0.ɵɵFactoryDeclaration<CustomInjectable, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CustomInjectable>;
}
export declare class DerivedInjectable extends ParameterizedInjectable {
    static ɵfac: i0.ɵɵFactoryDeclaration<DerivedInjectable, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DerivedInjectable>;
}
export declare class DerivedInjectableWithCtor extends ParameterizedInjectable {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<DerivedInjectableWithCtor, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DerivedInjectableWithCtor>;
}
export {};

