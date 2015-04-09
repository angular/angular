import {List} from 'angular2/src/facade/collection';
import {Locals} from './parser/locals';
import {DEFAULT} from './constants';
import {BindingRecord} from './binding_record';

export class ProtoChangeDetector  {
  instantiate(dispatcher:any, bindingRecords:List, variableBindings:List, directiveRecords:List):ChangeDetector{
    return null;
  }
}

export class ChangeDetection {
  createProtoChangeDetector(name:string, changeControlStrategy:string=DEFAULT):ProtoChangeDetector{
    return null;
  }
}

export class ChangeDispatcher {
  notifyOnBinding(bindingRecord:BindingRecord, value:any) {}
}

export class ChangeDetector {
  parent:ChangeDetector;
  mode:string;

  addChild(cd:ChangeDetector) {}
  addShadowDomChild(cd:ChangeDetector) {}
  removeChild(cd:ChangeDetector) {}
  remove() {}
  hydrate(context:any, locals:Locals, directives:any) {}
  dehydrate() {}
  markPathToRootAsCheckOnce() {}

  detectChanges() {}
  checkNoChanges() {}
}
