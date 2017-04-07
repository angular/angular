import {DebugElement} from './debug_element';
import {DebugNode, Predicate} from './debug_node';

export type DebuggableNode = DebugElement | DebugNode;

export class Query {
  static queryElementChildren(
      element: DebugElement, predicate: Predicate<DebugElement>, matches: DebugElement[]) {
    element.childNodes.forEach((node: DebuggableNode) => {
      if (node instanceof DebugElement) {
        if (predicate(node)) {
          matches.push(node);
        }
        Query.queryElementChildren(node, predicate, matches);
      }
    });
  }

  static queryNodeChildren(
      parentNode: DebuggableNode, predicate: Predicate<DebugNode>, matches: DebugNode[]) {
    if (parentNode instanceof DebugElement) {
      parentNode.childNodes.forEach((node: DebuggableNode) => {
        if (predicate(node)) {
          matches.push(node);
        }
        if (node instanceof DebugElement) {
          Query.queryNodeChildren(node, predicate, matches);
        }
      });
    }
  }
}
