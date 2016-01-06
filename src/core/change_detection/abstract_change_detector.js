'use strict';var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var change_detection_util_1 = require('./change_detection_util');
var change_detector_ref_1 = require('./change_detector_ref');
var exceptions_1 = require('./exceptions');
var locals_1 = require('./parser/locals');
var constants_1 = require('./constants');
var profile_1 = require('../profile/profile');
var observable_facade_1 = require('./observable_facade');
var _scope_check = profile_1.wtfCreateScope("ChangeDetector#check(ascii id, bool throwOnChange)");
var _Context = (function () {
    function _Context(element, componentElement, context, locals, injector, expression) {
        this.element = element;
        this.componentElement = componentElement;
        this.context = context;
        this.locals = locals;
        this.injector = injector;
        this.expression = expression;
    }
    return _Context;
})();
var AbstractChangeDetector = (function () {
    function AbstractChangeDetector(id, numberOfPropertyProtoRecords, bindingTargets, directiveIndices, strategy) {
        this.id = id;
        this.numberOfPropertyProtoRecords = numberOfPropertyProtoRecords;
        this.bindingTargets = bindingTargets;
        this.directiveIndices = directiveIndices;
        this.strategy = strategy;
        this.contentChildren = [];
        this.viewChildren = [];
        // The names of the below fields must be kept in sync with codegen_name_util.ts or
        // change detection will fail.
        this.state = constants_1.ChangeDetectorState.NeverChecked;
        this.locals = null;
        this.mode = null;
        this.pipes = null;
        this.ref = new change_detector_ref_1.ChangeDetectorRef_(this);
    }
    AbstractChangeDetector.prototype.addContentChild = function (cd) {
        this.contentChildren.push(cd);
        cd.parent = this;
    };
    AbstractChangeDetector.prototype.removeContentChild = function (cd) { collection_1.ListWrapper.remove(this.contentChildren, cd); };
    AbstractChangeDetector.prototype.addViewChild = function (cd) {
        this.viewChildren.push(cd);
        cd.parent = this;
    };
    AbstractChangeDetector.prototype.removeViewChild = function (cd) { collection_1.ListWrapper.remove(this.viewChildren, cd); };
    AbstractChangeDetector.prototype.remove = function () { this.parent.removeContentChild(this); };
    AbstractChangeDetector.prototype.handleEvent = function (eventName, elIndex, event) {
        if (!this.hydrated()) {
            return true;
        }
        try {
            var locals = new Map();
            locals.set('$event', event);
            var res = !this.handleEventInternal(eventName, elIndex, new locals_1.Locals(this.locals, locals));
            this.markPathToRootAsCheckOnce();
            return res;
        }
        catch (e) {
            var c = this.dispatcher.getDebugContext(null, elIndex, null);
            var context = lang_1.isPresent(c) ?
                new exceptions_1.EventEvaluationErrorContext(c.element, c.componentElement, c.context, c.locals, c.injector) :
                null;
            throw new exceptions_1.EventEvaluationError(eventName, e, e.stack, context);
        }
    };
    AbstractChangeDetector.prototype.handleEventInternal = function (eventName, elIndex, locals) { return false; };
    AbstractChangeDetector.prototype.detectChanges = function () { this.runDetectChanges(false); };
    AbstractChangeDetector.prototype.checkNoChanges = function () {
        if (lang_1.assertionsEnabled()) {
            this.runDetectChanges(true);
        }
    };
    AbstractChangeDetector.prototype.runDetectChanges = function (throwOnChange) {
        if (this.mode === constants_1.ChangeDetectionStrategy.Detached ||
            this.mode === constants_1.ChangeDetectionStrategy.Checked || this.state === constants_1.ChangeDetectorState.Errored)
            return;
        var s = _scope_check(this.id, throwOnChange);
        this.detectChangesInRecords(throwOnChange);
        this._detectChangesContentChildren(throwOnChange);
        if (!throwOnChange)
            this.afterContentLifecycleCallbacks();
        this._detectChangesInViewChildren(throwOnChange);
        if (!throwOnChange)
            this.afterViewLifecycleCallbacks();
        if (this.mode === constants_1.ChangeDetectionStrategy.CheckOnce)
            this.mode = constants_1.ChangeDetectionStrategy.Checked;
        this.state = constants_1.ChangeDetectorState.CheckedBefore;
        profile_1.wtfLeave(s);
    };
    // This method is not intended to be overridden. Subclasses should instead provide an
    // implementation of `detectChangesInRecordsInternal` which does the work of detecting changes
    // and which this method will call.
    // This method expects that `detectChangesInRecordsInternal` will set the property
    // `this.propertyBindingIndex` to the propertyBindingIndex of the first proto record. This is to
    // facilitate error reporting.
    AbstractChangeDetector.prototype.detectChangesInRecords = function (throwOnChange) {
        if (!this.hydrated()) {
            this.throwDehydratedError();
        }
        try {
            this.detectChangesInRecordsInternal(throwOnChange);
        }
        catch (e) {
            // throwOnChange errors aren't counted as fatal errors.
            if (!(e instanceof exceptions_1.ExpressionChangedAfterItHasBeenCheckedException)) {
                this.state = constants_1.ChangeDetectorState.Errored;
            }
            this._throwError(e, e.stack);
        }
    };
    // Subclasses should override this method to perform any work necessary to detect and report
    // changes. For example, changes should be reported via `ChangeDetectionUtil.addChange`, lifecycle
    // methods should be called, etc.
    // This implementation should also set `this.propertyBindingIndex` to the propertyBindingIndex of
    // the
    // first proto record to facilitate error reporting. See {@link #detectChangesInRecords}.
    AbstractChangeDetector.prototype.detectChangesInRecordsInternal = function (throwOnChange) { };
    // This method is not intended to be overridden. Subclasses should instead provide an
    // implementation of `hydrateDirectives`.
    AbstractChangeDetector.prototype.hydrate = function (context, locals, dispatcher, pipes) {
        this.dispatcher = dispatcher;
        this.mode = change_detection_util_1.ChangeDetectionUtil.changeDetectionMode(this.strategy);
        this.context = context;
        if (this.strategy === constants_1.ChangeDetectionStrategy.OnPushObserve) {
            this.observeComponent(context);
        }
        this.locals = locals;
        this.pipes = pipes;
        this.hydrateDirectives(dispatcher);
        this.state = constants_1.ChangeDetectorState.NeverChecked;
    };
    // Subclasses should override this method to hydrate any directives.
    AbstractChangeDetector.prototype.hydrateDirectives = function (dispatcher) { };
    // This method is not intended to be overridden. Subclasses should instead provide an
    // implementation of `dehydrateDirectives`.
    AbstractChangeDetector.prototype.dehydrate = function () {
        this.dehydrateDirectives(true);
        // This is an experimental feature. Works only in Dart.
        if (this.strategy === constants_1.ChangeDetectionStrategy.OnPushObserve) {
            this._unsubsribeFromObservables();
        }
        this.dispatcher = null;
        this.context = null;
        this.locals = null;
        this.pipes = null;
    };
    // Subclasses should override this method to dehydrate any directives. This method should reverse
    // any work done in `hydrateDirectives`.
    AbstractChangeDetector.prototype.dehydrateDirectives = function (destroyPipes) { };
    AbstractChangeDetector.prototype.hydrated = function () { return lang_1.isPresent(this.context); };
    AbstractChangeDetector.prototype.destroyRecursive = function () {
        this.dispatcher.notifyOnDestroy();
        this.dehydrate();
        var children = this.contentChildren;
        for (var i = 0; i < children.length; i++) {
            children[i].destroyRecursive();
        }
        children = this.viewChildren;
        for (var i = 0; i < children.length; i++) {
            children[i].destroyRecursive();
        }
    };
    AbstractChangeDetector.prototype.afterContentLifecycleCallbacks = function () {
        this.dispatcher.notifyAfterContentChecked();
        this.afterContentLifecycleCallbacksInternal();
    };
    AbstractChangeDetector.prototype.afterContentLifecycleCallbacksInternal = function () { };
    AbstractChangeDetector.prototype.afterViewLifecycleCallbacks = function () {
        this.dispatcher.notifyAfterViewChecked();
        this.afterViewLifecycleCallbacksInternal();
    };
    AbstractChangeDetector.prototype.afterViewLifecycleCallbacksInternal = function () { };
    /** @internal */
    AbstractChangeDetector.prototype._detectChangesContentChildren = function (throwOnChange) {
        var c = this.contentChildren;
        for (var i = 0; i < c.length; ++i) {
            c[i].runDetectChanges(throwOnChange);
        }
    };
    /** @internal */
    AbstractChangeDetector.prototype._detectChangesInViewChildren = function (throwOnChange) {
        var c = this.viewChildren;
        for (var i = 0; i < c.length; ++i) {
            c[i].runDetectChanges(throwOnChange);
        }
    };
    AbstractChangeDetector.prototype.markAsCheckOnce = function () { this.mode = constants_1.ChangeDetectionStrategy.CheckOnce; };
    AbstractChangeDetector.prototype.markPathToRootAsCheckOnce = function () {
        var c = this;
        while (lang_1.isPresent(c) && c.mode !== constants_1.ChangeDetectionStrategy.Detached) {
            if (c.mode === constants_1.ChangeDetectionStrategy.Checked)
                c.mode = constants_1.ChangeDetectionStrategy.CheckOnce;
            c = c.parent;
        }
    };
    // This is an experimental feature. Works only in Dart.
    AbstractChangeDetector.prototype._unsubsribeFromObservables = function () {
        if (lang_1.isPresent(this.subscriptions)) {
            for (var i = 0; i < this.subscriptions.length; ++i) {
                var s = this.subscriptions[i];
                if (lang_1.isPresent(this.subscriptions[i])) {
                    s.cancel();
                    this.subscriptions[i] = null;
                }
            }
        }
    };
    // This is an experimental feature. Works only in Dart.
    AbstractChangeDetector.prototype.observeValue = function (value, index) {
        var _this = this;
        if (observable_facade_1.isObservable(value)) {
            this._createArrayToStoreObservables();
            if (lang_1.isBlank(this.subscriptions[index])) {
                this.streams[index] = value.changes;
                this.subscriptions[index] = value.changes.listen(function (_) { return _this.ref.markForCheck(); });
            }
            else if (this.streams[index] !== value.changes) {
                this.subscriptions[index].cancel();
                this.streams[index] = value.changes;
                this.subscriptions[index] = value.changes.listen(function (_) { return _this.ref.markForCheck(); });
            }
        }
        return value;
    };
    // This is an experimental feature. Works only in Dart.
    AbstractChangeDetector.prototype.observeDirective = function (value, index) {
        var _this = this;
        if (observable_facade_1.isObservable(value)) {
            this._createArrayToStoreObservables();
            var arrayIndex = this.numberOfPropertyProtoRecords + index + 2; // +1 is component
            this.streams[arrayIndex] = value.changes;
            this.subscriptions[arrayIndex] = value.changes.listen(function (_) { return _this.ref.markForCheck(); });
        }
        return value;
    };
    // This is an experimental feature. Works only in Dart.
    AbstractChangeDetector.prototype.observeComponent = function (value) {
        var _this = this;
        if (observable_facade_1.isObservable(value)) {
            this._createArrayToStoreObservables();
            var index = this.numberOfPropertyProtoRecords + 1;
            this.streams[index] = value.changes;
            this.subscriptions[index] = value.changes.listen(function (_) { return _this.ref.markForCheck(); });
        }
        return value;
    };
    AbstractChangeDetector.prototype._createArrayToStoreObservables = function () {
        if (lang_1.isBlank(this.subscriptions)) {
            this.subscriptions = collection_1.ListWrapper.createFixedSize(this.numberOfPropertyProtoRecords +
                this.directiveIndices.length + 2);
            this.streams = collection_1.ListWrapper.createFixedSize(this.numberOfPropertyProtoRecords +
                this.directiveIndices.length + 2);
        }
    };
    AbstractChangeDetector.prototype.getDirectiveFor = function (directives, index) {
        return directives.getDirectiveFor(this.directiveIndices[index]);
    };
    AbstractChangeDetector.prototype.getDetectorFor = function (directives, index) {
        return directives.getDetectorFor(this.directiveIndices[index]);
    };
    AbstractChangeDetector.prototype.notifyDispatcher = function (value) {
        this.dispatcher.notifyOnBinding(this._currentBinding(), value);
    };
    AbstractChangeDetector.prototype.logBindingUpdate = function (value) {
        this.dispatcher.logBindingUpdate(this._currentBinding(), value);
    };
    AbstractChangeDetector.prototype.addChange = function (changes, oldValue, newValue) {
        if (lang_1.isBlank(changes)) {
            changes = {};
        }
        changes[this._currentBinding().name] = change_detection_util_1.ChangeDetectionUtil.simpleChange(oldValue, newValue);
        return changes;
    };
    AbstractChangeDetector.prototype._throwError = function (exception, stack) {
        var error;
        try {
            var c = this.dispatcher.getDebugContext(null, this._currentBinding().elementIndex, null);
            var context = lang_1.isPresent(c) ? new _Context(c.element, c.componentElement, c.context, c.locals, c.injector, this._currentBinding().debug) :
                null;
            error = new exceptions_1.ChangeDetectionError(this._currentBinding().debug, exception, stack, context);
        }
        catch (e) {
            // if an error happens during getting the debug context, we throw a ChangeDetectionError
            // without the extra information.
            error = new exceptions_1.ChangeDetectionError(null, exception, stack, null);
        }
        throw error;
    };
    AbstractChangeDetector.prototype.throwOnChangeError = function (oldValue, newValue) {
        throw new exceptions_1.ExpressionChangedAfterItHasBeenCheckedException(this._currentBinding().debug, oldValue, newValue, null);
    };
    AbstractChangeDetector.prototype.throwDehydratedError = function () { throw new exceptions_1.DehydratedException(); };
    AbstractChangeDetector.prototype._currentBinding = function () {
        return this.bindingTargets[this.propertyBindingIndex];
    };
    return AbstractChangeDetector;
})();
exports.AbstractChangeDetector = AbstractChangeDetector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RfY2hhbmdlX2RldGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9hYnN0cmFjdF9jaGFuZ2VfZGV0ZWN0b3IudHMiXSwibmFtZXMiOlsiX0NvbnRleHQiLCJfQ29udGV4dC5jb25zdHJ1Y3RvciIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5hZGRDb250ZW50Q2hpbGQiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLnJlbW92ZUNvbnRlbnRDaGlsZCIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuYWRkVmlld0NoaWxkIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5yZW1vdmVWaWV3Q2hpbGQiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLnJlbW92ZSIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuaGFuZGxlRXZlbnQiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmhhbmRsZUV2ZW50SW50ZXJuYWwiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmRldGVjdENoYW5nZXMiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmNoZWNrTm9DaGFuZ2VzIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5ydW5EZXRlY3RDaGFuZ2VzIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmh5ZHJhdGUiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmh5ZHJhdGVEaXJlY3RpdmVzIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5kZWh5ZHJhdGUiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmRlaHlkcmF0ZURpcmVjdGl2ZXMiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmh5ZHJhdGVkIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5kZXN0cm95UmVjdXJzaXZlIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5hZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3MiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5hZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3MiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5fZGV0ZWN0Q2hhbmdlc0NvbnRlbnRDaGlsZHJlbiIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuX2RldGVjdENoYW5nZXNJblZpZXdDaGlsZHJlbiIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IubWFya0FzQ2hlY2tPbmNlIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5tYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5fdW5zdWJzcmliZUZyb21PYnNlcnZhYmxlcyIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3Iub2JzZXJ2ZVZhbHVlIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5vYnNlcnZlRGlyZWN0aXZlIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5vYnNlcnZlQ29tcG9uZW50IiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5fY3JlYXRlQXJyYXlUb1N0b3JlT2JzZXJ2YWJsZXMiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmdldERpcmVjdGl2ZUZvciIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuZ2V0RGV0ZWN0b3JGb3IiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLm5vdGlmeURpc3BhdGNoZXIiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmxvZ0JpbmRpbmdVcGRhdGUiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmFkZENoYW5nZSIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuX3Rocm93RXJyb3IiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLnRocm93T25DaGFuZ2VFcnJvciIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IudGhyb3dEZWh5ZHJhdGVkRXJyb3IiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLl9jdXJyZW50QmluZGluZyJdLCJtYXBwaW5ncyI6IkFBQUEscUJBQW1FLDBCQUEwQixDQUFDLENBQUE7QUFDOUYsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0Qsc0NBQWtDLHlCQUF5QixDQUFDLENBQUE7QUFDNUQsb0NBQW9ELHVCQUF1QixDQUFDLENBQUE7QUFJNUUsMkJBTU8sY0FBYyxDQUFDLENBQUE7QUFFdEIsdUJBQXFCLGlCQUFpQixDQUFDLENBQUE7QUFDdkMsMEJBQTJELGFBQWEsQ0FBQyxDQUFBO0FBQ3pFLHdCQUFtRCxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3hFLGtDQUEyQixxQkFBcUIsQ0FBQyxDQUFBO0FBR2pELElBQUksWUFBWSxHQUFlLHdCQUFjLENBQUMsb0RBQW9ELENBQUMsQ0FBQztBQUVwRztJQUNFQSxrQkFBbUJBLE9BQVlBLEVBQVNBLGdCQUFxQkEsRUFBU0EsT0FBWUEsRUFDL0RBLE1BQVdBLEVBQVNBLFFBQWFBLEVBQVNBLFVBQWVBO1FBRHpEQyxZQUFPQSxHQUFQQSxPQUFPQSxDQUFLQTtRQUFTQSxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQUtBO1FBQVNBLFlBQU9BLEdBQVBBLE9BQU9BLENBQUtBO1FBQy9EQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFLQTtRQUFTQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFLQTtRQUFTQSxlQUFVQSxHQUFWQSxVQUFVQSxDQUFLQTtJQUFHQSxDQUFDQTtJQUNsRkQsZUFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRUQ7SUFzQkVFLGdDQUFtQkEsRUFBVUEsRUFBU0EsNEJB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QXZCQTtRQUNFeUMsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtJQUN4REEsQ0FBQ0E7SUFDSHpDLDZCQUFDQTtBQUFEQSxDQUFDQSxBQXpVRCxJQXlVQztBQXpVWSw4QkFBc0IseUJBeVVsQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHthc3NlcnRpb25zRW5hYmxlZCwgaXNQcmVzZW50LCBpc0JsYW5rLCBTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uVXRpbH0gZnJvbSAnLi9jaGFuZ2VfZGV0ZWN0aW9uX3V0aWwnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZiwgQ2hhbmdlRGV0ZWN0b3JSZWZffSBmcm9tICcuL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuaW1wb3J0IHtEaXJlY3RpdmVJbmRleH0gZnJvbSAnLi9kaXJlY3RpdmVfcmVjb3JkJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3IsIENoYW5nZURpc3BhdGNoZXJ9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge1BpcGVzfSBmcm9tICcuL3BpcGVzJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvbkVycm9yLFxuICBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEV4Y2VwdGlvbixcbiAgRGVoeWRyYXRlZEV4Y2VwdGlvbixcbiAgRXZlbnRFdmFsdWF0aW9uRXJyb3JDb250ZXh0LFxuICBFdmVudEV2YWx1YXRpb25FcnJvclxufSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtCaW5kaW5nVGFyZ2V0fSBmcm9tICcuL2JpbmRpbmdfcmVjb3JkJztcbmltcG9ydCB7TG9jYWxzfSBmcm9tICcuL3BhcnNlci9sb2NhbHMnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ2hhbmdlRGV0ZWN0b3JTdGF0ZX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHt3dGZDcmVhdGVTY29wZSwgd3RmTGVhdmUsIFd0ZlNjb3BlRm59IGZyb20gJy4uL3Byb2ZpbGUvcHJvZmlsZSc7XG5pbXBvcnQge2lzT2JzZXJ2YWJsZX0gZnJvbSAnLi9vYnNlcnZhYmxlX2ZhY2FkZSc7XG5cblxudmFyIF9zY29wZV9jaGVjazogV3RmU2NvcGVGbiA9IHd0ZkNyZWF0ZVNjb3BlKGBDaGFuZ2VEZXRlY3RvciNjaGVjayhhc2NpaSBpZCwgYm9vbCB0aHJvd09uQ2hhbmdlKWApO1xuXG5jbGFzcyBfQ29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBjb21wb25lbnRFbGVtZW50OiBhbnksIHB1YmxpYyBjb250ZXh0OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyBsb2NhbHM6IGFueSwgcHVibGljIGluamVjdG9yOiBhbnksIHB1YmxpYyBleHByZXNzaW9uOiBhbnkpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBBYnN0cmFjdENoYW5nZURldGVjdG9yPFQ+IGltcGxlbWVudHMgQ2hhbmdlRGV0ZWN0b3Ige1xuICBjb250ZW50Q2hpbGRyZW46IGFueVtdID0gW107XG4gIHZpZXdDaGlsZHJlbjogYW55W10gPSBbXTtcbiAgcGFyZW50OiBDaGFuZ2VEZXRlY3RvcjtcbiAgcmVmOiBDaGFuZ2VEZXRlY3RvclJlZjtcblxuICAvLyBUaGUgbmFtZXMgb2YgdGhlIGJlbG93IGZpZWxkcyBtdXN0IGJlIGtlcHQgaW4gc3luYyB3aXRoIGNvZGVnZW5fbmFtZV91dGlsLnRzIG9yXG4gIC8vIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBmYWlsLlxuICBzdGF0ZTogQ2hhbmdlRGV0ZWN0b3JTdGF0ZSA9IENoYW5nZURldGVjdG9yU3RhdGUuTmV2ZXJDaGVja2VkO1xuICBjb250ZXh0OiBUO1xuICBsb2NhbHM6IExvY2FscyA9IG51bGw7XG4gIG1vZGU6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5ID0gbnVsbDtcbiAgcGlwZXM6IFBpcGVzID0gbnVsbDtcbiAgcHJvcGVydHlCaW5kaW5nSW5kZXg6IG51bWJlcjtcblxuICAvLyBUaGlzIGlzIGFuIGV4cGVyaW1lbnRhbCBmZWF0dXJlLiBXb3JrcyBvbmx5IGluIERhcnQuXG4gIHN1YnNjcmlwdGlvbnM6IGFueVtdO1xuICBzdHJlYW1zOiBhbnlbXTtcblxuICBkaXNwYXRjaGVyOiBDaGFuZ2VEaXNwYXRjaGVyO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIGlkOiBzdHJpbmcsIHB1YmxpYyBudW1iZXJPZlByb3BlcnR5UHJvdG9SZWNvcmRzOiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBiaW5kaW5nVGFyZ2V0czogQmluZGluZ1RhcmdldFtdLCBwdWJsaWMgZGlyZWN0aXZlSW5kaWNlczogRGlyZWN0aXZlSW5kZXhbXSxcbiAgICAgICAgICAgICAgcHVibGljIHN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSkge1xuICAgIHRoaXMucmVmID0gbmV3IENoYW5nZURldGVjdG9yUmVmXyh0aGlzKTtcbiAgfVxuXG4gIGFkZENvbnRlbnRDaGlsZChjZDogQ2hhbmdlRGV0ZWN0b3IpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRDaGlsZHJlbi5wdXNoKGNkKTtcbiAgICBjZC5wYXJlbnQgPSB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlQ29udGVudENoaWxkKGNkOiBDaGFuZ2VEZXRlY3Rvcik6IHZvaWQgeyBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5jb250ZW50Q2hpbGRyZW4sIGNkKTsgfVxuXG4gIGFkZFZpZXdDaGlsZChjZDogQ2hhbmdlRGV0ZWN0b3IpOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdDaGlsZHJlbi5wdXNoKGNkKTtcbiAgICBjZC5wYXJlbnQgPSB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlVmlld0NoaWxkKGNkOiBDaGFuZ2VEZXRlY3Rvcik6IHZvaWQgeyBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy52aWV3Q2hpbGRyZW4sIGNkKTsgfVxuXG4gIHJlbW92ZSgpOiB2b2lkIHsgdGhpcy5wYXJlbnQucmVtb3ZlQ29udGVudENoaWxkKHRoaXMpOyB9XG5cbiAgaGFuZGxlRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIGVsSW5kZXg6IG51bWJlciwgZXZlbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5oeWRyYXRlZCgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHZhciBsb2NhbHMgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xuICAgICAgbG9jYWxzLnNldCgnJGV2ZW50JywgZXZlbnQpO1xuICAgICAgdmFyIHJlcyA9ICF0aGlzLmhhbmRsZUV2ZW50SW50ZXJuYWwoZXZlbnROYW1lLCBlbEluZGV4LCBuZXcgTG9jYWxzKHRoaXMubG9jYWxzLCBsb2NhbHMpKTtcbiAgICAgIHRoaXMubWFya1BhdGhUb1Jvb3RBc0NoZWNrT25jZSgpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB2YXIgYyA9IHRoaXMuZGlzcGF0Y2hlci5nZXREZWJ1Z0NvbnRleHQobnVsbCwgZWxJbmRleCwgbnVsbCk7XG4gICAgICB2YXIgY29udGV4dCA9IGlzUHJlc2VudChjKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRXZlbnRFdmFsdWF0aW9uRXJyb3JDb250ZXh0KGMuZWxlbWVudCwgYy5jb21wb25lbnRFbGVtZW50LCBjLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMubG9jYWxzLCBjLmluamVjdG9yKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICAgICAgdGhyb3cgbmV3IEV2ZW50RXZhbHVhdGlvbkVycm9yKGV2ZW50TmFtZSwgZSwgZS5zdGFjaywgY29udGV4dCk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlRXZlbnRJbnRlcm5hbChldmVudE5hbWU6IHN0cmluZywgZWxJbmRleDogbnVtYmVyLCBsb2NhbHM6IExvY2Fscyk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cblxuICBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQgeyB0aGlzLnJ1bkRldGVjdENoYW5nZXMoZmFsc2UpOyB9XG5cbiAgY2hlY2tOb0NoYW5nZXMoKTogdm9pZCB7XG4gICAgaWYgKGFzc2VydGlvbnNFbmFibGVkKCkpIHtcbiAgICAgIHRoaXMucnVuRGV0ZWN0Q2hhbmdlcyh0cnVlKTtcbiAgICB9XG4gIH1cblxuICBydW5EZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZXRhY2hlZCB8fFxuICAgICAgICB0aGlzLm1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQgfHwgdGhpcy5zdGF0ZSA9PT0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkKVxuICAgICAgcmV0dXJuO1xuICAgIHZhciBzID0gX3Njb3BlX2NoZWNrKHRoaXMuaWQsIHRocm93T25DaGFuZ2UpO1xuXG4gICAgdGhpcy5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzKHRocm93T25DaGFuZ2UpO1xuXG4gICAgdGhpcy5fZGV0ZWN0Q2hhbmdlc0NvbnRlbnRDaGlsZHJlbih0aHJvd09uQ2hhbmdlKTtcbiAgICBpZiAoIXRocm93T25DaGFuZ2UpIHRoaXMuYWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzKCk7XG5cbiAgICB0aGlzLl9kZXRlY3RDaGFuZ2VzSW5WaWV3Q2hpbGRyZW4odGhyb3dPbkNoYW5nZSk7XG4gICAgaWYgKCF0aHJvd09uQ2hhbmdlKSB0aGlzLmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrcygpO1xuXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlKVxuICAgICAgdGhpcy5tb2RlID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tlZDtcblxuICAgIHRoaXMuc3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLkNoZWNrZWRCZWZvcmU7XG4gICAgd3RmTGVhdmUocyk7XG4gIH1cblxuICAvLyBUaGlzIG1ldGhvZCBpcyBub3QgaW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlbi4gU3ViY2xhc3NlcyBzaG91bGQgaW5zdGVhZCBwcm92aWRlIGFuXG4gIC8vIGltcGxlbWVudGF0aW9uIG9mIGBkZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWxgIHdoaWNoIGRvZXMgdGhlIHdvcmsgb2YgZGV0ZWN0aW5nIGNoYW5nZXNcbiAgLy8gYW5kIHdoaWNoIHRoaXMgbWV0aG9kIHdpbGwgY2FsbC5cbiAgLy8gVGhpcyBtZXRob2QgZXhwZWN0cyB0aGF0IGBkZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWxgIHdpbGwgc2V0IHRoZSBwcm9wZXJ0eVxuICAvLyBgdGhpcy5wcm9wZXJ0eUJpbmRpbmdJbmRleGAgdG8gdGhlIHByb3BlcnR5QmluZGluZ0luZGV4IG9mIHRoZSBmaXJzdCBwcm90byByZWNvcmQuIFRoaXMgaXMgdG9cbiAgLy8gZmFjaWxpdGF0ZSBlcnJvciByZXBvcnRpbmcuXG4gIGRldGVjdENoYW5nZXNJblJlY29yZHModGhyb3dPbkNoYW5nZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5oeWRyYXRlZCgpKSB7XG4gICAgICB0aGlzLnRocm93RGVoeWRyYXRlZEVycm9yKCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmRldGVjdENoYW5nZXNJblJlY29yZHNJbnRlcm5hbCh0aHJvd09uQ2hhbmdlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyB0aHJvd09uQ2hhbmdlIGVycm9ycyBhcmVuJ3QgY291bnRlZCBhcyBmYXRhbCBlcnJvcnMuXG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb24pKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLkVycm9yZWQ7XG4gICAgICB9XG4gICAgICB0aGlzLl90aHJvd0Vycm9yKGUsIGUuc3RhY2spO1xuICAgIH1cbiAgfVxuXG4gIC8vIFN1YmNsYXNzZXMgc2hvdWxkIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIHBlcmZvcm0gYW55IHdvcmsgbmVjZXNzYXJ5IHRvIGRldGVjdCBhbmQgcmVwb3J0XG4gIC8vIGNoYW5nZXMuIEZvciBleGFtcGxlLCBjaGFuZ2VzIHNob3VsZCBiZSByZXBvcnRlZCB2aWEgYENoYW5nZURldGVjdGlvblV0aWwuYWRkQ2hhbmdlYCwgbGlmZWN5Y2xlXG4gIC8vIG1ldGhvZHMgc2hvdWxkIGJlIGNhbGxlZCwgZXRjLlxuICAvLyBUaGlzIGltcGxlbWVudGF0aW9uIHNob3VsZCBhbHNvIHNldCBgdGhpcy5wcm9wZXJ0eUJpbmRpbmdJbmRleGAgdG8gdGhlIHByb3BlcnR5QmluZGluZ0luZGV4IG9mXG4gIC8vIHRoZVxuICAvLyBmaXJzdCBwcm90byByZWNvcmQgdG8gZmFjaWxpdGF0ZSBlcnJvciByZXBvcnRpbmcuIFNlZSB7QGxpbmsgI2RldGVjdENoYW5nZXNJblJlY29yZHN9LlxuICBkZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwodGhyb3dPbkNoYW5nZTogYm9vbGVhbik6IHZvaWQge31cblxuICAvLyBUaGlzIG1ldGhvZCBpcyBub3QgaW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlbi4gU3ViY2xhc3NlcyBzaG91bGQgaW5zdGVhZCBwcm92aWRlIGFuXG4gIC8vIGltcGxlbWVudGF0aW9uIG9mIGBoeWRyYXRlRGlyZWN0aXZlc2AuXG4gIGh5ZHJhdGUoY29udGV4dDogVCwgbG9jYWxzOiBMb2NhbHMsIGRpc3BhdGNoZXI6IENoYW5nZURpc3BhdGNoZXIsIHBpcGVzOiBQaXBlcyk6IHZvaWQge1xuICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5tb2RlID0gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5jaGFuZ2VEZXRlY3Rpb25Nb2RlKHRoaXMuc3RyYXRlZ3kpO1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG5cbiAgICBpZiAodGhpcy5zdHJhdGVneSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoT2JzZXJ2ZSkge1xuICAgICAgdGhpcy5vYnNlcnZlQ29tcG9uZW50KGNvbnRleHQpO1xuICAgIH1cblxuICAgIHRoaXMubG9jYWxzID0gbG9jYWxzO1xuICAgIHRoaXMucGlwZXMgPSBwaXBlcztcbiAgICB0aGlzLmh5ZHJhdGVEaXJlY3RpdmVzKGRpc3BhdGNoZXIpO1xuICAgIHRoaXMuc3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlLk5ldmVyQ2hlY2tlZDtcbiAgfVxuXG4gIC8vIFN1YmNsYXNzZXMgc2hvdWxkIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGh5ZHJhdGUgYW55IGRpcmVjdGl2ZXMuXG4gIGh5ZHJhdGVEaXJlY3RpdmVzKGRpc3BhdGNoZXI6IENoYW5nZURpc3BhdGNoZXIpOiB2b2lkIHt9XG5cbiAgLy8gVGhpcyBtZXRob2QgaXMgbm90IGludGVuZGVkIHRvIGJlIG92ZXJyaWRkZW4uIFN1YmNsYXNzZXMgc2hvdWxkIGluc3RlYWQgcHJvdmlkZSBhblxuICAvLyBpbXBsZW1lbnRhdGlvbiBvZiBgZGVoeWRyYXRlRGlyZWN0aXZlc2AuXG4gIGRlaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlaHlkcmF0ZURpcmVjdGl2ZXModHJ1ZSk7XG5cbiAgICAvLyBUaGlzIGlzIGFuIGV4cGVyaW1lbnRhbCBmZWF0dXJlLiBXb3JrcyBvbmx5IGluIERhcnQuXG4gICAgaWYgKHRoaXMuc3RyYXRlZ3kgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaE9ic2VydmUpIHtcbiAgICAgIHRoaXMuX3Vuc3Vic3JpYmVGcm9tT2JzZXJ2YWJsZXMoKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBudWxsO1xuICAgIHRoaXMuY29udGV4dCA9IG51bGw7XG4gICAgdGhpcy5sb2NhbHMgPSBudWxsO1xuICAgIHRoaXMucGlwZXMgPSBudWxsO1xuICB9XG5cbiAgLy8gU3ViY2xhc3NlcyBzaG91bGQgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gZGVoeWRyYXRlIGFueSBkaXJlY3RpdmVzLiBUaGlzIG1ldGhvZCBzaG91bGQgcmV2ZXJzZVxuICAvLyBhbnkgd29yayBkb25lIGluIGBoeWRyYXRlRGlyZWN0aXZlc2AuXG4gIGRlaHlkcmF0ZURpcmVjdGl2ZXMoZGVzdHJveVBpcGVzOiBib29sZWFuKTogdm9pZCB7fVxuXG4gIGh5ZHJhdGVkKCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuY29udGV4dCk7IH1cblxuICBkZXN0cm95UmVjdXJzaXZlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcGF0Y2hlci5ub3RpZnlPbkRlc3Ryb3koKTtcbiAgICB0aGlzLmRlaHlkcmF0ZSgpO1xuICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuY29udGVudENoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoaWxkcmVuW2ldLmRlc3Ryb3lSZWN1cnNpdmUoKTtcbiAgICB9XG4gICAgY2hpbGRyZW4gPSB0aGlzLnZpZXdDaGlsZHJlbjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGlsZHJlbltpXS5kZXN0cm95UmVjdXJzaXZlKCk7XG4gICAgfVxuICB9XG5cbiAgYWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcGF0Y2hlci5ub3RpZnlBZnRlckNvbnRlbnRDaGVja2VkKCk7XG4gICAgdGhpcy5hZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3NJbnRlcm5hbCgpO1xuICB9XG5cbiAgYWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzSW50ZXJuYWwoKTogdm9pZCB7fVxuXG4gIGFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIubm90aWZ5QWZ0ZXJWaWV3Q2hlY2tlZCgpO1xuICAgIHRoaXMuYWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzSW50ZXJuYWwoKTtcbiAgfVxuXG4gIGFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsKCk6IHZvaWQge31cblxuICAvKiogQGludGVybmFsICovXG4gIF9kZXRlY3RDaGFuZ2VzQ29udGVudENoaWxkcmVuKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIgYyA9IHRoaXMuY29udGVudENoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYy5sZW5ndGg7ICsraSkge1xuICAgICAgY1tpXS5ydW5EZXRlY3RDaGFuZ2VzKHRocm93T25DaGFuZ2UpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RldGVjdENoYW5nZXNJblZpZXdDaGlsZHJlbih0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdmFyIGMgPSB0aGlzLnZpZXdDaGlsZHJlbjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGNbaV0ucnVuRGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICBtYXJrQXNDaGVja09uY2UoKTogdm9pZCB7IHRoaXMubW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZTsgfVxuXG4gIG1hcmtQYXRoVG9Sb290QXNDaGVja09uY2UoKTogdm9pZCB7XG4gICAgdmFyIGM6IENoYW5nZURldGVjdG9yID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGMpICYmIGMubW9kZSAhPT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQpIHtcbiAgICAgIGlmIChjLm1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQpIGMubW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZTtcbiAgICAgIGMgPSBjLnBhcmVudDtcbiAgICB9XG4gIH1cblxuICAvLyBUaGlzIGlzIGFuIGV4cGVyaW1lbnRhbCBmZWF0dXJlLiBXb3JrcyBvbmx5IGluIERhcnQuXG4gIHByaXZhdGUgX3Vuc3Vic3JpYmVGcm9tT2JzZXJ2YWJsZXMoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnN1YnNjcmlwdGlvbnMpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc3Vic2NyaXB0aW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgcyA9IHRoaXMuc3Vic2NyaXB0aW9uc1tpXTtcbiAgICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLnN1YnNjcmlwdGlvbnNbaV0pKSB7XG4gICAgICAgICAgcy5jYW5jZWwoKTtcbiAgICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnNbaV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVGhpcyBpcyBhbiBleHBlcmltZW50YWwgZmVhdHVyZS4gV29ya3Mgb25seSBpbiBEYXJ0LlxuICBvYnNlcnZlVmFsdWUodmFsdWU6IGFueSwgaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUFycmF5VG9TdG9yZU9ic2VydmFibGVzKCk7XG4gICAgICBpZiAoaXNCbGFuayh0aGlzLnN1YnNjcmlwdGlvbnNbaW5kZXhdKSkge1xuICAgICAgICB0aGlzLnN0cmVhbXNbaW5kZXhdID0gdmFsdWUuY2hhbmdlcztcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zW2luZGV4XSA9IHZhbHVlLmNoYW5nZXMubGlzdGVuKChfKSA9PiB0aGlzLnJlZi5tYXJrRm9yQ2hlY2soKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc3RyZWFtc1tpbmRleF0gIT09IHZhbHVlLmNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zW2luZGV4XS5jYW5jZWwoKTtcbiAgICAgICAgdGhpcy5zdHJlYW1zW2luZGV4XSA9IHZhbHVlLmNoYW5nZXM7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uc1tpbmRleF0gPSB2YWx1ZS5jaGFuZ2VzLmxpc3RlbigoXykgPT4gdGhpcy5yZWYubWFya0ZvckNoZWNrKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvLyBUaGlzIGlzIGFuIGV4cGVyaW1lbnRhbCBmZWF0dXJlLiBXb3JrcyBvbmx5IGluIERhcnQuXG4gIG9ic2VydmVEaXJlY3RpdmUodmFsdWU6IGFueSwgaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUFycmF5VG9TdG9yZU9ic2VydmFibGVzKCk7XG4gICAgICB2YXIgYXJyYXlJbmRleCA9IHRoaXMubnVtYmVyT2ZQcm9wZXJ0eVByb3RvUmVjb3JkcyArIGluZGV4ICsgMjsgIC8vICsxIGlzIGNvbXBvbmVudFxuICAgICAgdGhpcy5zdHJlYW1zW2FycmF5SW5kZXhdID0gdmFsdWUuY2hhbmdlcztcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9uc1thcnJheUluZGV4XSA9IHZhbHVlLmNoYW5nZXMubGlzdGVuKChfKSA9PiB0aGlzLnJlZi5tYXJrRm9yQ2hlY2soKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUuIFdvcmtzIG9ubHkgaW4gRGFydC5cbiAgb2JzZXJ2ZUNvbXBvbmVudCh2YWx1ZTogYW55KTogYW55IHtcbiAgICBpZiAoaXNPYnNlcnZhYmxlKHZhbHVlKSkge1xuICAgICAgdGhpcy5fY3JlYXRlQXJyYXlUb1N0b3JlT2JzZXJ2YWJsZXMoKTtcbiAgICAgIHZhciBpbmRleCA9IHRoaXMubnVtYmVyT2ZQcm9wZXJ0eVByb3RvUmVjb3JkcyArIDE7XG4gICAgICB0aGlzLnN0cmVhbXNbaW5kZXhdID0gdmFsdWUuY2hhbmdlcztcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9uc1tpbmRleF0gPSB2YWx1ZS5jaGFuZ2VzLmxpc3RlbigoXykgPT4gdGhpcy5yZWYubWFya0ZvckNoZWNrKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVBcnJheVRvU3RvcmVPYnNlcnZhYmxlcygpOiB2b2lkIHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLnN1YnNjcmlwdGlvbnMpKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUodGhpcy5udW1iZXJPZlByb3BlcnR5UHJvdG9SZWNvcmRzICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZUluZGljZXMubGVuZ3RoICsgMik7XG4gICAgICB0aGlzLnN0cmVhbXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUodGhpcy5udW1iZXJPZlByb3BlcnR5UHJvdG9SZWNvcmRzICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZUluZGljZXMubGVuZ3RoICsgMik7XG4gICAgfVxuICB9XG5cbiAgZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZXM6IGFueSwgaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZXMuZ2V0RGlyZWN0aXZlRm9yKHRoaXMuZGlyZWN0aXZlSW5kaWNlc1tpbmRleF0pO1xuICB9XG5cbiAgZ2V0RGV0ZWN0b3JGb3IoZGlyZWN0aXZlczogYW55LCBpbmRleDogbnVtYmVyKTogQ2hhbmdlRGV0ZWN0b3Ige1xuICAgIHJldHVybiBkaXJlY3RpdmVzLmdldERldGVjdG9yRm9yKHRoaXMuZGlyZWN0aXZlSW5kaWNlc1tpbmRleF0pO1xuICB9XG5cbiAgbm90aWZ5RGlzcGF0Y2hlcih2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm5vdGlmeU9uQmluZGluZyh0aGlzLl9jdXJyZW50QmluZGluZygpLCB2YWx1ZSk7XG4gIH1cblxuICBsb2dCaW5kaW5nVXBkYXRlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIubG9nQmluZGluZ1VwZGF0ZSh0aGlzLl9jdXJyZW50QmluZGluZygpLCB2YWx1ZSk7XG4gIH1cblxuICBhZGRDaGFuZ2UoY2hhbmdlczoge1trZXk6IHN0cmluZ106IGFueX0sIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgaWYgKGlzQmxhbmsoY2hhbmdlcykpIHtcbiAgICAgIGNoYW5nZXMgPSB7fTtcbiAgICB9XG4gICAgY2hhbmdlc1t0aGlzLl9jdXJyZW50QmluZGluZygpLm5hbWVdID0gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5zaW1wbGVDaGFuZ2Uob2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICByZXR1cm4gY2hhbmdlcztcbiAgfVxuXG4gIHByaXZhdGUgX3Rocm93RXJyb3IoZXhjZXB0aW9uOiBhbnksIHN0YWNrOiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBjID0gdGhpcy5kaXNwYXRjaGVyLmdldERlYnVnQ29udGV4dChudWxsLCB0aGlzLl9jdXJyZW50QmluZGluZygpLmVsZW1lbnRJbmRleCwgbnVsbCk7XG4gICAgICB2YXIgY29udGV4dCA9IGlzUHJlc2VudChjKSA/IG5ldyBfQ29udGV4dChjLmVsZW1lbnQsIGMuY29tcG9uZW50RWxlbWVudCwgYy5jb250ZXh0LCBjLmxvY2FscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMuaW5qZWN0b3IsIHRoaXMuX2N1cnJlbnRCaW5kaW5nKCkuZGVidWcpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICAgIGVycm9yID0gbmV3IENoYW5nZURldGVjdGlvbkVycm9yKHRoaXMuX2N1cnJlbnRCaW5kaW5nKCkuZGVidWcsIGV4Y2VwdGlvbiwgc3RhY2ssIGNvbnRleHQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIGlmIGFuIGVycm9yIGhhcHBlbnMgZHVyaW5nIGdldHRpbmcgdGhlIGRlYnVnIGNvbnRleHQsIHdlIHRocm93IGEgQ2hhbmdlRGV0ZWN0aW9uRXJyb3JcbiAgICAgIC8vIHdpdGhvdXQgdGhlIGV4dHJhIGluZm9ybWF0aW9uLlxuICAgICAgZXJyb3IgPSBuZXcgQ2hhbmdlRGV0ZWN0aW9uRXJyb3IobnVsbCwgZXhjZXB0aW9uLCBzdGFjaywgbnVsbCk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgdGhyb3dPbkNoYW5nZUVycm9yKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb24odGhpcy5fY3VycmVudEJpbmRpbmcoKS5kZWJ1ZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkVmFsdWUsIG5ld1ZhbHVlLCBudWxsKTtcbiAgfVxuXG4gIHRocm93RGVoeWRyYXRlZEVycm9yKCk6IHZvaWQgeyB0aHJvdyBuZXcgRGVoeWRyYXRlZEV4Y2VwdGlvbigpOyB9XG5cbiAgcHJpdmF0ZSBfY3VycmVudEJpbmRpbmcoKTogQmluZGluZ1RhcmdldCB7XG4gICAgcmV0dXJuIHRoaXMuYmluZGluZ1RhcmdldHNbdGhpcy5wcm9wZXJ0eUJpbmRpbmdJbmRleF07XG4gIH1cbn1cbiJdfQ==