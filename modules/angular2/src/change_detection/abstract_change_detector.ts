import {isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {ChangeDetectorRef} from './change_detector_ref';
import {ChangeDetector} from './interfaces';
import {CHECK_ALWAYS, CHECK_ONCE, CHECKED, DETACHED, ON_PUSH} from './constants';

export class AbstractChangeDetector extends ChangeDetector {
  lightDomChildren: List<any> = [];
  shadowDomChildren: List<any> = [];
  parent: ChangeDetector;
  mode: string = null;
  ref: ChangeDetectorRef;

  constructor() {
    super();
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

  detectChanges(): void { this._detectChanges(false); }

  checkNoChanges(): void { this._detectChanges(true); }

  _detectChanges(throwOnChange: boolean): void {
    if (this.mode === DETACHED || this.mode === CHECKED) return;

    this.detectChangesInRecords(throwOnChange);

    this._detectChangesInLightDomChildren(throwOnChange);

    if (throwOnChange === false) this.callOnAllChangesDone();

    this._detectChangesInShadowDomChildren(throwOnChange);

    if (this.mode === CHECK_ONCE) this.mode = CHECKED;
  }

  detectChangesInRecords(throwOnChange: boolean): void {}
  callOnAllChangesDone(): void {}

  _detectChangesInLightDomChildren(throwOnChange: boolean): void {
    var c = this.lightDomChildren;
    for (var i = 0; i < c.length; ++i) {
      c[i]._detectChanges(throwOnChange);
    }
  }

  _detectChangesInShadowDomChildren(throwOnChange: boolean): void {
    var c = this.shadowDomChildren;
    for (var i = 0; i < c.length; ++i) {
      c[i]._detectChanges(throwOnChange);
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
}
