import {List} from 'angular2/src/facade/collection';

export class ChangeRecord {
  bindingMemento:any;
  change:any;

  constructor(bindingMemento, change) {
    this.bindingMemento = bindingMemento;
    this.change = change;
  }

  //REMOVE IT
  get currentValue() {
    return this.change.currentValue;
  }

  get previousValue() {
    return this.change.previousValue;
  }
}


/**
 * CHECK_ONCE means that after calling detectChanges the mode of the change detector
 * will become CHECKED.
 */
export const CHECK_ONCE="CHECK_ONCE";

/**
 * CHECKED means that the change detector should be skipped until its mode changes to
 * CHECK_ONCE or CHECK_ALWAYS.
 */
export const CHECKED="CHECKED";

/**
 * CHECK_ALWAYS means that after calling detectChanges the mode of the change detector
 * will remain CHECK_ALWAYS.
 */
export const CHECK_ALWAYS="ALWAYS_CHECK";

/**
 * DETACHED means that the change detector sub tree is not a part of the main tree and
 * should be skipped.
 */
export const DETACHED="DETACHED";

export class ChangeDispatcher {
  onRecordChange(directiveMemento, records:List<ChangeRecord>) {}
}

export class ChangeDetector {
  parent:ChangeDetector;
  mode:string;

  addChild(cd:ChangeDetector) {}
  removeChild(cd:ChangeDetector) {}
  remove() {}
  setContext(context:any) {}
  markPathToRootAsCheckOnce() {}

  detectChanges() {}
  checkNoChanges() {}
}
