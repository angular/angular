import { ChangeDetectionStrategy } from './constants';
export declare class DirectiveIndex {
    elementIndex: number;
    directiveIndex: number;
    constructor(elementIndex: number, directiveIndex: number);
    name: string;
}
export declare class DirectiveRecord {
    directiveIndex: DirectiveIndex;
    callAfterContentInit: boolean;
    callAfterContentChecked: boolean;
    callAfterViewInit: boolean;
    callAfterViewChecked: boolean;
    callOnChanges: boolean;
    callDoCheck: boolean;
    callOnInit: boolean;
    changeDetection: ChangeDetectionStrategy;
    constructor({directiveIndex, callAfterContentInit, callAfterContentChecked, callAfterViewInit, callAfterViewChecked, callOnChanges, callDoCheck, callOnInit, changeDetection}?: {
        directiveIndex?: DirectiveIndex;
        callAfterContentInit?: boolean;
        callAfterContentChecked?: boolean;
        callAfterViewInit?: boolean;
        callAfterViewChecked?: boolean;
        callOnChanges?: boolean;
        callDoCheck?: boolean;
        callOnInit?: boolean;
        changeDetection?: ChangeDetectionStrategy;
    });
    isDefaultChangeDetection(): boolean;
}
