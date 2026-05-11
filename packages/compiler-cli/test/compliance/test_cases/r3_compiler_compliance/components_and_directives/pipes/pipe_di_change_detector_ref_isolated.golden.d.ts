import { ChangeDetectorRef, PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyPipe implements PipeTransform {
    constructor(changeDetectorRef: ChangeDetectorRef);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe", false>;
}
export declare class MyOtherPipe implements PipeTransform {
    constructor(changeDetectorRef: ChangeDetectorRef);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherPipe, [{ optional: true; }]>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyOtherPipe, "myOtherPipe", false>;
}
export declare class MyApp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

