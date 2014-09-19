import {Module} from 'di/di';
import {TemplateElement} from 'facade/dom';

export class ProtoView {
  @FIELD('final _template:TemplateElement')
  @FIELD('final _module:Module')
  @FIELD('final _protoElementInjectors:List<ProtoElementInjector>')
  @FIELD('final _protoWatchGroup:ProtoWatchGroup')
  @CONST constructor() { }
}