/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentTreeNode} from '../interfaces';
import {isCustomElement} from '../utils';

const extractViewTree =
    (domNode: Node|Element, result: ComponentTreeNode[], getComponent: (element: Element) => {},
     getDirectives: (node: Node) => {}[]): ComponentTreeNode[] => {
      const directives = getDirectives(domNode);
      if (!directives.length && !(domNode instanceof Element)) {
        return result;
      }
      const componentTreeNode: ComponentTreeNode = {
        children: [],
        component: null,
        directives: directives.map((dir) => {
          return {
            instance: dir,
            name: dir.constructor.name,
          };
        }),
        element: domNode.nodeName.toLowerCase(),
        nativeElement: domNode,
      };
      if (!(domNode instanceof Element)) {
        result.push(componentTreeNode);
        return result;
      }
      const component = getComponent(domNode);
      if (component) {
        componentTreeNode.component = {
          instance: component,
          isElement: isCustomElement(domNode),
          name: domNode.nodeName.toLowerCase(),
        };
      }
      if (component || componentTreeNode.directives.length) {
        result.push(componentTreeNode);
      }
      if (componentTreeNode.component || componentTreeNode.directives.length) {
        domNode.childNodes.forEach(
            (node) =>
                extractViewTree(node, componentTreeNode.children, getComponent, getDirectives));
      } else {
        domNode.childNodes.forEach(
            (node) => extractViewTree(node, result, getComponent, getDirectives));
      }
      return result;
    };

export class RTreeStrategy {
  supports(_: any): boolean {
    return ['getDirectiveMetadata', 'getComponent', 'getDirectives'].every(
        (method) => typeof (window as any).ng[method] === 'function');
  }

  build(element: Element): ComponentTreeNode[] {
    // We want to start from the root element so that we can find components which are attached to
    // the application ref and which host elements have been inserted with DOM APIs.
    while (element.parentElement) {
      element = element.parentElement;
    }
    const getComponent = (window as any).ng.getComponent as (element: Element) => {};
    const getDirectives = (window as any).ng.getDirectives as (node: Node) => {}[];
    const result = extractViewTree(element, [], getComponent, getDirectives);
    return result;
  }
}
