import {AST} from 'angular2/change_detection';
import {SetterFn} from 'angular2/src/reflection/types';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import * as protoViewModule from './proto_view';

export class ElementBinder {
  contentTagSelector: string;
  textNodeIndices: List<number>;
  nestedProtoView: protoViewModule.ProtoView;
  eventLocals: AST;
  eventNames: List<string>;
  componentId: string;
  parentIndex:number;
  distanceToParent:number;
  propertySetters: Map<string, SetterFn>;

  constructor({
    textNodeIndices,
    contentTagSelector,
    nestedProtoView,
    componentId,
    eventLocals,
    eventNames,
    parentIndex,
    distanceToParent,
    propertySetters
  }) {
    this.textNodeIndices = textNodeIndices;
    this.contentTagSelector = contentTagSelector;
    this.nestedProtoView = nestedProtoView;
    this.componentId = componentId;
    this.eventLocals = eventLocals;
    this.eventNames = eventNames;
    this.parentIndex = parentIndex;
    this.distanceToParent = distanceToParent;
    this.propertySetters = propertySetters;
  }
}
