import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class HostDir {
    value: number;
    color: string;
    opened: EventEmitter<any>;
    closed: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, never, never, { "value": { "alias": "value"; "required": false; }; "color": { "alias": "color"; "required": false; }; }, { "opened": "opened"; "closed": "closed"; }, never, never, true, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, [{ directive: typeof HostDir; inputs: { "value": "value"; "color": "colorAlias"; }; outputs: { "opened": "opened"; "closed": "closedAlias"; }; }]>;
}

