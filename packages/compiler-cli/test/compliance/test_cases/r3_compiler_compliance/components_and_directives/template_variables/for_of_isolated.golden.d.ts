import { SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
export interface ForOfContext {
    $implicit: any;
    index: number;
    even: boolean;
    odd: boolean;
}
export declare class ForOfDirective {
    private view;
    private template;
    private previous;
    constructor(view: ViewContainerRef, template: TemplateRef<any>);
    forOf: any[];
    ngOnChanges(simpleChanges: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ForOfDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ForOfDirective, "[forOf]", never, { "forOf": { "alias": "forOf"; "required": false; }; }, {}, never, never, false, never>;
}

