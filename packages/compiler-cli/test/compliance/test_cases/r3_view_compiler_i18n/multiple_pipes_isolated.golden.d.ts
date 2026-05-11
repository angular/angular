import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class MyComponent {
    valueA: number;
    valueB: number;
    valueC: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class PipeA implements PipeTransform {
    transform(): null;
    static ɵfac: i0.ɵɵFactoryDeclaration<PipeA, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PipeA, "pipeA", false>;
}
export declare class PipeB implements PipeTransform {
    transform(): null;
    static ɵfac: i0.ɵɵFactoryDeclaration<PipeB, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PipeB, "pipeB", false>;
}
export declare class PipeC implements PipeTransform {
    transform(): null;
    static ɵfac: i0.ɵɵFactoryDeclaration<PipeC, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PipeC, "pipeC", false>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

