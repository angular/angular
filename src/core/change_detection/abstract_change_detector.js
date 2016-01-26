'use strict';var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var change_detection_util_1 = require('./change_detection_util');
var change_detector_ref_1 = require('./change_detector_ref');
var exceptions_1 = require('./exceptions');
var locals_1 = require('./parser/locals');
var constants_1 = require('./constants');
var profile_1 = require('../profile/profile');
var observable_facade_1 = require('./observable_facade');
var async_1 = require('angular2/src/facade/async');
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
            this.throwDehydratedError();
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
        this._unsubscribeFromOutputs();
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
    AbstractChangeDetector.prototype._unsubscribeFromOutputs = function () {
        if (lang_1.isPresent(this.outputSubscriptions)) {
            for (var i = 0; i < this.outputSubscriptions.length; ++i) {
                async_1.ObservableWrapper.dispose(this.outputSubscriptions[i]);
                this.outputSubscriptions[i] = null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RfY2hhbmdlX2RldGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9hYnN0cmFjdF9jaGFuZ2VfZGV0ZWN0b3IudHMiXSwibmFtZXMiOlsiX0NvbnRleHQiLCJfQ29udGV4dC5jb25zdHJ1Y3RvciIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmNvbnN0cnVjdG9yIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5hZGRDb250ZW50Q2hpbGQiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLnJlbW92ZUNvbnRlbnRDaGlsZCIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuYWRkVmlld0NoaWxkIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5yZW1vdmVWaWV3Q2hpbGQiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLnJlbW92ZSIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuaGFuZGxlRXZlbnQiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmhhbmRsZUV2ZW50SW50ZXJuYWwiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmRldGVjdENoYW5nZXMiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmNoZWNrTm9DaGFuZ2VzIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5ydW5EZXRlY3RDaGFuZ2VzIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmh5ZHJhdGUiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmh5ZHJhdGVEaXJlY3RpdmVzIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5kZWh5ZHJhdGUiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmRlaHlkcmF0ZURpcmVjdGl2ZXMiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmh5ZHJhdGVkIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5kZXN0cm95UmVjdXJzaXZlIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5hZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3MiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5hZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3MiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5fZGV0ZWN0Q2hhbmdlc0NvbnRlbnRDaGlsZHJlbiIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuX2RldGVjdENoYW5nZXNJblZpZXdDaGlsZHJlbiIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IubWFya0FzQ2hlY2tPbmNlIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5tYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5fdW5zdWJzcmliZUZyb21PYnNlcnZhYmxlcyIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuX3Vuc3Vic2NyaWJlRnJvbU91dHB1dHMiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLm9ic2VydmVWYWx1ZSIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3Iub2JzZXJ2ZURpcmVjdGl2ZSIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3Iub2JzZXJ2ZUNvbXBvbmVudCIsIkFic3RyYWN0Q2hhbmdlRGV0ZWN0b3IuX2NyZWF0ZUFycmF5VG9TdG9yZU9ic2VydmFibGVzIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5nZXREaXJlY3RpdmVGb3IiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLmdldERldGVjdG9yRm9yIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5ub3RpZnlEaXNwYXRjaGVyIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5sb2dCaW5kaW5nVXBkYXRlIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5hZGRDaGFuZ2UiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLl90aHJvd0Vycm9yIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci50aHJvd09uQ2hhbmdlRXJyb3IiLCJBYnN0cmFjdENoYW5nZURldGVjdG9yLnRocm93RGVoeWRyYXRlZEVycm9yIiwiQWJzdHJhY3RDaGFuZ2VEZXRlY3Rvci5fY3VycmVudEJpbmRpbmciXSwibWFwcGluZ3MiOiJBQUFBLHFCQUFtRSwwQkFBMEIsQ0FBQyxDQUFBO0FBQzlGLDJCQUEwQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzNELHNDQUFrQyx5QkFBeUIsQ0FBQyxDQUFBO0FBQzVELG9DQUFvRCx1QkFBdUIsQ0FBQyxDQUFBO0FBSTVFLDJCQU1PLGNBQWMsQ0FBQyxDQUFBO0FBRXRCLHVCQUFxQixpQkFBaUIsQ0FBQyxDQUFBO0FBQ3ZDLDBCQUEyRCxhQUFhLENBQUMsQ0FBQTtBQUN6RSx3QkFBbUQsb0JBQW9CLENBQUMsQ0FBQTtBQUN4RSxrQ0FBMkIscUJBQXFCLENBQUMsQ0FBQTtBQUNqRCxzQkFBZ0MsMkJBQTJCLENBQUMsQ0FBQTtBQUU1RCxJQUFJLFlBQVksR0FBZSx3QkFBYyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7QUFFcEc7SUFDRUEsa0JBQW1CQSxPQUFZQSxFQUFTQSxnQkFBcUJBLEVBQVNBLE9BQVlBLEVBQy9EQSxNQUFXQSxFQUFTQSxRQUFhQSxFQUFTQSxVQUFlQTtRQUR6REMsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBS0E7UUFBU0EscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFLQTtRQUFTQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUFLQTtRQUMvREEsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBS0E7UUFBU0EsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBS0E7UUFBU0EsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBS0E7SUFB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LEVBQUVBLFNBQVNBLEVBQUVBLEtBQUtBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1FBQzVGQSxDQUFFQTtRQUFBQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNYQSx3RkFBd0ZBO1lBQ3hGQSxpQ0FBaUNBO1lBQ2pDQSxLQUFLQSxHQUFHQSxJQUFJQSxpQ0FBb0JBLENBQUNBLElBQUlBLEVBQUVBLFNBQVNBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ2pFQSxDQUFDQTtRQUNEQSxNQUFNQSxLQUFLQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVEdkMsbURBQWtCQSxHQUFsQkEsVUFBbUJBLFFBQWFBLEVBQUVBLFFBQWFBO1FBQzdDd0MsTUFBTUEsSUFBSUEsNERBQStDQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxFQUFFQSxDQUFDQSxLQUFLQSxFQUM1QkEsUUFBUUEsRUFBRUEsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDdEZBLENBQUNBO0lBRUR4QyxxREFBb0JBLEdBQXBCQSxjQUErQnlDLE1BQU1BLElBQUlBLGdDQUFtQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFekR6QyxnREFBZUEsR0FBdkJBO1FBQ0UwQyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO0lBQ3hEQSxDQUFDQTtJQUNIMUMsNkJBQUNBO0FBQURBLENBQUNBLEFBclZELElBcVZDO0FBclZZLDhCQUFzQix5QkFxVmxDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2Fzc2VydGlvbnNFbmFibGVkLCBpc1ByZXNlbnQsIGlzQmxhbmssIFN0cmluZ1dyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25VdGlsfSBmcm9tICcuL2NoYW5nZV9kZXRlY3Rpb25fdXRpbCc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmLCBDaGFuZ2VEZXRlY3RvclJlZl99IGZyb20gJy4vY2hhbmdlX2RldGVjdG9yX3JlZic7XG5pbXBvcnQge0RpcmVjdGl2ZUluZGV4fSBmcm9tICcuL2RpcmVjdGl2ZV9yZWNvcmQnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvciwgQ2hhbmdlRGlzcGF0Y2hlcn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7UGlwZXN9IGZyb20gJy4vcGlwZXMnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uRXJyb3IsXG4gIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uLFxuICBEZWh5ZHJhdGVkRXhjZXB0aW9uLFxuICBFdmVudEV2YWx1YXRpb25FcnJvckNvbnRleHQsXG4gIEV2ZW50RXZhbHVhdGlvbkVycm9yXG59IGZyb20gJy4vZXhjZXB0aW9ucyc7XG5pbXBvcnQge0JpbmRpbmdUYXJnZXR9IGZyb20gJy4vYmluZGluZ19yZWNvcmQnO1xuaW1wb3J0IHtMb2NhbHN9IGZyb20gJy4vcGFyc2VyL2xvY2Fscyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDaGFuZ2VEZXRlY3RvclN0YXRlfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge3d0ZkNyZWF0ZVNjb3BlLCB3dGZMZWF2ZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi4vcHJvZmlsZS9wcm9maWxlJztcbmltcG9ydCB7aXNPYnNlcnZhYmxlfSBmcm9tICcuL29ic2VydmFibGVfZmFjYWRlJztcbmltcG9ydCB7T2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG52YXIgX3Njb3BlX2NoZWNrOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoYENoYW5nZURldGVjdG9yI2NoZWNrKGFzY2lpIGlkLCBib29sIHRocm93T25DaGFuZ2UpYCk7XG5cbmNsYXNzIF9Db250ZXh0IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGNvbXBvbmVudEVsZW1lbnQ6IGFueSwgcHVibGljIGNvbnRleHQ6IGFueSxcbiAgICAgICAgICAgICAgcHVibGljIGxvY2FsczogYW55LCBwdWJsaWMgaW5qZWN0b3I6IGFueSwgcHVibGljIGV4cHJlc3Npb246IGFueSkge31cbn1cblxuZXhwb3J0IGNsYXNzIEFic3RyYWN0Q2hhbmdlRGV0ZWN0b3I8VD4gaW1wbGVtZW50cyBDaGFuZ2VEZXRlY3RvciB7XG4gIGNvbnRlbnRDaGlsZHJlbjogYW55W10gPSBbXTtcbiAgdmlld0NoaWxkcmVuOiBhbnlbXSA9IFtdO1xuICBwYXJlbnQ6IENoYW5nZURldGVjdG9yO1xuICByZWY6IENoYW5nZURldGVjdG9yUmVmO1xuXG4gIC8vIFRoZSBuYW1lcyBvZiB0aGUgYmVsb3cgZmllbGRzIG11c3QgYmUga2VwdCBpbiBzeW5jIHdpdGggY29kZWdlbl9uYW1lX3V0aWwudHMgb3JcbiAgLy8gY2hhbmdlIGRldGVjdGlvbiB3aWxsIGZhaWwuXG4gIHN0YXRlOiBDaGFuZ2VEZXRlY3RvclN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQ7XG4gIGNvbnRleHQ6IFQ7XG4gIGxvY2FsczogTG9jYWxzID0gbnVsbDtcbiAgbW9kZTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBudWxsO1xuICBwaXBlczogUGlwZXMgPSBudWxsO1xuICBwcm9wZXJ0eUJpbmRpbmdJbmRleDogbnVtYmVyO1xuICBvdXRwdXRTdWJzY3JpcHRpb25zOiBhbnlbXTtcblxuICAvLyBUaGlzIGlzIGFuIGV4cGVyaW1lbnRhbCBmZWF0dXJlLiBXb3JrcyBvbmx5IGluIERhcnQuXG4gIHN1YnNjcmlwdGlvbnM6IGFueVtdO1xuICBzdHJlYW1zOiBhbnlbXTtcblxuICBkaXNwYXRjaGVyOiBDaGFuZ2VEaXNwYXRjaGVyO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIGlkOiBzdHJpbmcsIHB1YmxpYyBudW1iZXJPZlByb3BlcnR5UHJvdG9SZWNvcmRzOiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBiaW5kaW5nVGFyZ2V0czogQmluZGluZ1RhcmdldFtdLCBwdWJsaWMgZGlyZWN0aXZlSW5kaWNlczogRGlyZWN0aXZlSW5kZXhbXSxcbiAgICAgICAgICAgICAgcHVibGljIHN0cmF0ZWd5OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSkge1xuICAgIHRoaXMucmVmID0gbmV3IENoYW5nZURldGVjdG9yUmVmXyh0aGlzKTtcbiAgfVxuXG4gIGFkZENvbnRlbnRDaGlsZChjZDogQ2hhbmdlRGV0ZWN0b3IpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRDaGlsZHJlbi5wdXNoKGNkKTtcbiAgICBjZC5wYXJlbnQgPSB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlQ29udGVudENoaWxkKGNkOiBDaGFuZ2VEZXRlY3Rvcik6IHZvaWQgeyBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5jb250ZW50Q2hpbGRyZW4sIGNkKTsgfVxuXG4gIGFkZFZpZXdDaGlsZChjZDogQ2hhbmdlRGV0ZWN0b3IpOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdDaGlsZHJlbi5wdXNoKGNkKTtcbiAgICBjZC5wYXJlbnQgPSB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlVmlld0NoaWxkKGNkOiBDaGFuZ2VEZXRlY3Rvcik6IHZvaWQgeyBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy52aWV3Q2hpbGRyZW4sIGNkKTsgfVxuXG4gIHJlbW92ZSgpOiB2b2lkIHsgdGhpcy5wYXJlbnQucmVtb3ZlQ29udGVudENoaWxkKHRoaXMpOyB9XG5cbiAgaGFuZGxlRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIGVsSW5kZXg6IG51bWJlciwgZXZlbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5oeWRyYXRlZCgpKSB7XG4gICAgICB0aGlzLnRocm93RGVoeWRyYXRlZEVycm9yKCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICB2YXIgbG9jYWxzID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcbiAgICAgIGxvY2Fscy5zZXQoJyRldmVudCcsIGV2ZW50KTtcbiAgICAgIHZhciByZXMgPSAhdGhpcy5oYW5kbGVFdmVudEludGVybmFsKGV2ZW50TmFtZSwgZWxJbmRleCwgbmV3IExvY2Fscyh0aGlzLmxvY2FscywgbG9jYWxzKSk7XG4gICAgICB0aGlzLm1hcmtQYXRoVG9Sb290QXNDaGVja09uY2UoKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdmFyIGMgPSB0aGlzLmRpc3BhdGNoZXIuZ2V0RGVidWdDb250ZXh0KG51bGwsIGVsSW5kZXgsIG51bGwpO1xuICAgICAgdmFyIGNvbnRleHQgPSBpc1ByZXNlbnQoYykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEV2ZW50RXZhbHVhdGlvbkVycm9yQ29udGV4dChjLmVsZW1lbnQsIGMuY29tcG9uZW50RWxlbWVudCwgYy5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLmxvY2FscywgYy5pbmplY3RvcikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICAgIHRocm93IG5ldyBFdmVudEV2YWx1YXRpb25FcnJvcihldmVudE5hbWUsIGUsIGUuc3RhY2ssIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUV2ZW50SW50ZXJuYWwoZXZlbnROYW1lOiBzdHJpbmcsIGVsSW5kZXg6IG51bWJlciwgbG9jYWxzOiBMb2NhbHMpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHsgdGhpcy5ydW5EZXRlY3RDaGFuZ2VzKGZhbHNlKTsgfVxuXG4gIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQge1xuICAgIGlmIChhc3NlcnRpb25zRW5hYmxlZCgpKSB7XG4gICAgICB0aGlzLnJ1bkRldGVjdENoYW5nZXModHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgcnVuRGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQgfHxcbiAgICAgICAgdGhpcy5tb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkIHx8IHRoaXMuc3RhdGUgPT09IENoYW5nZURldGVjdG9yU3RhdGUuRXJyb3JlZClcbiAgICAgIHJldHVybjtcbiAgICB2YXIgcyA9IF9zY29wZV9jaGVjayh0aGlzLmlkLCB0aHJvd09uQ2hhbmdlKTtcblxuICAgIHRoaXMuZGV0ZWN0Q2hhbmdlc0luUmVjb3Jkcyh0aHJvd09uQ2hhbmdlKTtcblxuICAgIHRoaXMuX2RldGVjdENoYW5nZXNDb250ZW50Q2hpbGRyZW4odGhyb3dPbkNoYW5nZSk7XG4gICAgaWYgKCF0aHJvd09uQ2hhbmdlKSB0aGlzLmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrcygpO1xuXG4gICAgdGhpcy5fZGV0ZWN0Q2hhbmdlc0luVmlld0NoaWxkcmVuKHRocm93T25DaGFuZ2UpO1xuICAgIGlmICghdGhyb3dPbkNoYW5nZSkgdGhpcy5hZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3MoKTtcblxuICAgIGlmICh0aGlzLm1vZGUgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrT25jZSlcbiAgICAgIHRoaXMubW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrZWQ7XG5cbiAgICB0aGlzLnN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5DaGVja2VkQmVmb3JlO1xuICAgIHd0ZkxlYXZlKHMpO1xuICB9XG5cbiAgLy8gVGhpcyBtZXRob2QgaXMgbm90IGludGVuZGVkIHRvIGJlIG92ZXJyaWRkZW4uIFN1YmNsYXNzZXMgc2hvdWxkIGluc3RlYWQgcHJvdmlkZSBhblxuICAvLyBpbXBsZW1lbnRhdGlvbiBvZiBgZGV0ZWN0Q2hhbmdlc0luUmVjb3Jkc0ludGVybmFsYCB3aGljaCBkb2VzIHRoZSB3b3JrIG9mIGRldGVjdGluZyBjaGFuZ2VzXG4gIC8vIGFuZCB3aGljaCB0aGlzIG1ldGhvZCB3aWxsIGNhbGwuXG4gIC8vIFRoaXMgbWV0aG9kIGV4cGVjdHMgdGhhdCBgZGV0ZWN0Q2hhbmdlc0luUmVjb3Jkc0ludGVybmFsYCB3aWxsIHNldCB0aGUgcHJvcGVydHlcbiAgLy8gYHRoaXMucHJvcGVydHlCaW5kaW5nSW5kZXhgIHRvIHRoZSBwcm9wZXJ0eUJpbmRpbmdJbmRleCBvZiB0aGUgZmlyc3QgcHJvdG8gcmVjb3JkLiBUaGlzIGlzIHRvXG4gIC8vIGZhY2lsaXRhdGUgZXJyb3IgcmVwb3J0aW5nLlxuICBkZXRlY3RDaGFuZ2VzSW5SZWNvcmRzKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaHlkcmF0ZWQoKSkge1xuICAgICAgdGhpcy50aHJvd0RlaHlkcmF0ZWRFcnJvcigpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgdGhpcy5kZXRlY3RDaGFuZ2VzSW5SZWNvcmRzSW50ZXJuYWwodGhyb3dPbkNoYW5nZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gdGhyb3dPbkNoYW5nZSBlcnJvcnMgYXJlbid0IGNvdW50ZWQgYXMgZmF0YWwgZXJyb3JzLlxuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uKSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkO1xuICAgICAgfVxuICAgICAgdGhpcy5fdGhyb3dFcnJvcihlLCBlLnN0YWNrKTtcbiAgICB9XG4gIH1cblxuICAvLyBTdWJjbGFzc2VzIHNob3VsZCBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBwZXJmb3JtIGFueSB3b3JrIG5lY2Vzc2FyeSB0byBkZXRlY3QgYW5kIHJlcG9ydFxuICAvLyBjaGFuZ2VzLiBGb3IgZXhhbXBsZSwgY2hhbmdlcyBzaG91bGQgYmUgcmVwb3J0ZWQgdmlhIGBDaGFuZ2VEZXRlY3Rpb25VdGlsLmFkZENoYW5nZWAsIGxpZmVjeWNsZVxuICAvLyBtZXRob2RzIHNob3VsZCBiZSBjYWxsZWQsIGV0Yy5cbiAgLy8gVGhpcyBpbXBsZW1lbnRhdGlvbiBzaG91bGQgYWxzbyBzZXQgYHRoaXMucHJvcGVydHlCaW5kaW5nSW5kZXhgIHRvIHRoZSBwcm9wZXJ0eUJpbmRpbmdJbmRleCBvZlxuICAvLyB0aGVcbiAgLy8gZmlyc3QgcHJvdG8gcmVjb3JkIHRvIGZhY2lsaXRhdGUgZXJyb3IgcmVwb3J0aW5nLiBTZWUge0BsaW5rICNkZXRlY3RDaGFuZ2VzSW5SZWNvcmRzfS5cbiAgZGV0ZWN0Q2hhbmdlc0luUmVjb3Jkc0ludGVybmFsKHRocm93T25DaGFuZ2U6IGJvb2xlYW4pOiB2b2lkIHt9XG5cbiAgLy8gVGhpcyBtZXRob2QgaXMgbm90IGludGVuZGVkIHRvIGJlIG92ZXJyaWRkZW4uIFN1YmNsYXNzZXMgc2hvdWxkIGluc3RlYWQgcHJvdmlkZSBhblxuICAvLyBpbXBsZW1lbnRhdGlvbiBvZiBgaHlkcmF0ZURpcmVjdGl2ZXNgLlxuICBoeWRyYXRlKGNvbnRleHQ6IFQsIGxvY2FsczogTG9jYWxzLCBkaXNwYXRjaGVyOiBDaGFuZ2VEaXNwYXRjaGVyLCBwaXBlczogUGlwZXMpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMubW9kZSA9IENoYW5nZURldGVjdGlvblV0aWwuY2hhbmdlRGV0ZWN0aW9uTW9kZSh0aGlzLnN0cmF0ZWd5KTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgaWYgKHRoaXMuc3RyYXRlZ3kgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaE9ic2VydmUpIHtcbiAgICAgIHRoaXMub2JzZXJ2ZUNvbXBvbmVudChjb250ZXh0KTtcbiAgICB9XG5cbiAgICB0aGlzLmxvY2FscyA9IGxvY2FscztcbiAgICB0aGlzLnBpcGVzID0gcGlwZXM7XG4gICAgdGhpcy5oeWRyYXRlRGlyZWN0aXZlcyhkaXNwYXRjaGVyKTtcbiAgICB0aGlzLnN0YXRlID0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQ7XG4gIH1cblxuICAvLyBTdWJjbGFzc2VzIHNob3VsZCBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBoeWRyYXRlIGFueSBkaXJlY3RpdmVzLlxuICBoeWRyYXRlRGlyZWN0aXZlcyhkaXNwYXRjaGVyOiBDaGFuZ2VEaXNwYXRjaGVyKTogdm9pZCB7fVxuXG4gIC8vIFRoaXMgbWV0aG9kIGlzIG5vdCBpbnRlbmRlZCB0byBiZSBvdmVycmlkZGVuLiBTdWJjbGFzc2VzIHNob3VsZCBpbnN0ZWFkIHByb3ZpZGUgYW5cbiAgLy8gaW1wbGVtZW50YXRpb24gb2YgYGRlaHlkcmF0ZURpcmVjdGl2ZXNgLlxuICBkZWh5ZHJhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5kZWh5ZHJhdGVEaXJlY3RpdmVzKHRydWUpO1xuXG4gICAgLy8gVGhpcyBpcyBhbiBleHBlcmltZW50YWwgZmVhdHVyZS4gV29ya3Mgb25seSBpbiBEYXJ0LlxuICAgIGlmICh0aGlzLnN0cmF0ZWd5ID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hPYnNlcnZlKSB7XG4gICAgICB0aGlzLl91bnN1YnNyaWJlRnJvbU9ic2VydmFibGVzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fdW5zdWJzY3JpYmVGcm9tT3V0cHV0cygpO1xuXG4gICAgdGhpcy5kaXNwYXRjaGVyID0gbnVsbDtcbiAgICB0aGlzLmNvbnRleHQgPSBudWxsO1xuICAgIHRoaXMubG9jYWxzID0gbnVsbDtcbiAgICB0aGlzLnBpcGVzID0gbnVsbDtcbiAgfVxuXG4gIC8vIFN1YmNsYXNzZXMgc2hvdWxkIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGRlaHlkcmF0ZSBhbnkgZGlyZWN0aXZlcy4gVGhpcyBtZXRob2Qgc2hvdWxkIHJldmVyc2VcbiAgLy8gYW55IHdvcmsgZG9uZSBpbiBgaHlkcmF0ZURpcmVjdGl2ZXNgLlxuICBkZWh5ZHJhdGVEaXJlY3RpdmVzKGRlc3Ryb3lQaXBlczogYm9vbGVhbik6IHZvaWQge31cblxuICBoeWRyYXRlZCgpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbnRleHQpOyB9XG5cbiAgZGVzdHJveVJlY3Vyc2l2ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIubm90aWZ5T25EZXN0cm95KCk7XG4gICAgdGhpcy5kZWh5ZHJhdGUoKTtcbiAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmNvbnRlbnRDaGlsZHJlbjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGlsZHJlbltpXS5kZXN0cm95UmVjdXJzaXZlKCk7XG4gICAgfVxuICAgIGNoaWxkcmVuID0gdGhpcy52aWV3Q2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGRyZW5baV0uZGVzdHJveVJlY3Vyc2l2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIubm90aWZ5QWZ0ZXJDb250ZW50Q2hlY2tlZCgpO1xuICAgIHRoaXMuYWZ0ZXJDb250ZW50TGlmZWN5Y2xlQ2FsbGJhY2tzSW50ZXJuYWwoKTtcbiAgfVxuXG4gIGFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsKCk6IHZvaWQge31cblxuICBhZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3MoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm5vdGlmeUFmdGVyVmlld0NoZWNrZWQoKTtcbiAgICB0aGlzLmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc0ludGVybmFsKCk7XG4gIH1cblxuICBhZnRlclZpZXdMaWZlY3ljbGVDYWxsYmFja3NJbnRlcm5hbCgpOiB2b2lkIHt9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGV0ZWN0Q2hhbmdlc0NvbnRlbnRDaGlsZHJlbih0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdmFyIGMgPSB0aGlzLmNvbnRlbnRDaGlsZHJlbjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGNbaV0ucnVuRGV0ZWN0Q2hhbmdlcyh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9kZXRlY3RDaGFuZ2VzSW5WaWV3Q2hpbGRyZW4odGhyb3dPbkNoYW5nZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHZhciBjID0gdGhpcy52aWV3Q2hpbGRyZW47XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjLmxlbmd0aDsgKytpKSB7XG4gICAgICBjW2ldLnJ1bkRldGVjdENoYW5nZXModGhyb3dPbkNoYW5nZSk7XG4gICAgfVxuICB9XG5cbiAgbWFya0FzQ2hlY2tPbmNlKCk6IHZvaWQgeyB0aGlzLm1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7IH1cblxuICBtYXJrUGF0aFRvUm9vdEFzQ2hlY2tPbmNlKCk6IHZvaWQge1xuICAgIHZhciBjOiBDaGFuZ2VEZXRlY3RvciA9IHRoaXM7XG4gICAgd2hpbGUgKGlzUHJlc2VudChjKSAmJiBjLm1vZGUgIT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRldGFjaGVkKSB7XG4gICAgICBpZiAoYy5tb2RlID09PSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkKSBjLm1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7XG4gICAgICBjID0gYy5wYXJlbnQ7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhpcyBpcyBhbiBleHBlcmltZW50YWwgZmVhdHVyZS4gV29ya3Mgb25seSBpbiBEYXJ0LlxuICBwcml2YXRlIF91bnN1YnNyaWJlRnJvbU9ic2VydmFibGVzKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5zdWJzY3JpcHRpb25zKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnN1YnNjcmlwdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHMgPSB0aGlzLnN1YnNjcmlwdGlvbnNbaV07XG4gICAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5zdWJzY3JpcHRpb25zW2ldKSkge1xuICAgICAgICAgIHMuY2FuY2VsKCk7XG4gICAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zW2ldID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Vuc3Vic2NyaWJlRnJvbU91dHB1dHMoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLm91dHB1dFN1YnNjcmlwdGlvbnMpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMub3V0cHV0U3Vic2NyaXB0aW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMub3V0cHV0U3Vic2NyaXB0aW9uc1tpXSk7XG4gICAgICAgIHRoaXMub3V0cHV0U3Vic2NyaXB0aW9uc1tpXSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVGhpcyBpcyBhbiBleHBlcmltZW50YWwgZmVhdHVyZS4gV29ya3Mgb25seSBpbiBEYXJ0LlxuICBvYnNlcnZlVmFsdWUodmFsdWU6IGFueSwgaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUFycmF5VG9TdG9yZU9ic2VydmFibGVzKCk7XG4gICAgICBpZiAoaXNCbGFuayh0aGlzLnN1YnNjcmlwdGlvbnNbaW5kZXhdKSkge1xuICAgICAgICB0aGlzLnN0cmVhbXNbaW5kZXhdID0gdmFsdWUuY2hhbmdlcztcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zW2luZGV4XSA9IHZhbHVlLmNoYW5nZXMubGlzdGVuKChfKSA9PiB0aGlzLnJlZi5tYXJrRm9yQ2hlY2soKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc3RyZWFtc1tpbmRleF0gIT09IHZhbHVlLmNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zW2luZGV4XS5jYW5jZWwoKTtcbiAgICAgICAgdGhpcy5zdHJlYW1zW2luZGV4XSA9IHZhbHVlLmNoYW5nZXM7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uc1tpbmRleF0gPSB2YWx1ZS5jaGFuZ2VzLmxpc3RlbigoXykgPT4gdGhpcy5yZWYubWFya0ZvckNoZWNrKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvLyBUaGlzIGlzIGFuIGV4cGVyaW1lbnRhbCBmZWF0dXJlLiBXb3JrcyBvbmx5IGluIERhcnQuXG4gIG9ic2VydmVEaXJlY3RpdmUodmFsdWU6IGFueSwgaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUFycmF5VG9TdG9yZU9ic2VydmFibGVzKCk7XG4gICAgICB2YXIgYXJyYXlJbmRleCA9IHRoaXMubnVtYmVyT2ZQcm9wZXJ0eVByb3RvUmVjb3JkcyArIGluZGV4ICsgMjsgIC8vICsxIGlzIGNvbXBvbmVudFxuICAgICAgdGhpcy5zdHJlYW1zW2FycmF5SW5kZXhdID0gdmFsdWUuY2hhbmdlcztcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9uc1thcnJheUluZGV4XSA9IHZhbHVlLmNoYW5nZXMubGlzdGVuKChfKSA9PiB0aGlzLnJlZi5tYXJrRm9yQ2hlY2soKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgYW4gZXhwZXJpbWVudGFsIGZlYXR1cmUuIFdvcmtzIG9ubHkgaW4gRGFydC5cbiAgb2JzZXJ2ZUNvbXBvbmVudCh2YWx1ZTogYW55KTogYW55IHtcbiAgICBpZiAoaXNPYnNlcnZhYmxlKHZhbHVlKSkge1xuICAgICAgdGhpcy5fY3JlYXRlQXJyYXlUb1N0b3JlT2JzZXJ2YWJsZXMoKTtcbiAgICAgIHZhciBpbmRleCA9IHRoaXMubnVtYmVyT2ZQcm9wZXJ0eVByb3RvUmVjb3JkcyArIDE7XG4gICAgICB0aGlzLnN0cmVhbXNbaW5kZXhdID0gdmFsdWUuY2hhbmdlcztcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9uc1tpbmRleF0gPSB2YWx1ZS5jaGFuZ2VzLmxpc3RlbigoXykgPT4gdGhpcy5yZWYubWFya0ZvckNoZWNrKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVBcnJheVRvU3RvcmVPYnNlcnZhYmxlcygpOiB2b2lkIHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLnN1YnNjcmlwdGlvbnMpKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUodGhpcy5udW1iZXJPZlByb3BlcnR5UHJvdG9SZWNvcmRzICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZUluZGljZXMubGVuZ3RoICsgMik7XG4gICAgICB0aGlzLnN0cmVhbXMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUodGhpcy5udW1iZXJPZlByb3BlcnR5UHJvdG9SZWNvcmRzICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZUluZGljZXMubGVuZ3RoICsgMik7XG4gICAgfVxuICB9XG5cbiAgZ2V0RGlyZWN0aXZlRm9yKGRpcmVjdGl2ZXM6IGFueSwgaW5kZXg6IG51bWJlcik6IGFueSB7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZXMuZ2V0RGlyZWN0aXZlRm9yKHRoaXMuZGlyZWN0aXZlSW5kaWNlc1tpbmRleF0pO1xuICB9XG5cbiAgZ2V0RGV0ZWN0b3JGb3IoZGlyZWN0aXZlczogYW55LCBpbmRleDogbnVtYmVyKTogQ2hhbmdlRGV0ZWN0b3Ige1xuICAgIHJldHVybiBkaXJlY3RpdmVzLmdldERldGVjdG9yRm9yKHRoaXMuZGlyZWN0aXZlSW5kaWNlc1tpbmRleF0pO1xuICB9XG5cbiAgbm90aWZ5RGlzcGF0Y2hlcih2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm5vdGlmeU9uQmluZGluZyh0aGlzLl9jdXJyZW50QmluZGluZygpLCB2YWx1ZSk7XG4gIH1cblxuICBsb2dCaW5kaW5nVXBkYXRlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIubG9nQmluZGluZ1VwZGF0ZSh0aGlzLl9jdXJyZW50QmluZGluZygpLCB2YWx1ZSk7XG4gIH1cblxuICBhZGRDaGFuZ2UoY2hhbmdlczoge1trZXk6IHN0cmluZ106IGFueX0sIG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgaWYgKGlzQmxhbmsoY2hhbmdlcykpIHtcbiAgICAgIGNoYW5nZXMgPSB7fTtcbiAgICB9XG4gICAgY2hhbmdlc1t0aGlzLl9jdXJyZW50QmluZGluZygpLm5hbWVdID0gQ2hhbmdlRGV0ZWN0aW9uVXRpbC5zaW1wbGVDaGFuZ2Uob2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICByZXR1cm4gY2hhbmdlcztcbiAgfVxuXG4gIHByaXZhdGUgX3Rocm93RXJyb3IoZXhjZXB0aW9uOiBhbnksIHN0YWNrOiBhbnkpOiB2b2lkIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBjID0gdGhpcy5kaXNwYXRjaGVyLmdldERlYnVnQ29udGV4dChudWxsLCB0aGlzLl9jdXJyZW50QmluZGluZygpLmVsZW1lbnRJbmRleCwgbnVsbCk7XG4gICAgICB2YXIgY29udGV4dCA9IGlzUHJlc2VudChjKSA/IG5ldyBfQ29udGV4dChjLmVsZW1lbnQsIGMuY29tcG9uZW50RWxlbWVudCwgYy5jb250ZXh0LCBjLmxvY2FscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMuaW5qZWN0b3IsIHRoaXMuX2N1cnJlbnRCaW5kaW5nKCkuZGVidWcpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICAgIGVycm9yID0gbmV3IENoYW5nZURldGVjdGlvbkVycm9yKHRoaXMuX2N1cnJlbnRCaW5kaW5nKCkuZGVidWcsIGV4Y2VwdGlvbiwgc3RhY2ssIGNvbnRleHQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIGlmIGFuIGVycm9yIGhhcHBlbnMgZHVyaW5nIGdldHRpbmcgdGhlIGRlYnVnIGNvbnRleHQsIHdlIHRocm93IGEgQ2hhbmdlRGV0ZWN0aW9uRXJyb3JcbiAgICAgIC8vIHdpdGhvdXQgdGhlIGV4dHJhIGluZm9ybWF0aW9uLlxuICAgICAgZXJyb3IgPSBuZXcgQ2hhbmdlRGV0ZWN0aW9uRXJyb3IobnVsbCwgZXhjZXB0aW9uLCBzdGFjaywgbnVsbCk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgdGhyb3dPbkNoYW5nZUVycm9yKG9sZFZhbHVlOiBhbnksIG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXhwcmVzc2lvbkNoYW5nZWRBZnRlckl0SGFzQmVlbkNoZWNrZWRFeGNlcHRpb24odGhpcy5fY3VycmVudEJpbmRpbmcoKS5kZWJ1ZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkVmFsdWUsIG5ld1ZhbHVlLCBudWxsKTtcbiAgfVxuXG4gIHRocm93RGVoeWRyYXRlZEVycm9yKCk6IHZvaWQgeyB0aHJvdyBuZXcgRGVoeWRyYXRlZEV4Y2VwdGlvbigpOyB9XG5cbiAgcHJpdmF0ZSBfY3VycmVudEJpbmRpbmcoKTogQmluZGluZ1RhcmdldCB7XG4gICAgcmV0dXJuIHRoaXMuYmluZGluZ1RhcmdldHNbdGhpcy5wcm9wZXJ0eUJpbmRpbmdJbmRleF07XG4gIH1cbn1cbiJdfQ==