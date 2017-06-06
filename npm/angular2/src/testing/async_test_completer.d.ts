/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
export declare class AsyncTestCompleter {
    private _completer;
    done(value?: any): void;
    fail(error?: any, stackTrace?: string): void;
    promise: Promise<any>;
}
