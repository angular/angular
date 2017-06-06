/**
 * Stores error information; delivered via [NgZone.onError] stream.
 */
export class NgZoneError {
    constructor(error, stackTrace) {
        this.error = error;
        this.stackTrace = stackTrace;
    }
}
export class NgZoneImpl {
    constructor({ trace, onEnter, onLeave, setMicrotask, setMacrotask, onError }) {
        this.onEnter = onEnter;
        this.onLeave = onLeave;
        this.setMicrotask = setMicrotask;
        this.setMacrotask = setMacrotask;
        this.onError = onError;
        if (Zone) {
            this.outer = this.inner = Zone.current;
            if (Zone['wtfZoneSpec']) {
                this.inner = this.inner.fork(Zone['wtfZoneSpec']);
            }
            if (trace && Zone['longStackTraceZoneSpec']) {
                this.inner = this.inner.fork(Zone['longStackTraceZoneSpec']);
            }
            this.inner = this.inner.fork({
                name: 'angular',
                properties: { 'isAngularZone': true },
                onInvokeTask: (delegate, current, target, task, applyThis, applyArgs) => {
                    try {
                        this.onEnter();
                        return delegate.invokeTask(target, task, applyThis, applyArgs);
                    }
                    finally {
                        this.onLeave();
                    }
                },
                onInvoke: (delegate, current, target, callback, applyThis, applyArgs, source) => {
                    try {
                        this.onEnter();
                        return delegate.invoke(target, callback, applyThis, applyArgs, source);
                    }
                    finally {
                        this.onLeave();
                    }
                },
                onHasTask: (delegate, current, target, hasTaskState) => {
                    delegate.hasTask(target, hasTaskState);
                    if (current == target) {
                        // We are only interested in hasTask events which originate from our zone
                        // (A child hasTask event is not interesting to us)
                        if (hasTaskState.change == 'microTask') {
                            this.setMicrotask(hasTaskState.microTask);
                        }
                        else if (hasTaskState.change == 'macroTask') {
                            this.setMacrotask(hasTaskState.macroTask);
                        }
                    }
                },
                onHandleError: (delegate, current, target, error) => {
                    delegate.handleError(target, error);
                    this.onError(new NgZoneError(error, error.stack));
                    return false;
                }
            });
        }
        else {
            throw new Error('Angular2 needs to be run with Zone.js polyfill.');
        }
    }
    static isInAngularZone() { return Zone.current.get('isAngularZone') === true; }
    runInner(fn) { return this.inner.run(fn); }
    ;
    runInnerGuarded(fn) { return this.inner.runGuarded(fn); }
    ;
    runOuter(fn) { return this.outer.run(fn); }
    ;
}
