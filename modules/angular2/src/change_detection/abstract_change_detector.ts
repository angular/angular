import {isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {ChangeDetectorRef} from './change_detector_ref';
import {ChangeDetector} from './interfaces';
import {CHECK_ALWAYS, CHECK_ONCE, CHECKED, DETACHED, ON_PUSH} from './constants';

export class AbstractChangeDetector extends ChangeDetector {
  lightDomChildren: List<any>;
  shadowDomChildren: List<any>;
  parent: ChangeDetector;
  mode: string;
  ref: ChangeDetectorRef;

  constructor() {
    super();
    this.lightDomChildren = [];
    this.shadowDomChildren = [];
    this.ref = new ChangeDetectorRef(this);
    this.mode = null;
  }

  addChild(cd: ChangeDetector) {
    ListWrapper.push(this.lightDomChildren, cd);
    cd.parent = this;
  }

  removeChild(cd: ChangeDetector) { ListWrapper.remove(this.lightDomChildren, cd); }

  addShadowDomChild(cd: ChangeDetector) {
    ListWrapper.push(this.shadowDomChildren, cd);
    cd.parent = this;
  }

  removeShadowDomChild(cd: ChangeDetector) { ListWrapper.remove(this.shadowDomChildren, cd); }

  remove() { this.parent.removeChild(this); }

  detectChanges() { this._detectChanges(false); }

  checkNoChanges() { this._detectChanges(true); }

  _detectChanges(throwOnChange: boolean) {
    if (this.mode === DETACHED || this.mode === CHECKED) return;

    this.detectChangesInRecords(throwOnChange);

    this._detectChangesInLightDomChildren(throwOnChange);

    if (throwOnChange === false) this.callOnAllChangesDone();

    this._detectChangesInShadowDomChildren(throwOnChange);

    if (this.mode === CHECK_ONCE) this.mode = CHECKED;
  }

  detectChangesInRecords(throwOnChange: boolean) {}
  callOnAllChangesDone() {}

  _detectChangesInLightDomChildren(throwOnChange: boolean) {
    var c = this.lightDomChildren;
    for (var i = 0; i < c.length; ++i) {
      c[i]._detectChanges(throwOnChange);
    }
  }

  _detectChangesInShadowDomChildren(throwOnChange: boolean) {
    var c = this.shadowDomChildren;
    for (var i = 0; i < c.length; ++i) {
      c[i]._detectChanges(throwOnChange);
    }
  }

  markAsCheckOnce() { this.mode = CHECK_ONCE; }

  markPathToRootAsCheckOnce() {
    var c: ChangeDetector = this;
    while (isPresent(c) && c.mode != DETACHED) {
      if (c.mode === CHECKED) c.mode = CHECK_ONCE;
      c = c.parent;
    }
  }
}
