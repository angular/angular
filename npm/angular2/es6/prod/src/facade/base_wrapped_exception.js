/**
 * A base class for the WrappedException that can be used to identify
 * a WrappedException from ExceptionHandler without adding circular
 * dependency.
 */
export class BaseWrappedException extends Error {
    constructor(message) {
        super(message);
    }
    get wrapperMessage() { return ''; }
    get wrapperStack() { return null; }
    get originalException() { return null; }
    get originalStack() { return null; }
    get context() { return null; }
    get message() { return ''; }
}
