import { ExceptionHandler } from './exception_handler';
export { ExceptionHandler } from './exception_handler';
export class BaseException extends Error {
    constructor(message = "--") {
        super(message);
        this.message = message;
        this.stack = (new Error(message)).stack;
    }
    toString() { return this.message; }
}
/**
 * Wraps an exception and provides additional context or information.
 */
export class WrappedException extends Error {
    constructor(_wrapperMessage, _originalException, _originalStack, _context) {
        super(_wrapperMessage);
        this._wrapperMessage = _wrapperMessage;
        this._originalException = _originalException;
        this._originalStack = _originalStack;
        this._context = _context;
        this._wrapperStack = (new Error(_wrapperMessage)).stack;
    }
    get wrapperMessage() { return this._wrapperMessage; }
    get wrapperStack() { return this._wrapperStack; }
    get originalException() { return this._originalException; }
    get originalStack() { return this._originalStack; }
    get context() { return this._context; }
    get message() { return ExceptionHandler.exceptionToString(this); }
    toString() { return this.message; }
}
export function makeTypeError(message) {
    return new TypeError(message);
}
export function unimplemented() {
    throw new BaseException('unimplemented');
}
