import {AST} from 'angular2/change_detection';
import {SetterFn} from 'angular2/src/reflection/types';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import * as protoViewModule from './proto_view';

export class ElementBinder {
  contentTagSelector: string;
  textNodeIndices: List<number>;
  nestedProtoView: protoViewModule.DomProtoView;
  eventLocals: AST;
  localEvents: List<Event>;
  globalEvents: List<Event>;
  componentId: string;
  parentIndex: number;
  distanceToParent: number;
  propertySetters: Map<string, SetterFn>;
  hostActions: Map<string, AST>;
  elementIsEmpty: boolean;

  constructor({textNodeIndices, contentTagSelector, nestedProtoView, componentId, eventLocals,
               localEvents, globalEvents, hostActions, parentIndex, distanceToParent,
               propertySetters, elementIsEmpty}: {
    contentTagSelector?: string,
    textNodeIndices?: List<number>,
    nestedProtoView?: protoViewModule.DomProtoView,
    eventLocals?: AST,
    localEvents?: List<Event>,
    globalEvents?: List<Event>,
    componentId?: string,
    parentIndex?: number,
    distanceToParent?: number,
    propertySetters?: Map<string, SetterFn>,
    hostActions?: Map<string, AST>,
    elementIsEmpty?: boolean
  } = {}) {
    this.textNodeIndices = textNodeIndices;
    this.contentTagSelector = contentTagSelector;
    this.nestedProtoView = nestedProtoView;
    this.componentId = componentId;
    this.eventLocals = eventLocals;
    this.localEvents = localEvents;
    this.globalEvents = globalEvents;
    this.hostActions = hostActions;
    this.parentIndex = parentIndex;
    this.distanceToParent = distanceToParent;
    this.propertySetters = propertySetters;
    this.elementIsEmpty = elementIsEmpty;
  }
}

export class Event {
  constructor(public name: string, public target: string, public fullName: string) {}
}

export class HostAction {
  constructor(public actionName: string, public actionExpression: string, public expression: AST) {}
}
