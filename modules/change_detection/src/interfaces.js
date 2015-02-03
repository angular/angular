import {List} from 'facade/src/collection';

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

export class ChangeDispatcher {
  onRecordChange(groupMemento, records:List<ChangeRecord>) {}
}

export class ChangeDetector {
  parent:ChangeDetector;

  addChild(cd:ChangeDetector) {}
  removeChild(cd:ChangeDetector) {}
  remove() {}
  setContext(context:any) {}

  detectChanges() {}
  checkNoChanges() {}
}
