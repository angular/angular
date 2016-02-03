import {assertionsEnabled, isPresent, isBlank, StringWrapper} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {ChangeDetectionUtil} from './change_detection_util';
import {ChangeDetectorRef, ChangeDetectorRef_} from './change_detector_ref';
import {DirectiveIndex} from './directive_record';
import {ChangeDetector, ChangeDispatcher} from './interfaces';
import {Pipes} from './pipes';
import {
  ChangeDetectionError,
  ExpressionChangedAfterItHasBeenCheckedException,
  DehydratedException,
  EventEvaluationErrorContext,
  EventEvaluationError
} from './exceptions';
import {BindingTarget} from './binding_record';
import {Locals} from './parser/locals';
import {ChangeDetectionStrategy, ChangeDetectorState} from './constants';
import {wtfCreateScope, wtfLeave, WtfScopeFn} from '../profile/profile';
import {isObservable} from './observable_facade';
import {ObservableWrapper} from 'angular2/src/facade/async';

var _scope_check: WtfScopeFn = wtfCreateScope(`ChangeDetector#check(ascii id, bool throwOnChange)`);

class _Context {
  constructor(public element: any, public componentElement: any, public context: any,
              public locals: any, public injector: any, public expression: any) {}
}

export class AbstractChangeDetector<T> implements ChangeDetector {
  contentChildren: any[] = [];
  viewChildren: any[] = [];
  parent: ChangeDetector;
  ref: ChangeDetectorRef;

  // The names of the below fields must be kept in sync with codegen_name_util.ts or
  // change detection will fail.
  state: ChangeDetectorState = ChangeDetectorState.NeverChecked;
  context: T;
  locals: Locals = null;
  mode: ChangeDetectionStrategy = null;
  pipes: Pipes = null;
  propertyBindingIndex: number;
  outputSubscriptions: any[];

  // This is an experimental feature. Works only in Dart.
  subscriptions: any[];
  streams: any[];

  dispatcher: ChangeDispatcher;


  constructor(public id: string, public numberOfPropertyProtoRecords: number,
              public bindingTargets: BindingTarget[], public directiveIndices: DirectiveIndex[],
              public strategy: ChangeDetectionStrategy) {
    this.ref = new ChangeDetectorRef_(this);
  }

  addContentChild(cd: ChangeDetector): void {
    this.contentChildren.push(cd);
    cd.parent = this;
  }

  removeContentChild(cd: ChangeDetector): void { ListWrapper.remove(this.contentChildren, cd); }

  addViewChild(cd: ChangeDetector): void {
    this.viewChildren.push(cd);
    cd.parent = this;
  }

  removeViewChild(cd: ChangeDetector): void { ListWrapper.remove(this.viewChildren, cd); }

  remove(): void { this.parent.removeContentChild(this); }

  handleEvent(eventName: string, elIndex: number, event: any): boolean {
    if (!this.hydrated()) {
      this.throwDehydratedError();
    }
    try {
      var locals = new Map<string, any>();
      locals.set('$event', event);
      var res = !this.handleEventInternal(eventName, elIndex, new Locals(this.locals, locals));
      this.markPathToRootAsCheckOnce();
      return res;
    } catch (e) {
      var c = this.dispatcher.getDebugContext(null, elIndex, null);
      var context = isPresent(c) ?
                        new EventEvaluationErrorContext(c.element, c.componentElement, c.context,
                                                        c.locals, c.injector) :
                        null;
      throw new EventEvaluationError(eventName, e, e.stack, context);
    }
  }

  handleEventInternal(eventName: string, elIndex: number, locals: Locals): boolean { return false; }

  detectChanges(): void { this.runDetectChanges(false); }

  checkNoChanges(): void {
    if (assertionsEnabled()) {
      this.runDetectChanges(true);
    }
  }

  runDetectChanges(throwOnChange: boolean): void {
    if (this.mode === ChangeDetectionStrategy.Detached ||
        this.mode === ChangeDetectionStrategy.Checked || this.state === ChangeDetectorState.Errored)
      return;
    var s = _scope_check(this.id, throwOnChange);

    this.detectChangesInRecords(throwOnChange);

    this._detectChangesContentChildren(throwOnChange);
    if (!throwOnChange) this.afterContentLifecycleCallbacks();

    this._detectChangesInViewChildren(throwOnChange);
    if (!throwOnChange) this.afterViewLifecycleCallbacks();

    if (this.mode === ChangeDetectionStrategy.CheckOnce)
      this.mode = ChangeDetectionStrategy.Checked;

    this.state = ChangeDetectorState.CheckedBefore;
    wtfLeave(s);
  }

