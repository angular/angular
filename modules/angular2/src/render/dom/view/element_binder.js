import {AST} from 'angular2/change_detection';
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

  constructor({
    textNodeIndices,
    contentTagSelector,
    nestedProtoView,
    componentId,
    eventLocals,
    eventNames,
    parentIndex,
    distanceToParent
  }) {
    this.textNodeIndices = textNodeIndices;
    this.contentTagSelector = contentTagSelector;
    this.nestedProtoView = nestedProtoView;
    this.componentId = componentId;
    this.eventLocals = eventLocals;
    this.eventNames = eventNames;
    this.parentIndex = parentIndex;
    this.distanceToParent = distanceToParent;
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
      // Don't clone as we assume immutability!
      textNodeIndices: this.textNodeIndices,
      contentTagSelector: this.contentTagSelector,
      nestedProtoView: nestedProtoView,
      componentId: this.componentId,
      // Don't clone as we assume immutability!
      eventLocals: this.eventLocals,
      eventNames: this.eventNames,
      distanceToParent: this.distanceToParent
    });
  }
}
