import * as i0 from "@angular/core";
export declare class NgModelDirective {
    ngModel: import("@angular/core").ModelSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgModelDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgModelDirective, "[ngModel]", never, { "ngModel": { "alias": "ngModel"; "required": true; "isSignal": true; }; }, { "ngModel": "ngModelChange"; }, never, never, true, never>;
}
export declare class TestCmp {
    names: import("@angular/core").WritableSignal<string>[];
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "ng-component", never, {}, {}, never, never, true, never>;
}