  // This method is not intended to be overridden. Subclasses should instead provide an
  // implementation of `detectChangesInRecordsInternal` which does the work of detecting changes
  // and which this method will call.
  // This method expects that `detectChangesInRecordsInternal` will set the property
  // `this.propertyBindingIndex` to the propertyBindingIndex of the first proto record. This is to
  // facilitate error reporting.
  detectChangesInRecords(throwOnChange: boolean): void {
    if (!this.hydrated()) {
      this.throwDehydratedError();
    }
    try {
      this.detectChangesInRecordsInternal(throwOnChange);
    } catch (e) {
      // throwOnChange errors aren't counted as fatal errors.
      if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedException)) {
        this.state = ChangeDetectorState.Errored;
      }
      this._throwError(e, e.stack);
    }
  }

  // Subclasses should override this method to perform any work necessary to detect and report
  // changes. For example, changes should be reported via `ChangeDetectionUtil.addChange`, lifecycle
  // methods should be called, etc.
  // This implementation should also set `this.propertyBindingIndex` to the propertyBindingIndex of
  // the
  // first proto record to facilitate error reporting. See {@link #detectChangesInRecords}.
  detectChangesInRecordsInternal(throwOnChange: boolean): void {}

  // This method is not intended to be overridden. Subclasses should instead provide an
  // implementation of `hydrateDirectives`.
  hydrate(context: T, locals: Locals, dispatcher: ChangeDispatcher, pipes: Pipes): void {
    this.dispatcher = dispatcher;
    this.mode = ChangeDetectionUtil.changeDetectionMode(this.strategy);
    this.context = context;

    if (this.strategy === ChangeDetectionStrategy.OnPushObserve) {
      this.observeComponent(context);
    }

    this.locals = locals;
    this.pipes = pipes;
    this.hydrateDirectives(dispatcher);
    this.state = ChangeDetectorState.NeverChecked;
  }

  // Subclasses should override this method to hydrate any directives.
  hydrateDirectives(dispatcher: ChangeDispatcher): void {}

  // This method is not intended to be overridden. Subclasses should instead provide an
  // implementation of `dehydrateDirectives`.
  dehydrate(): void {
    this.dehydrateDirectives(true);

    // This is an experimental feature. Works only in Dart.
    if (this.strategy === ChangeDetectionStrategy.OnPushObserve) {
      this._unsubsribeFromObservables();
    }

    this._unsubscribeFromOutputs();

    this.dispatcher = null;
    this.context = null;
    this.locals = null;
    this.pipes = null;
  }

  // Subclasses should override this method to dehydrate any directives. This method should reverse
  // any work done in `hydrateDirectives`.
  dehydrateDirectives(destroyPipes: boolean): void {}

  hydrated(): boolean { return isPresent(this.context); }

  destroyRecursive(): void {
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
  }

  afterContentLifecycleCallbacks(): void {
    this.dispatcher.notifyAfterContentChecked();
    this.afterContentLifecycleCallbacksInternal();
  }

  afterContentLifecycleCallbacksInternal(): void {}

  afterViewLifecycleCallbacks(): void {
    this.dispatcher.notifyAfterViewChecked();
    this.afterViewLifecycleCallbacksInternal();
  }

  afterViewLifecycleCallbacksInternal(): void {}

  /** @internal */
  _detectChangesContentChildren(throwOnChange: boolean): void {
    var c = this.contentChildren;
    for (var i = 0; i < c.length; ++i) {
      c[i].runDetectChanges(throwOnChange);
    }
  }

  /** @internal */
  _detectChangesInViewChildren(throwOnChange: boolean): void {
    var c = this.viewChildren;
    for (var i = 0; i < c.length; ++i) {
      c[i].runDetectChanges(throwOnChange);
    }
  }

  markAsCheckOnce(): void { this.mode = ChangeDetectionStrategy.CheckOnce; }

  markPathToRootAsCheckOnce(): void {
    var c: ChangeDetector = this;
    while (isPresent(c) && c.mode !== ChangeDetectionStrategy.Detached) {
      if (c.mode === ChangeDetectionStrategy.Checked) c.mode = ChangeDetectionStrategy.CheckOnce;
      c = c.parent;
    }
  }

  // This is an experimental feature. Works only in Dart.
  private _unsubsribeFromObservables(): void {
    if (isPresent(this.subscriptions)) {
      for (var i = 0; i < this.subscriptions.length; ++i) {
        var s = this.subscriptions[i];
        if (isPresent(this.subscriptions[i])) {
          s.cancel();
          this.subscriptions[i] = null;
        }
      }
    }
  }

  private _unsubscribeFromOutputs(): void {
    if (isPresent(this.outputSubscriptions)) {
      for (var i = 0; i < this.outputSubscriptions.length; ++i) {
        ObservableWrapper.dispose(this.outputSubscriptions[i]);
        this.outputSubscriptions[i] = null;
      }
    }
  }

  // This is an experimental feature. Works only in Dart.
  observeValue(value: any, index: number): any {
    if (isObservable(value)) {
      this._createArrayToStoreObservables();
      if (isBlank(this.subscriptions[index])) {
        this.streams[index] = value.changes;
        this.subscriptions[index] = value.changes.listen((_) => this.ref.markForCheck());
      } else if (this.streams[index] !== value.changes) {
        this.subscriptions[index].cancel();
        this.streams[index] = value.changes;
        this.subscriptions[index] = value.changes.listen((_) => this.ref.markForCheck());
      }
    }
    return value;
  }

  // This is an experimental feature. Works only in Dart.
  observeDirective(value: any, index: number): any {
    if (isObservable(value)) {
      this._createArrayToStoreObservables();
      var arrayIndex = this.numberOfPropertyProtoRecords + index + 2;  // +1 is component
      this.streams[arrayIndex] = value.changes;
      this.subscriptions[arrayIndex] = value.changes.listen((_) => this.ref.markForCheck());
    }
    return value;
  }

  // This is an experimental feature. Works only in Dart.
  observeComponent(value: any): any {
    if (isObservable(value)) {
      this._createArrayToStoreObservables();
      var index = this.numberOfPropertyProtoRecords + 1;
      this.streams[index] = value.changes;
      this.subscriptions[index] = value.changes.listen((_) => this.ref.markForCheck());
    }
    return value;
  }

  private _createArrayToStoreObservables(): void {
    if (isBlank(this.subscriptions)) {
      this.subscriptions = ListWrapper.createFixedSize(this.numberOfPropertyProtoRecords +
                                                       this.directiveIndices.length + 2);
      this.streams = ListWrapper.createFixedSize(this.numberOfPropertyProtoRecords +
                                                 this.directiveIndices.length + 2);
    }
  }

  getDirectiveFor(directives: any, index: number): any {
    return directives.getDirectiveFor(this.directiveIndices[index]);
  }

  getDetectorFor(directives: any, index: number): ChangeDetector {
    return directives.getDetectorFor(this.directiveIndices[index]);
  }

  notifyDispatcher(value: any): void {
    this.dispatcher.notifyOnBinding(this._currentBinding(), value);
  }

  logBindingUpdate(value: any): void {
    this.dispatcher.logBindingUpdate(this._currentBinding(), value);
  }

  addChange(changes: {[key: string]: any}, oldValue: any, newValue: any): {[key: string]: any} {
    if (isBlank(changes)) {
      changes = {};
    }
    changes[this._currentBinding().name] = ChangeDetectionUtil.simpleChange(oldValue, newValue);
    return changes;
  }

  private _throwError(exception: any, stack: any): void {
    var error;
    try {
      var c = this.dispatcher.getDebugContext(null, this._currentBinding().elementIndex, null);
      var context = isPresent(c) ? new _Context(c.element, c.componentElement, c.context, c.locals,
                                                c.injector, this._currentBinding().debug) :
                                   null;
      error = new ChangeDetectionError(this._currentBinding().debug, exception, stack, context);
    } catch (e) {
      // if an error happens during getting the debug context, we throw a ChangeDetectionError
      // without the extra information.
      error = new ChangeDetectionError(null, exception, stack, null);
    }
    throw error;
  }

  throwOnChangeError(oldValue: any, newValue: any): void {
    throw new ExpressionChangedAfterItHasBeenCheckedException(this._currentBinding().debug,
                                                              oldValue, newValue, null);
  }

  throwDehydratedError(): void { throw new DehydratedException(); }

  private _currentBinding(): BindingTarget {
    return this.bindingTargets[this.propertyBindingIndex];
  }
}
