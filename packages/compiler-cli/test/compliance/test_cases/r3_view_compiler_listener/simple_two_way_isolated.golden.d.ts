import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class TestCmp {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, false, never>;
}
export declare class NgModelDirective {
    ngModel: string;
    ngModelChange: EventEmitter<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgModelDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgModelDirective, "[ngModel]", never, { "ngModel": { "alias": "ngModel"; "required": false; }; }, { "ngModelChange": "ngModelChange"; }, never, never, false, never>;
}
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AppModule>;
}

