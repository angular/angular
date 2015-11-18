import { DirectiveIndex } from './directive_record';
import { ProtoRecord } from './proto_record';
import { EventBinding } from './event_binding';
export declare const CONTEXT_ACCESSOR: string;
export declare const CONTEXT_INDEX: number;
/**
 * Returns `s` with all non-identifier characters removed.
 */
export declare function sanitizeName(s: string): string;
/**
 * Class responsible for providing field and local variable names for change detector classes.
 * Also provides some convenience functions, for example, declaring variables, destroying pipes,
 * and dehydrating the detector.
 */
export declare class CodegenNameUtil {
    private _records;
    private _eventBindings;
    private _directiveRecords;
    private _utilName;
    constructor(_records: ProtoRecord[], _eventBindings: EventBinding[], _directiveRecords: any[], _utilName: string);
    getDispatcherName(): string;
    getPipesAccessorName(): string;
    getProtosName(): string;
    getDirectivesAccessorName(): string;
    getLocalsAccessorName(): string;
    getStateName(): string;
    getModeName(): string;
    getPropertyBindingIndex(): string;
    getLocalName(idx: number): string;
    getEventLocalName(eb: EventBinding, idx: number): string;
    getChangeName(idx: number): string;
    /**
     * Generate a statement initializing local variables used when detecting changes.
     */
    genInitLocals(): string;
    /**
     * Generate a statement initializing local variables for event handlers.
     */
    genInitEventLocals(): string;
    getPreventDefaultAccesor(): string;
    getFieldCount(): number;
    getFieldName(idx: number): string;
    getAllFieldNames(): string[];
    /**
     * Generates statements which clear all fields so that the change detector is dehydrated.
     */
    genDehydrateFields(): string;
    /**
     * Generates statements destroying all pipe variables.
     */
    genPipeOnDestroy(): string;
    getPipeName(idx: number): string;
    getDirectiveName(d: DirectiveIndex): string;
    getDetectorName(d: DirectiveIndex): string;
}
