import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class Dir {
    a: string;
    aChange: EventEmitter<string>;
    b: EventEmitter<any>;
    c: string;
    cChange: EventEmitter<string>;
    d: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Dir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Dir, "[dir]", never, { "a": { "alias": "a"; "required": false; }; "c": { "alias": "c"; "required": false; }; }, { "aChange": "aChange"; "b": "b"; "cChange": "cChange"; "d": "d"; }, never, never, true, never>;
}
export declare class App {
    value: string;
    noop: () => void;
    static ɵfac: i0.ɵɵFactoryDeclaration<App, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<App, "ng-component", never, {}, {}, never, never, true, never>;
}

