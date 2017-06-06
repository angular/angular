import { PromiseCompleter } from 'angular2/src/facade/promise';
/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
export class AsyncTestCompleter {
    constructor() {
        this._completer = new PromiseCompleter();
    }
    done(value) { this._completer.resolve(value); }
    fail(error, stackTrace) { this._completer.reject(error, stackTrace); }
    get promise() { return this._completer.promise; }
}
