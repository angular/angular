import {List} from 'angular2/src/facade/collection';
import {Locals} from './parser/locals';
import {AST} from './parser/ast';

export class ProtoChangeDetector  {
  addAst(ast:AST, bindingMemento:any, directiveMemento:any = null){}
  instantiate(dispatcher:any, bindingRecords:List, variableBindings:List, directiveMemento:List):ChangeDetector{
    return null;
  }
}

export class ChangeDetection {
  createProtoChangeDetector(name:string, changeControlStrategy:string):ProtoChangeDetector{
    return null;
  }
}

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
  onRecordChange(directiveMemento, records:List<ChangeRecord>) {}
}

export class ChangeDetector {
  parent:ChangeDetector;
  mode:string;

  addChild(cd:ChangeDetector) {}
  removeChild(cd:ChangeDetector) {}
  remove() {}
  hydrate(context:any, locals:Locals) {}
  dehydrate() {}
  markPathToRootAsCheckOnce() {}

  detectChanges() {}
  checkNoChanges() {}
}
