export { ExceptionHandler } from './exception_handler';
export declare class BaseException extends Error {
    message: string;
    stack: any;
    constructor(message?: string);
    toString(): string;
}
/**
 * Wraps an exception and provides additional context or information.
 */
export declare class WrappedException extends Error {
    private _wrapperMessage;
    private _originalException;
    private _originalStack;
    private _context;
    private _wrapperStack;
    constructor(_wrapperMessage: string, _originalException: any, _originalStack?: any, _context?: any);
    wrapperMessage: string;
    wrapperStack: any;
    originalException: any;
    originalStack: any;
    context: any;
    message: string;
    toString(): string;
}
export declare function makeTypeError(message?: string): Error;
export declare function unimplemented(): any;
