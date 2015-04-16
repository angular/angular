import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {AST} from 'angular2/change_detection';
import {SetterFn} from 'angular2/src/reflection/types';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import * as protoViewModule from './proto_view';

export class ElementBinder {
  contentTagSelector: string;
  textNodeIndices: List<number>;
  nestedProtoView: protoViewModule.RenderProtoView;
  eventLocals: AST;
  localEvents: List<Event>;
  globalEvents: List<Event>;
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
    localEvents,
    globalEvents,
    parentIndex,
    distanceToParent,
    propertySetters
  } = {}) {
    this.textNodeIndices = textNodeIndices;
    this.contentTagSelector = contentTagSelector;
    this.nestedProtoView = nestedProtoView;
    this.componentId = componentId;
    this.eventLocals = eventLocals;
    this.localEvents = localEvents;
    this.globalEvents = globalEvents;
    this.parentIndex = parentIndex;
    this.distanceToParent = distanceToParent;
    this.propertySetters = propertySetters;
  }

  hasStaticComponent() {
    return isPresent(this.componentId) && isPresent(this.nestedProtoView);
  }

  hasDynamicComponent() {
    return isPresent(this.componentId) && isBlank(this.nestedProtoView);
  }
}

export class Event {
  name: string;
  target: string;
  fullName: string;

  constructor(name: string, target: string, fullName: string) {
    this.name = name;
    this.target = target;
    this.fullName = fullName;
  }
}
