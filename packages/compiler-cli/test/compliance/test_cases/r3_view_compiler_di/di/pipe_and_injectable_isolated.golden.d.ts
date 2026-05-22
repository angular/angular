import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
declare class Service {
    static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Service>;
}
export declare class MyPipe implements PipeTransform {
    constructor(service: Service);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe", false>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyPipe>;
}
export declare class MyOtherPipe implements PipeTransform {
    constructor(service: Service);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyOtherPipe, "myOtherPipe", false>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyOtherPipe>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}
export {};

