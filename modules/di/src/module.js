import {FIELD} from 'facade/lang';
import {Type} from 'facade/lang';
import {Map, MapWrapper} from 'facade/collection';
import {Key} from './key';

/// becouse we need to know when toValue was not set.
/// (it could be that toValue is set to null or undefined in js)
var _UNDEFINED = {}

export class Module {

  @FIELD('final bindings:Map<Key, Binding>')
  constructor(){
    this.bindings = new MapWrapper();
  }

  bind(type:Type,
      {toValue/*=_UNDEFINED*/, toFactory, toImplementation, inject, toInstanceOf, withAnnotation}/*:
        {toFactory:Function, toImplementation: Type, inject: Array, toInstanceOf:Type}*/) {}

  bindByKey(key:Key,
      {toValue/*=_UNDEFINED*/, toFactory, toImplementation, inject, toInstanceOf}/*:
        {toFactory:Function, toImplementation: Type, inject: Array, toInstanceOf:Type}*/) {}

  install(module:Module) {}
}
