import {ProtoElementInjector} from './element_injector';
import {FIELD} from 'facade/lang';
import {List} from 'facade/collection';

export class ElementBinder {
  @FIELD('final protoElementInjector:ProtoElementInjector')
  @FIELD('final textNodeIndices:List<int>')
  @FIELD('final hasElementPropertyBindings:bool')
  constructor(protoElementInjector: ProtoElementInjector,
      textNodeIndices:List, hasElementPropertyBindings:boolean) {
    this.protoElementInjector = protoElementInjector;  
    this.textNodeIndices = textNodeIndices;
    this.hasElementPropertyBindings = hasElementPropertyBindings;
  }
}
