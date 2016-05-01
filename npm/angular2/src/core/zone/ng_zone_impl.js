'use strict';"use strict";
/**
 * Stores error information; delivered via [NgZone.onError] stream.
 */
var NgZoneError = (function () {
    function NgZoneError(error, stackTrace) {
        this.error = error;
        this.stackTrace = stackTrace;
    }
    return NgZoneError;
}());
exports.NgZoneError = NgZoneError;
var NgZoneImpl = (function () {
    function NgZoneImpl(_a) {
        var _this = this;
        var trace = _a.trace, onEnter = _a.onEnter, onLeave = _a.onLeave, setMicrotask = _a.setMicrotask, setMacrotask = _a.setMacrotask, onError = _a.onError;
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
                onInvokeTask: function (delegate, current, target, task, applyThis, applyArgs) {
                    try {
                        _this.onEnter();
                        return delegate.invokeTask(target, task, applyThis, applyArgs);
                    }
                    finally {
                        _this.onLeave();
                    }
                },
                onInvoke: function (delegate, current, target, callback, applyThis, applyArgs, source) {
                    try {
                        _this.onEnter();
                        return delegate.invoke(target, callback, applyThis, applyArgs, source);
                    }
                    finally {
                        _this.onLeave();
                    }
                },
                onHasTask: function (delegate, current, target, hasTaskState) {
                    delegate.hasTask(target, hasTaskState);
                    if (current == target) {
                        // We are only interested in hasTask events which originate from our zone
                        // (A child hasTask event is not interesting to us)
                        if (hasTaskState.change == 'microTask') {
                            _this.setMicrotask(hasTaskState.microTask);
                        }
                        else if (hasTaskState.change == 'macroTask') {
                            _this.setMacrotask(hasTaskState.macroTask);
                        }
                    }
                },
                onHandleError: function (delegate, current, target, error) {
                    delegate.handleError(target, error);
                    _this.onError(new NgZoneError(error, error.stack));
                    return false;
                }
            });
        }
        else {
            throw new Error('Angular2 needs to be run with Zone.js polyfill.');
        }
    }
    NgZoneImpl.isInAngularZone = function () { return Zone.current.get('isAngularZone') === true; };
    NgZoneImpl.prototype.runInner = function (fn) { return this.inner.run(fn); };
    ;
    NgZoneImpl.prototype.runInnerGuarded = function (fn) { return this.inner.runGuarded(fn); };
    ;
    NgZoneImpl.prototype.runOuter = function (fn) { return this.outer.run(fn); };
    ;
    return NgZoneImpl;
}());
exports.NgZoneImpl = NgZoneImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZV9pbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lX2ltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBOztHQUVHO0FBQ0g7SUFDRSxxQkFBbUIsS0FBVSxFQUFTLFVBQWU7UUFBbEMsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUFTLGVBQVUsR0FBVixVQUFVLENBQUs7SUFBRyxDQUFDO0lBQzNELGtCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFGWSxtQkFBVyxjQUV2QixDQUFBO0FBR0Q7SUFjRSxvQkFBWSxFQU9YO1FBckJILGlCQXlGQztZQTNFYyxnQkFBSyxFQUFFLG9CQUFPLEVBQUUsb0JBQU8sRUFBRSw4QkFBWSxFQUFFLDhCQUFZLEVBQUUsb0JBQU87UUFRdkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLEtB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TSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7SUFDM0Qsb0NBQWUsR0FBZixVQUFnQixFQUFhLElBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7SUFDekUsNkJBQVEsR0FBUixVQUFTLEVBQWEsSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUM3RCxpQkFBQztBQUFELENBQUMsQUF6RkQsSUF5RkM7QUF6Rlksa0JBQVUsYUF5RnRCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2dsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBTdG9yZXMgZXJyb3IgaW5mb3JtYXRpb247IGRlbGl2ZXJlZCB2aWEgW05nWm9uZS5vbkVycm9yXSBzdHJlYW0uXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ1pvbmVFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlcnJvcjogYW55LCBwdWJsaWMgc3RhY2tUcmFjZTogYW55KSB7fVxufVxuXG5cbmV4cG9ydCBjbGFzcyBOZ1pvbmVJbXBsIHtcbiAgc3RhdGljIGlzSW5Bbmd1bGFyWm9uZSgpOiBib29sZWFuIHsgcmV0dXJuIFpvbmUuY3VycmVudC5nZXQoJ2lzQW5ndWxhclpvbmUnKSA9PT0gdHJ1ZTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBvdXRlcjogWm9uZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIGlubmVyOiBab25lO1xuXG4gIHByaXZhdGUgb25FbnRlcjogKCkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBvbkxlYXZlOiAoKSA9PiB2b2lkO1xuICBwcml2YXRlIHNldE1pY3JvdGFzazogKGhhc01pY3JvdGFza3M6IGJvb2xlYW4pID0+IHZvaWQ7XG4gIHByaXZhdGUgc2V0TWFjcm90YXNrOiAoaGFzTWFjcm90YXNrczogYm9vbGVhbikgPT4gdm9pZDtcbiAgcHJpdmF0ZSBvbkVycm9yOiAoZXJyb3I6IE5nWm9uZUVycm9yKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHt0cmFjZSwgb25FbnRlciwgb25MZWF2ZSwgc2V0TWljcm90YXNrLCBzZXRNYWNyb3Rhc2ssIG9uRXJyb3J9OiB7XG4gICAgdHJhY2U6IGJvb2xlYW4sXG4gICAgb25FbnRlcjogKCkgPT4gdm9pZCxcbiAgICBvbkxlYXZlOiAoKSA9PiB2b2lkLFxuICAgIHNldE1pY3JvdGFzazogKGhhc01pY3JvdGFza3M6IGJvb2xlYW4pID0+IHZvaWQsXG4gICAgc2V0TWFjcm90YXNrOiAoaGFzTWFjcm90YXNrczogYm9vbGVhbikgPT4gdm9pZCxcbiAgICBvbkVycm9yOiAoZXJyb3I6IE5nWm9uZUVycm9yKSA9PiB2b2lkXG4gIH0pIHtcbiAgICB0aGlzLm9uRW50ZXIgPSBvbkVudGVyO1xuICAgIHRoaXMub25MZWF2ZSA9IG9uTGVhdmU7XG4gICAgdGhpcy5zZXRNaWNyb3Rhc2sgPSBzZXRNaWNyb3Rhc2s7XG4gICAgdGhpcy5zZXRNYWNyb3Rhc2sgPSBzZXRNYWNyb3Rhc2s7XG4gICAgdGhpcy5vbkVycm9yID0gb25FcnJvcjtcblxuICAgIGlmIChab25lKSB7XG4gICAgICB0aGlzLm91dGVyID0gdGhpcy5pbm5lciA9IFpvbmUuY3VycmVudDtcbiAgICAgIGlmIChab25lWyd3dGZab25lU3BlYyddKSB7XG4gICAgICAgIHRoaXMuaW5uZXIgPSB0aGlzLmlubmVyLmZvcmsoWm9uZVsnd3RmWm9uZVNwZWMnXSk7XG4gICAgICB9XG4gICAgICBpZiAodHJhY2UgJiYgWm9uZVsnbG9uZ1N0YWNrVHJhY2Vab25lU3BlYyddKSB7XG4gICAgICAgIHRoaXMuaW5uZXIgPSB0aGlzLmlubmVyLmZvcmsoWm9uZVsnbG9uZ1N0YWNrVHJhY2Vab25lU3BlYyddKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5uZXIgPSB0aGlzLmlubmVyLmZvcmsoe1xuICAgICAgICBuYW1lOiAnYW5ndWxhcicsXG4gICAgICAgIHByb3BlcnRpZXM6PGFueT57J2lzQW5ndWxhclpvbmUnOiB0cnVlfSxcbiAgICAgICAgb25JbnZva2VUYXNrOiAoZGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSwgY3VycmVudDogWm9uZSwgdGFyZ2V0OiBab25lLCB0YXNrOiBUYXNrLFxuICAgICAgICAgICAgICAgICAgICAgICBhcHBseVRoaXM6IGFueSwgYXBwbHlBcmdzOiBhbnkpOiBhbnkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLm9uRW50ZXIoKTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZS5pbnZva2VUYXNrKHRhcmdldCwgdGFzaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLm9uTGVhdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblxuICAgICAgICBvbkludm9rZTogKGRlbGVnYXRlOiBab25lRGVsZWdhdGUsIGN1cnJlbnQ6IFpvbmUsIHRhcmdldDogWm9uZSwgY2FsbGJhY2s6IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgIGFwcGx5VGhpczogYW55LCBhcHBseUFyZ3M6IGFueVtdLCBzb3VyY2U6IHN0cmluZyk6IGFueSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMub25FbnRlcigpO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmludm9rZSh0YXJnZXQsIGNhbGxiYWNrLCBhcHBseVRoaXMsIGFwcGx5QXJncywgc291cmNlKTtcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5vbkxlYXZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uSGFzVGFzazpcbiAgICAgICAgICAgIChkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIGhhc1Rhc2tTdGF0ZTogSGFzVGFza1N0YXRlKSA9PiB7XG4gICAgICAgICAgICAgIGRlbGVnYXRlLmhhc1Rhc2sodGFyZ2V0LCBoYXNUYXNrU3RhdGUpO1xuICAgICAgICAgICAgICBpZiAoY3VycmVudCA9PSB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBhcmUgb25seSBpbnRlcmVzdGVkIGluIGhhc1Rhc2sgZXZlbnRzIHdoaWNoIG9yaWdpbmF0ZSBmcm9tIG91ciB6b25lXG4gICAgICAgICAgICAgICAgLy8gKEEgY2hpbGQgaGFzVGFzayBldmVudCBpcyBub3QgaW50ZXJlc3RpbmcgdG8gdXMpXG4gICAgICAgICAgICAgICAgaWYgKGhhc1Rhc2tTdGF0ZS5jaGFuZ2UgPT0gJ21pY3JvVGFzaycpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TWljcm90YXNrKGhhc1Rhc2tTdGF0ZS5taWNyb1Rhc2spO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzVGFza1N0YXRlLmNoYW5nZSA9PSAnbWFjcm9UYXNrJykge1xuICAgICAgICAgICAgICAgICAgdGhpcy5zZXRNYWNyb3Rhc2soaGFzVGFza1N0YXRlLm1hY3JvVGFzayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIG9uSGFuZGxlRXJyb3I6IChkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIGVycm9yOiBhbnkpOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGVnYXRlLmhhbmRsZUVycm9yKHRhcmdldCwgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IobmV3IE5nWm9uZUVycm9yKGVycm9yLCBlcnJvci5zdGFjaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbmd1bGFyMiBuZWVkcyB0byBiZSBydW4gd2l0aCBab25lLmpzIHBvbHlmaWxsLicpO1xuICAgIH1cbiAgfVxuXG4gIHJ1bklubmVyKGZuOiAoKSA9PiBhbnkpOiBhbnkgeyByZXR1cm4gdGhpcy5pbm5lci5ydW4oZm4pOyB9O1xuICBydW5Jbm5lckd1YXJkZWQoZm46ICgpID0+IGFueSk6IGFueSB7IHJldHVybiB0aGlzLmlubmVyLnJ1bkd1YXJkZWQoZm4pOyB9O1xuICBydW5PdXRlcihmbjogKCkgPT4gYW55KTogYW55IHsgcmV0dXJuIHRoaXMub3V0ZXIucnVuKGZuKTsgfTtcbn1cbiJdfQ==