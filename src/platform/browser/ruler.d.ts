import { Promise } from 'angular2/src/facade/async';
import { DomAdapter } from 'angular2/src/core/dom/dom_adapter';
import { ElementRef } from 'angular2/src/core/linker/element_ref';
export declare class Rectangle {
    left: any;
    right: any;
    top: any;
    bottom: any;
    height: any;
    width: any;
    constructor(left: any, top: any, width: any, height: any);
}
export declare class Ruler {
    domAdapter: DomAdapter;
    constructor(domAdapter: DomAdapter);
    measure(el: ElementRef): Promise<Rectangle>;
}
