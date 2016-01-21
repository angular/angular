import {isPresent} from 'angular2/src/facade/lang';
import {Predicate} from 'angular2/src/facade/collection';
import {Injector} from 'angular2/src/core/di';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {RenderDebugInfo} from 'angular2/src/core/render/api';

export class EventListener { constructor(public name: string, public callback: Function){}; }

export class DebugNode {
  nativeNode: any;
  listeners: EventListener[];
  parent: DebugElement;
  providerTokens: any[];
  locals: Map<string, any>;
  injector: Injector;
  componentInstance: any;

  constructor(nativeNode: any, parent: DebugNode) {
    this.nativeNode = nativeNode;
    if (isPresent(parent) && parent instanceof DebugElement) {
      parent.addChild(this);
    } else {
      this.parent = null;
    }
    this.listeners = [];
    this.providerTokens = [];
  }

  setDebugInfo(info: RenderDebugInfo) {
    this.injector = info.injector;
    this.providerTokens = info.providerTokens;
    this.locals = info.locals;
    this.componentInstance = info.component;
  }

  inject(token: any): any { return this.injector.get(token); }

  getLocal(name: string): any { return this.locals.get(name); }
}

export class DebugElement extends DebugNode {
  name: string;
  properties: Map<string, any>;
  attributes: Map<string, any>;
  childNodes: DebugNode[];
  nativeElement: any;

  constructor(nativeNode: any, parent: any) {
    super(nativeNode, parent);
    this.properties = new Map<string, any>();
    this.attributes = new Map<string, any>();
    this.childNodes = [];
    this.nativeElement = nativeNode;
  }

  addChild(child: DebugNode) {
    if (isPresent(child)) {
      this.childNodes.push(child);
      child.parent = this;
    }
  }

  removeChild(child: DebugNode) {
    var childIndex = this.childNodes.indexOf(child);
    if (childIndex !== -1) {
      child.parent = null;
      this.childNodes.splice(childIndex, 1);
    }
  }

  insertChildrenAfter(child: DebugNode, newChildren: DebugNode[]) {
    var siblingIndex = this.childNodes.indexOf(child);
    if (siblingIndex !== -1) {
      var previousChildren = this.childNodes.slice(0, siblingIndex + 1);
      var nextChildren = this.childNodes.slice(siblingIndex + 1);
      this.childNodes =
          ListWrapper.concat(ListWrapper.concat(previousChildren, newChildren), nextChildren);
      for (var i = 0; i < newChildren.length; ++i) {
        var newChild = newChildren[i];
        if (isPresent(newChild.parent)) {
          newChild.parent.removeChild(newChild);
        }
        newChild.parent = this;
      }
    }
  }

  query(predicate: Predicate<DebugElement>): DebugElement {
    var results = this.queryAll(predicate);
    return results.length > 0 ? results[0] : null;
  }

  queryAll(predicate: Predicate<DebugElement>): DebugElement[] {
    var matches = [];
    _queryElementChildren(this, predicate, matches);
    return matches;
  }

  queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[] {
    var matches = [];
    _queryNodeChildren(this, predicate, matches);
    return matches;
  }

  get children(): DebugElement[] {
    var children = [];
    this.childNodes.forEach((node) => {
      if (node instanceof DebugElement) {
        children.push(node);
      }
    });
    return children;
  }

  triggerEventHandler(eventName: string, eventObj: Event) {
    this.listeners.forEach((listener) => {
      if (listener.name == eventName) {
        listener.callback(eventObj);
      }
    });
  }
}

export function asNativeElements(debugEls: DebugElement[]): any {
  return debugEls.map((el) => el.nativeElement);
}

function _queryElementChildren(element: DebugElement, predicate: Predicate<DebugElement>,
                               matches: DebugElement[]) {
  element.childNodes.forEach(node => {
    if (node instanceof DebugElement) {
      if (predicate(node)) {
        matches.push(node);
      }
      _queryElementChildren(node, predicate, matches);
    }
  });
}

function _queryNodeChildren(parentNode: DebugNode, predicate: Predicate<DebugNode>,
                            matches: DebugNode[]) {
  if (parentNode instanceof DebugElement) {
    parentNode.childNodes.forEach(node => {
      if (predicate(node)) {
        matches.push(node);
      }
      if (node instanceof DebugElement) {
        _queryNodeChildren(node, predicate, matches);
      }
    });
  }
}

// Need to keep the nodes in a global Map so that multiple angular apps are supported.
var _nativeNodeToDebugNode = new Map<any, DebugNode>();

export function getDebugNode(nativeNode: any): DebugNode {
  return _nativeNodeToDebugNode.get(nativeNode);
}

export function getAllDebugNodes(): DebugNode[] {
  return MapWrapper.values(_nativeNodeToDebugNode);
}

export function indexDebugNode(node: DebugNode) {
  _nativeNodeToDebugNode.set(node.nativeNode, node);
}

export function removeDebugNodeFromIndex(node: DebugNode) {
  _nativeNodeToDebugNode.delete(node.nativeNode);
}
