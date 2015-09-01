import {isPresent, isBlank, BaseException, StringWrapper} from 'angular2/src/core/facade/lang';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {ChangeDetectionUtil} from './change_detection_util';
import {ChangeDetectorRef} from './change_detector_ref';
import {DirectiveIndex} from './directive_record';
import {ChangeDetector, ChangeDispatcher} from './interfaces';
import {Pipes} from './pipes';
import {
  ChangeDetectionError,
  ExpressionChangedAfterItHasBeenCheckedException,
  DehydratedException
} from './exceptions';
import {BindingTarget} from './binding_record';
import {Locals} from './parser/locals';
import {ChangeDetectionStrategy} from './constants';
import {wtfCreateScope, wtfLeave, WtfScopeFn} from '../profile/profile';
import {isObservable} from './observable_facade';


var _scope_check: WtfScopeFn = wtfCreateScope(`ChangeDetector#check(ascii id, bool throwOnChange)`);

class _Context {
  constructor(public element: any, public componentElement: any, public context: any,
              public locals: any, public injector: any, public expression: any) {}
}

export class AbstractChangeDetector<T> implements ChangeDetector {
  lightDomChildren: any[] = [];
  shadowDomChildren: any[] = [];
  parent: ChangeDetector;
  ref: ChangeDetectorRef;

  // The names of the below fields must be kept in sync with codegen_name_util.ts or
  // change detection will fail.
  alreadyChecked: any = false;
  context: T;
  locals: Locals = null;
  mode: ChangeDetectionStrategy = null;
  pipes: Pipes = null;
  propertyBindingIndex: number;

  // This is an experimental feature. Works only in Dart.
  subscriptions: any[];
  streams: any[];

  constructor(public id: string, public dispatcher: ChangeDispatcher,
              public numberOfPropertyProtoRecords: number, public bindingTargets: BindingTarget[],
              public directiveIndices: DirectiveIndex[], public strategy: ChangeDetectionStrategy) {
    this.ref = new ChangeDetectorRef(this);
  }

  addChild(cd: ChangeDetector): void {
    this.lightDomChildren.push(cd);
    cd.parent = this;
  }

  removeChild(cd: ChangeDetector): void { ListWrapper.remove(this.lightDomChildren, cd); }

  addShadowDomChild(cd: ChangeDetector): void {
    this.shadowDomChildren.push(cd);
    cd.parent = this;
  }

  removeShadowDomChild(cd: ChangeDetector): void { ListWrapper.remove(this.shadowDomChildren, cd); }

  remove(): void { this.parent.removeChild(this); }

  handleEvent(eventName: string, elIndex: number, locals: Locals): boolean {
    var res = this.handleEventInternal(eventName, elIndex, locals);
    this.markPathToRootAsCheckOnce();
    return res;
  }

  handleEventInternal(eventName: string, elIndex: number, locals: Locals): boolean { return false; }

  detectChanges(): void { this.runDetectChanges(false); }

  checkNoChanges(): void { throw new BaseException("Not implemented"); }

  runDetectChanges(throwOnChange: boolean): void {
    if (this.mode === ChangeDetectionStrategy.Detached ||
        this.mode === ChangeDetectionStrategy.Checked)
      return;
    var s = _scope_check(this.id, throwOnChange);

    this.detectChangesInRecords(throwOnChange);

    this._detectChangesInLightDomChildren(throwOnChange);
    if (!throwOnChange) this.afterContentLifecycleCallbacks();

    this._detectChangesInShadowDomChildren(throwOnChange);
    if (!throwOnChange) this.afterViewLifecycleCallbacks();

    if (this.mode === ChangeDetectionStrategy.CheckOnce)
      this.mode = ChangeDetectionStrategy.Checked;

    this.alreadyChecked = true;
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
  hydrate(context: T, locals: Locals, directives: any, pipes: any): void {
    this.mode = ChangeDetectionUtil.changeDetectionMode(this.strategy);
    this.context = context;

    if (this.strategy === ChangeDetectionStrategy.OnPushObserve) {
      this.observeComponent(context);
    }

    this.locals = locals;
    this.pipes = pipes;
    this.hydrateDirectives(directives);
    this.alreadyChecked = false;
  }

  // Subclasses should override this method to hydrate any directives.
  hydrateDirectives(directives: any): void {}

  // This method is not intended to be overridden. Subclasses should instead provide an
  // implementation of `dehydrateDirectives`.
  dehydrate(): void {
    this.dehydrateDirectives(true);

    // This is an experimental feature. Works only in Dart.
    if (this.strategy === ChangeDetectionStrategy.OnPushObserve) {
      this._unsubsribeFromObservables();
    }

    this.context = null;
    this.locals = null;
    this.pipes = null;
  }

  // Subclasses should override this method to dehydrate any directives. This method should reverse
  // any work done in `hydrateDirectives`.
  dehydrateDirectives(destroyPipes: boolean): void {}

  hydrated(): boolean { return this.context !== null; }

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

  _detectChangesInLightDomChildren(throwOnChange: boolean): void {
    var c = this.lightDomChildren;
    for (var i = 0; i < c.length; ++i) {
      c[i].runDetectChanges(throwOnChange);
    }
  }

  _detectChangesInShadowDomChildren(throwOnChange: boolean): void {
    var c = this.shadowDomChildren;
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

  // This is an experimental feature. Works only in Dart.
  protected observeValue(value: any, index: number): any {
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
  protected observeDirective(value: any, index: number): any {
    if (isObservable(value)) {
      this._createArrayToStoreObservables();
      var arrayIndex = this.numberOfPropertyProtoRecords + index + 2;  // +1 is component
      this.streams[arrayIndex] = value.changes;
      this.subscriptions[arrayIndex] = value.changes.listen((_) => this.ref.markForCheck());
    }
    return value;
  }

  // This is an experimental feature. Works only in Dart.
  protected observeComponent(value: any): any {
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

  protected getDirectiveFor(directives: any, index: number): any {
    return directives.getDirectiveFor(this.directiveIndices[index]);
  }

  protected getDetectorFor(directives: any, index: number): ChangeDetector {
    return directives.getDetectorFor(this.directiveIndices[index]);
  }

  protected notifyDispatcher(value: any): void {
    this.dispatcher.notifyOnBinding(this._currentBinding(), value);
  }

  protected logBindingUpdate(value: any): void {
    this.dispatcher.logBindingUpdate(this._currentBinding(), value);
  }

  protected addChange(changes: StringMap<string, any>, oldValue: any,
                      newValue: any): StringMap<string, any> {
    if (isBlank(changes)) {
      changes = {};
    }
    changes[this._currentBinding().name] = ChangeDetectionUtil.simpleChange(oldValue, newValue);
    return changes;
  }

  private _throwError(exception: any, stack: any): void {
    var c = this.dispatcher.getDebugContext(this._currentBinding().elementIndex, null);
    var context = isPresent(c) ? new _Context(c.element, c.componentElement, c.context, c.locals,
                                              c.injector, this._currentBinding().debug) :
                                 null;
    throw new ChangeDetectionError(this._currentBinding().debug, exception, stack, context);
  }

  protected throwOnChangeError(oldValue: any, newValue: any): void {
    throw new ExpressionChangedAfterItHasBeenCheckedException(this._currentBinding().debug,
                                                              oldValue, newValue, null);
  }

  protected throwDehydratedError(): void { throw new DehydratedException(); }

  private _currentBinding(): BindingTarget {
    return this.bindingTargets[this.propertyBindingIndex];
  }
}
