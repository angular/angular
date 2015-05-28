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

  constructor({textNodeIndices, contentTagSelector, nestedProtoView, componentId, eventLocals,
               localEvents, globalEvents, hostActions, parentIndex, distanceToParent,
               propertySetters}: {
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
    hostActions?: Map<string, AST>
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

export class HostAction {
  actionName: string;
  actionExpression: string;
  expression: AST;

  constructor(actionName: string, actionExpression: string, expression: AST) {
    this.actionName = actionName;
    this.actionExpression = actionExpression;
    this.expression = expression;
  }
}
