import * as o from '../output/output_ast';
import { CompileElement } from './compile_element';
import { BoundEventAst, DirectiveAst } from '../template_ast';
import { CompileDirectiveMetadata } from '../compile_metadata';
export declare class CompileEventListener {
    compileElement: CompileElement;
    eventTarget: string;
    eventName: string;
    private _method;
    private _hasComponentHostListener;
    private _methodName;
    private _eventParam;
    private _actionResultExprs;
    static getOrCreate(compileElement: CompileElement, eventTarget: string, eventName: string, targetEventListeners: CompileEventListener[]): CompileEventListener;
    constructor(compileElement: CompileElement, eventTarget: string, eventName: string, listenerIndex: number);
    addAction(hostEvent: BoundEventAst, directive: CompileDirectiveMetadata, directiveInstance: o.Expression): void;
    finishMethod(): void;
    listenToRenderer(): void;
    listenToDirective(directiveInstance: o.Expression, observablePropName: string): void;
}
export declare function collectEventListeners(hostEvents: BoundEventAst[], dirs: DirectiveAst[], compileElement: CompileElement): CompileEventListener[];
export declare function bindDirectiveOutputs(directiveAst: DirectiveAst, directiveInstance: o.Expression, eventListeners: CompileEventListener[]): void;
export declare function bindRenderOutputs(eventListeners: CompileEventListener[]): void;
