import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class HostDir {
    value: number;
    color: string;
    opened: EventEmitter<any>;
    closed: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, never, never, { "value": { "alias": "valueAlias"; "required": false; }; "color": { "alias": "colorAlias"; "required": false; }; }, { "opened": "openedAlias"; "closed": "closedAlias"; }, never, never, true, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, [{ directive: typeof HostDir; inputs: { "valueAlias": "valueAlias"; "colorAlias": "customColorAlias"; }; outputs: { "openedAlias": "openedAlias"; "closedAlias": "customClosedAlias"; }; }]>;
}

