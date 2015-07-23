import {AST} from 'angular2/change_detection';
import {List, ListWrapper} from 'angular2/src/facade/collection';

export class DomElementBinder {
  textNodeIndices: List<number>;
  hasNestedProtoView: boolean;
  eventLocals: AST;
  localEvents: List<Event>;
  globalEvents: List<Event>;
  hasNativeShadowRoot: boolean;

  constructor({textNodeIndices, hasNestedProtoView, eventLocals, localEvents, globalEvents,
               hasNativeShadowRoot}: {
    textNodeIndices?: List<number>,
    hasNestedProtoView?: boolean,
    eventLocals?: AST,
    localEvents?: List<Event>,
    globalEvents?: List<Event>,
    hasNativeShadowRoot?: boolean
  } = {}) {
    this.textNodeIndices = textNodeIndices;
    this.hasNestedProtoView = hasNestedProtoView;
    this.eventLocals = eventLocals;
    this.localEvents = localEvents;
    this.globalEvents = globalEvents;
    this.hasNativeShadowRoot = hasNativeShadowRoot;
  }
}

export class Event {
  constructor(public name: string, public target: string, public fullName: string) {}
}

export class HostAction {
  constructor(public actionName: string, public actionExpression: string, public expression: AST) {}
}
