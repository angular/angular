import { Type } from 'angular2/core';
export interface AttrProp {
    prop: string;
    attr: string;
    bracketAttr: string;
    bracketParenAttr: string;
    parenAttr: string;
    onAttr: string;
    bindAttr: string;
    bindonAttr: string;
}
export interface ComponentInfo {
    type: Type;
    selector: string;
    inputs: AttrProp[];
    outputs: AttrProp[];
}
export declare function getComponentInfo(type: Type): ComponentInfo;
export declare function parseFields(names: string[]): AttrProp[];
