import {List, ListWrapper} from 'facade/src/collection';
import {ChangeDetector} from './interfaces';

export class AbstractChangeDetector extends ChangeDetector {
  children:List;
  parent:ChangeDetector;

  constructor() {
    this.children = [];
  }

  addChild(cd:ChangeDetector) {
    ListWrapper.push(this.children, cd);
    cd.parent = this;
  }

  removeChild(cd:ChangeDetector) {
    ListWrapper.remove(this.children, cd);
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
    this.detectChangesInRecords(throwOnChange);
    this._detectChangesInChildren(throwOnChange);
  }

  detectChangesInRecords(throwOnChange:boolean){}

  _detectChangesInChildren(throwOnChange:boolean) {
    var children = this.children;
    for(var i = 0; i < children.length; ++i) {
      children[i]._detectChanges(throwOnChange);
    }
  }
}
