import {AST} from 'angular2/change_detection';
import {SetterFn} from 'angular2/src/reflection/types';
import {isPresent, isBlank, BaseException} from 'angular2/src/facade/lang';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import * as protoViewModule from './proto_view';

/**
 * Note: Code that uses this class assumes that is immutable!
 */
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

  mergeChildComponentProtoViews(protoViews:List<protoViewModule.ProtoView>, target:List<protoViewModule.ProtoView>):ElementBinder {
    var nestedProtoView;
    if (isPresent(this.componentId)) {
      nestedProtoView = ListWrapper.removeAt(protoViews, 0);
    } else if (isPresent(this.nestedProtoView)) {
      nestedProtoView = this.nestedProtoView.mergeChildComponentProtoViews(protoViews, target);
    }
    return new ElementBinder({
      parentIndex: this.parentIndex,
      textNodeIndices: this.textNodeIndices,
      contentTagSelector: this.contentTagSelector,
      nestedProtoView: nestedProtoView,
      componentId: this.componentId,
      eventLocals: this.eventLocals,
      eventNames: this.eventNames,
      distanceToParent: this.distanceToParent,
      propertySetters: this.propertySetters
    });
  }
}
