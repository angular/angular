import {DebugContext} from '../view/index';

import {DebugNode, Predicate} from './debug_node';
import {DebugElementInterface} from './interfaces';
import {DebuggableNode, Query} from './query';



/**
 * @experimental All debugging apis are currently experimental.
 */
export class DebugElement extends DebugNode implements DebugElementInterface {
  name: string;
  properties: {[key: string]: any};
  attributes: {[key: string]: string | null};
  classes: {[key: string]: boolean};
  styles: {[key: string]: string | null};
  childNodes: DebuggableNode[];
  nativeElement: any;

  constructor(nativeNode: any, parent: any, _debugContext: DebugContext) {
    super(nativeNode, parent, _debugContext);
    this.properties = {};
    this.attributes = {};
    this.classes = {};
    this.styles = {};
    this.childNodes = [];
    this.nativeElement = nativeNode;
  }

  addChild(child: DebugNode) {
    if (child) {
      this.childNodes.push(child);
      child.parent = this;
    }
  }

  removeChild(child: DebugNode) {
    const childIndex = this.childNodes.indexOf(child);
    if (childIndex !== -1) {
      child.parent = null;
      this.childNodes.splice(childIndex, 1);
    }
  }

  insertChildrenAfter(child: DebugNode, newChildren: DebugNode[]) {
    const siblingIndex = this.childNodes.indexOf(child);
    if (siblingIndex !== -1) {
      this.childNodes.splice(siblingIndex + 1, 0, ...newChildren);
      newChildren.forEach(c => {
        if (c.parent) {
          c.parent.removeChild(c);
        }
        c.parent = this;
      });
    }
  }

  insertBefore(refChild: DebugNode, newChild: DebugNode): void {
    const refIndex = this.childNodes.indexOf(refChild);
    if (refIndex === -1) {
      this.addChild(newChild);
    } else {
      if (newChild.parent) {
        newChild.parent.removeChild(newChild);
      }
      newChild.parent = this;
      this.childNodes.splice(refIndex, 0, newChild);
    }
  }

  query(predicate: Predicate<DebugElement>): DebugElement {
    const results = this.queryAll(predicate);
    return results[0] || null;
  }

  queryAll(predicate: Predicate<DebugElement>): DebugElement[] {
    const matches: DebugElement[] = [];
    Query.queryElementChildren(this, predicate, matches);
    return matches;
  }

  queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[] {
    const matches: DebugNode[] = [];
    Query.queryNodeChildren(this, predicate, matches);
    return matches;
  }

  get children(): DebugElement[] {
    return this.childNodes.filter((node) => node instanceof DebugElement) as DebugElement[];
  }

  triggerEventHandler(eventName: string, eventObj: any) {
    this.listeners.forEach((listener) => {
      if (listener.name == eventName) {
        listener.callback(eventObj);
      }
    });
  }
}
