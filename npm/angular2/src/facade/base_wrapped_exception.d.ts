/**
 * A base class for the WrappedException that can be used to identify
 * a WrappedException from ExceptionHandler without adding circular
 * dependency.
 */
export declare class BaseWrappedException extends Error {
    constructor(message: string);
    wrapperMessage: string;
    wrapperStack: any;
    originalException: any;
    originalStack: any;
    context: any;
    message: string;
}
