import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class TestDir {
    counter: import("@angular/core").ModelSignal<number>;
    modelWithAlias: import("@angular/core").ModelSignal<boolean>;
    decoratorInput: boolean;
    decoratorInputWithAlias: boolean;
    decoratorOutput: EventEmitter<boolean>;
    decoratorOutputWithAlias: EventEmitter<boolean>;
    decoratorInputTwoWay: boolean;
    decoratorInputTwoWayChange: EventEmitter<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, { "counter": { "alias": "counter"; "required": false; "isSignal": true; }; "modelWithAlias": { "alias": "alias"; "required": false; "isSignal": true; }; "decoratorInput": { "alias": "decoratorInput"; "required": false; }; "decoratorInputWithAlias": { "alias": "publicNameDecorator"; "required": false; }; "decoratorInputTwoWay": { "alias": "decoratorInputTwoWay"; "required": false; }; }, { "counter": "counterChange"; "modelWithAlias": "aliasChange"; "decoratorOutput": "decoratorOutput"; "decoratorOutputWithAlias": "aliasDecoratorOutputWithAlias"; "decoratorInputTwoWayChange": "decoratorInputTwoWayChange"; }, never, never, true, never>;
}

