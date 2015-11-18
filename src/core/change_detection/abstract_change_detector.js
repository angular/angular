'use strict';var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var change_detection_util_1 = require('./change_detection_util');
var change_detector_ref_1 = require('./change_detector_ref');
var exceptions_1 = require('./exceptions');
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
    function AbstractChangeDetector(id, dispatcher, numberOfPropertyProtoRecords, bindingTargets, directiveIndices, strategy) {
        this.id = id;
        this.dispatcher = dispatcher;
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
    AbstractChangeDetector.prototype.handleEvent = function (eventName, elIndex, locals) {
        var res = this.handleEventInternal(eventName, elIndex, locals);
        this.markPathToRootAsCheckOnce();
        return res;
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
    AbstractChangeDetector.prototype.hydrate = function (context, locals, directives, pipes) {
        this.mode = change_detection_util_1.ChangeDetectionUtil.changeDetectionMode(this.strategy);
        this.context = context;
        if (this.strategy === constants_1.ChangeDetectionStrategy.OnPushObserve) {
            this.observeComponent(context);
        }
        this.locals = locals;
        this.pipes = pipes;
        this.hydrateDirectives(directives);
        this.state = constants_1.ChangeDetectorState.NeverChecked;
    };
    // Subclasses should override this method to hydrate any directives.
    AbstractChangeDetector.prototype.hydrateDirectives = function (directives) { };
    // This method is not intended to be overridden. Subclasses should instead provide an
    // implementation of `dehydrateDirectives`.
    AbstractChangeDetector.prototype.dehydrate = function () {
        this.dehydrateDirectives(true);
        // This is an experimental feature. Works only in Dart.
        if (this.strategy === constants_1.ChangeDetectionStrategy.OnPushObserve) {
            this._unsubsribeFromObservables();
        }
        this.context = null;
        this.locals = null;
        this.pipes = null;
    };
    // Subclasses should override this method to dehydrate any directives. This method should reverse
    // any work done in `hydrateDirectives`.
    AbstractChangeDetector.prototype.dehydrateDirectives = function (destroyPipes) { };
    AbstractChangeDetector.prototype.hydrated = function () { return this.context !== null; };
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
            var c = this.dispatcher.getDebugContext(this._currentBinding().elementIndex, null);
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
//# sourceMappingURL=abstract_change_detector.js.map