import {global} from 'angular2/src/facade/lang';

/**
 * Stores error information; delivered via [NgZone.onError] stream.
 */
export class NgZoneError {
  constructor(public error: any, public stackTrace: any) {}
}


export class NgZoneImpl implements ZoneSpec {
  static isInAngularZone(): boolean { return Zone.current.get('isAngularZone') === true; }

  public name: string = 'angular';
  public properties: {[k: string]: string} = <any>{'isAngularZone': true};

  private outer: Zone;
  private inner: Zone;

  private onEnter: () => void;
  private onLeave: () => void;
  private setMicrotask: (hasMicrotasks: boolean) => void;
  private setMacrotask: (hasMacrotasks: boolean) => void;
  private onError: (error: NgZoneError) => void;

  constructor({trace, onEnter, onLeave, setMicrotask, setMacrotask, onError}: {
    trace: boolean,
    onEnter: () => void,
    onLeave: () => void,
    setMicrotask: (hasMicrotasks: boolean) => void,
    setMacrotask: (hasMacrotasks: boolean) => void,
    onError: (error: NgZoneError) => void
  }) {
    this.onEnter = onEnter;
    this.onLeave = onLeave;
    this.setMicrotask = setMicrotask;
    this.setMacrotask = setMacrotask;
    this.onError = onError;

    if (global.Zone) {
      this.outer = this.inner = Zone.current;
      if (Zone['wtfZoneSpec']) {
        this.inner = this.inner.fork(Zone['wtfZoneSpec']);
      }
      if (trace) {
        this.inner = this.inner.fork(Zone['longStackTraceZoneSpec']);
      }
      this.inner = this.inner.fork(this);
    } else {
      throw new Error('Angular2 needs to be run with Zone.js polyfill.');
    }
  }

  onInvokeTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task, applyThis: any,
               applyArgs: any): any {
    try {
      this.onEnter();
      return delegate.invokeTask(target, task, applyThis, applyArgs);
    } finally {
      this.onLeave();
    }
  };


  onInvoke(delegate: ZoneDelegate, current: Zone, target: Zone, callback: Function, applyThis: any,
           applyArgs: any[], source: string): any {
    try {
      this.onEnter();
      return delegate.invoke(target, callback, applyThis, applyArgs, source);
    } finally {
      this.onLeave();
    }
  }

  onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) {
    delegate.hasTask(target, hasTaskState);
    if (current == target) {
      // We are only interested in hasTask events which originate from our zone
      // (A child hasTask event is not interesting to us)
      if (hasTaskState.change == 'microTask') {
        this.setMicrotask(hasTaskState.microTask);
      } else if (hasTaskState.change == 'macroTask') {
        this.setMacrotask(hasTaskState.macroTask);
      }
    }
  }

  onHandleError(delegate: ZoneDelegate, current: Zone, target: Zone, error: any): boolean {
    delegate.handleError(target, error);
    this.onError(new NgZoneError(error, error.stack));
    return false;
  }

  runInner(fn: () => any): any { return this.inner.runGuarded(fn); };
  runOuter(fn: () => any): any { return this.outer.run(fn); };
}
