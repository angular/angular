import { Locals } from './parser/locals';
import { BindingTarget, BindingRecord } from './binding_record';
import { DirectiveRecord, DirectiveIndex } from './directive_record';
import { ChangeDetectionStrategy } from './constants';
import { ChangeDetectorRef } from './change_detector_ref';
export declare class DebugContext {
    element: any;
    componentElement: any;
    directive: any;
    context: any;
    locals: any;
    injector: any;
    constructor(element: any, componentElement: any, directive: any, context: any, locals: any, injector: any);
}
export interface ChangeDispatcher {
    getDebugContext(appElement: any, elementIndex: number, directiveIndex: number): DebugContext;
    notifyOnBinding(bindingTarget: BindingTarget, value: any): void;
    logBindingUpdate(bindingTarget: BindingTarget, value: any): void;
    notifyAfterContentChecked(): void;
    notifyAfterViewChecked(): void;
    notifyOnDestroy(): void;
    getDetectorFor(directiveIndex: DirectiveIndex): ChangeDetector;
    getDirectiveFor(directiveIndex: DirectiveIndex): any;
}
export interface ChangeDetector {
    parent: ChangeDetector;
    mode: ChangeDetectionStrategy;
    ref: ChangeDetectorRef;
    addContentChild(cd: ChangeDetector): void;
    addViewChild(cd: ChangeDetector): void;
    removeContentChild(cd: ChangeDetector): void;
    removeViewChild(cd: ChangeDetector): void;
    remove(): void;
    hydrate(context: any, locals: Locals, dispatcher: ChangeDispatcher, pipes: any): void;
    dehydrate(): void;
    markPathToRootAsCheckOnce(): void;
    handleEvent(eventName: string, elIndex: number, event: any): any;
    detectChanges(): void;
    checkNoChanges(): void;
    destroyRecursive(): void;
    markAsCheckOnce(): void;
}
export interface ProtoChangeDetector {
    instantiate(): ChangeDetector;
}
export declare class ChangeDetectorGenConfig {
    genDebugInfo: boolean;
    logBindingUpdate: boolean;
    useJit: boolean;
    constructor(genDebugInfo: boolean, logBindingUpdate: boolean, useJit: boolean);
}
export declare class ChangeDetectorDefinition {
    id: string;
    strategy: ChangeDetectionStrategy;
    variableNames: string[];
    bindingRecords: BindingRecord[];
    eventRecords: BindingRecord[];
    directiveRecords: DirectiveRecord[];
    genConfig: ChangeDetectorGenConfig;
    constructor(id: string, strategy: ChangeDetectionStrategy, variableNames: string[], bindingRecords: BindingRecord[], eventRecords: BindingRecord[], directiveRecords: DirectiveRecord[], genConfig: ChangeDetectorGenConfig);
}
