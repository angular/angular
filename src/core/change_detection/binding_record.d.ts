import { SetterFn } from 'angular2/src/core/reflection/types';
import { AST } from './parser/ast';
import { DirectiveIndex, DirectiveRecord } from './directive_record';
export declare class BindingTarget {
    mode: string;
    elementIndex: number;
    name: string;
    unit: string;
    debug: string;
    constructor(mode: string, elementIndex: number, name: string, unit: string, debug: string);
    isDirective(): boolean;
    isElementProperty(): boolean;
    isElementAttribute(): boolean;
    isElementClass(): boolean;
    isElementStyle(): boolean;
    isTextNode(): boolean;
}
export declare class BindingRecord {
    mode: string;
    target: BindingTarget;
    implicitReceiver: any;
    ast: AST;
    setter: SetterFn;
    lifecycleEvent: string;
    directiveRecord: DirectiveRecord;
    constructor(mode: string, target: BindingTarget, implicitReceiver: any, ast: AST, setter: SetterFn, lifecycleEvent: string, directiveRecord: DirectiveRecord);
    isDirectiveLifecycle(): boolean;
    callOnChanges(): boolean;
    isDefaultChangeDetection(): boolean;
    static createDirectiveDoCheck(directiveRecord: DirectiveRecord): BindingRecord;
    static createDirectiveOnInit(directiveRecord: DirectiveRecord): BindingRecord;
    static createDirectiveOnChanges(directiveRecord: DirectiveRecord): BindingRecord;
    static createForDirective(ast: AST, propertyName: string, setter: SetterFn, directiveRecord: DirectiveRecord): BindingRecord;
    static createForElementProperty(ast: AST, elementIndex: number, propertyName: string): BindingRecord;
    static createForElementAttribute(ast: AST, elementIndex: number, attributeName: string): BindingRecord;
    static createForElementClass(ast: AST, elementIndex: number, className: string): BindingRecord;
    static createForElementStyle(ast: AST, elementIndex: number, styleName: string, unit: string): BindingRecord;
    static createForHostProperty(directiveIndex: DirectiveIndex, ast: AST, propertyName: string): BindingRecord;
    static createForHostAttribute(directiveIndex: DirectiveIndex, ast: AST, attributeName: string): BindingRecord;
    static createForHostClass(directiveIndex: DirectiveIndex, ast: AST, className: string): BindingRecord;
    static createForHostStyle(directiveIndex: DirectiveIndex, ast: AST, styleName: string, unit: string): BindingRecord;
    static createForTextNode(ast: AST, elementIndex: number): BindingRecord;
    static createForEvent(ast: AST, eventName: string, elementIndex: number): BindingRecord;
    static createForHostEvent(ast: AST, eventName: string, directiveRecord: DirectiveRecord): BindingRecord;
}
