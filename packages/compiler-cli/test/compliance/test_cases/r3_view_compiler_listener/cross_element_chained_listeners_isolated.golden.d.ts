import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class SomeComp {
    update: EventEmitter<any>;
    delete: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SomeComp, "some-comp", never, {}, { "update": "update"; "delete": "delete"; }, never, never, false, never>;
}
export declare class MyComponent {
    click(): void;
    change(): void;
    delete(): void;
    update(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

