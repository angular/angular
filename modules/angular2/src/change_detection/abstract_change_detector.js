import {isPresent} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {BindingPropagationConfig} from './binding_propagation_config';
import {ChangeDetector} from './interfaces';
import {CHECK_ALWAYS, CHECK_ONCE, CHECKED, DETACHED, ON_PUSH} from './constants';

export class AbstractChangeDetector extends ChangeDetector {
  lightDomChildren:List;
  shadowDomChildren:List;
  parent:ChangeDetector;
  mode:string;
  bindingPropagationConfig:BindingPropagationConfig;

  constructor() {
    super();
    this.lightDomChildren = [];
    this.shadowDomChildren = [];
    this.bindingPropagationConfig = new BindingPropagationConfig(this);
    this.mode = null;
  }

  addChild(cd:ChangeDetector) {
    ListWrapper.push(this.lightDomChildren, cd);
    cd.parent = this;
  }

  removeChild(cd:ChangeDetector) {
    ListWrapper.remove(this.lightDomChildren, cd);
  }

  addShadowDomChild(cd:ChangeDetector) {
    ListWrapper.push(this.shadowDomChildren, cd);
    cd.parent = this;
  }

  remove() {
    this.parent.removeChild(this);
  }

  detectChanges() {
    this._detectChanges(false);
  }

  checkNoChanges() {
    this._detectChanges(true);
  }

  _detectChanges(throwOnChange:boolean) {
    if (this.mode === DETACHED || this.mode === CHECKED) return;

    this.detectChangesInRecords(throwOnChange);

    this._detectChangesInLightDomChildren(throwOnChange);

    this.callOnAllChangesDone();

    this._detectChangesInShadowDomChildren(throwOnChange);

    if (this.mode === CHECK_ONCE) this.mode = CHECKED;
  }

  detectChangesInRecords(throwOnChange:boolean){}
  callOnAllChangesDone(){}

  _detectChangesInLightDomChildren(throwOnChange:boolean) {
    var c = this.lightDomChildren;
    for(var i = 0; i < c.length; ++i) {
      c[i]._detectChanges(throwOnChange);
    }
  }

  _detectChangesInShadowDomChildren(throwOnChange:boolean) {
    var c = this.shadowDomChildren;
    for(var i = 0; i < c.length; ++i) {
      c[i]._detectChanges(throwOnChange);
    }
  }

  markPathToRootAsCheckOnce() {
    var c = this;
    while(isPresent(c) && c.mode != DETACHED) {
      if (c.mode === CHECKED) c.mode = CHECK_ONCE;
      c = c.parent;
    }
  }
}
