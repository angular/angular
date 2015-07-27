import {isPresent, BaseException} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {ChangeDetectorRef} from './change_detector_ref';
import {ChangeDetector} from './interfaces';
import {ChangeDetectionError} from './exceptions';
import {ProtoRecord} from './proto_record';
import {Locals} from './parser/locals';
import {CHECK_ALWAYS, CHECK_ONCE, CHECKED, DETACHED, ON_PUSH} from './constants';

class _Context {
  constructor(public element: any, public componentElement: any, public instance: any,
              public context: any, public locals: any, public injector: any,
              public expression: any) {}
}

export class AbstractChangeDetector implements ChangeDetector {
  lightDomChildren: List<any> = [];
  shadowDomChildren: List<any> = [];
  parent: ChangeDetector;
  mode: string = null;
  ref: ChangeDetectorRef;

  constructor(public id: string, public dispatcher: any) { this.ref = new ChangeDetectorRef(this); }

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

  detectChanges(): void { this.runDetectChanges(false); }

  checkNoChanges(): void { throw new BaseException("Not implemented"); }

  runDetectChanges(throwOnChange: boolean): void {
    if (this.mode === DETACHED || this.mode === CHECKED) return;

    this.detectChangesInRecords(throwOnChange);

    this._detectChangesInLightDomChildren(throwOnChange);

    if (throwOnChange === false) this.callOnAllChangesDone();

    this._detectChangesInShadowDomChildren(throwOnChange);

    if (this.mode === CHECK_ONCE) this.mode = CHECKED;
  }

  detectChangesInRecords(throwOnChange: boolean): void {}

  hydrate(context: any, locals: Locals, directives: any, pipes: any): void {}

  dehydrate(): void {}

  callOnAllChangesDone(): void {}

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

  markAsCheckOnce(): void { this.mode = CHECK_ONCE; }

  markPathToRootAsCheckOnce(): void {
    var c: ChangeDetector = this;
    while (isPresent(c) && c.mode != DETACHED) {
      if (c.mode === CHECKED) c.mode = CHECK_ONCE;
      c = c.parent;
    }
  }

  throwError(proto: ProtoRecord, exception: any, stack: any): void {
    var c = this.dispatcher.getDebugContext(proto.bindingRecord.elementIndex, proto.directiveIndex);
    var context = new _Context(c["element"], c["componentElement"], c["directive"], c["context"],
                               c["locals"], c["injector"], proto.expressionAsString);
    throw new ChangeDetectionError(proto, exception, stack, context);
  }
}