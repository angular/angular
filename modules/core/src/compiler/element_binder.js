import {ProtoElementInjector} from './element_injector';
import {FIELD} from 'facade/lang';
// Comment out as dartanalyzer does not look into @FIELD
// import {List} from 'facade/collection';
// import {ProtoView} from './view';

export class ElementBinder {
  @FIELD('final protoElementInjector:ProtoElementInjector')
  @FIELD('final textNodeIndices:List<int>')
  @FIELD('hasElementPropertyBindings:bool')
  @FIELD('nestedProtoView:ProtoView')
  constructor(protoElementInjector: ProtoElementInjector) {
    this.protoElementInjector = protoElementInjector;
    // updated later when text nodes are bound
    this.textNodeIndices = [];
    // updated later when element properties are bound
    this.hasElementPropertyBindings = false;
    // updated later, so we are able to resolve cycles
    this.nestedProtoView = null;
  }
}
