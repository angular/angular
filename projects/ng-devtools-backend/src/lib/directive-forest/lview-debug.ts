import { DebugNode as ngDebugNode, DebugElement as ngDebugElement } from '@angular/core';
import { ComponentInstanceType, DirectiveInstanceType, ComponentTreeNode } from '../component-tree';
import { getDirectiveName } from '../highlighter';
import { isCustomElement } from '../utils';

interface DebugNode extends ngDebugNode {
  isHost: boolean;
  directives: any[];
}
interface DebugElement extends ngDebugElement, DebugNode {}

const extractViewTree = (element: DebugElement | DebugNode, result: ComponentTreeNode[] = []): ComponentTreeNode[] => {
  const { isHost, directives } = element;
  if (!isHost && !directives.length) {
    ((element as any).childNodes || []).forEach((node) => extractViewTree(node, result));
    return result;
  }
  const node: ComponentTreeNode = {
    children: [],
    component: null,
    directives: [],
    element: element.nativeNode.nodeName.toLowerCase(),
    nativeElement: element.nativeNode,
  };
  if (isHost) {
    node.component = {
      instance: element.componentInstance,
      isElement: isCustomElement(element.nativeNode),
      name: element?.componentInstance?.constructor?.name,
    };
  }
  if (directives.length) {
    node.directives = element.directives.map((dir) => {
      return {
        instance: dir,
        name: dir.constructor.name,
      };
    });
  }
  if (node.component || node.directives.length) {
    result.push(node);
    ((element as any).childNodes || []).forEach((n) => extractViewTree(n, node.children));
  } else {
    ((element as any).childNodes || []).forEach((n) => extractViewTree(n, result));
  }
  return result;
};

export class DebugNodeTreeBuilder {
  supports(_: any) {
    const { asDebugNode, getDirectiveMetadata } = (window as any).ng;
    return typeof asDebugNode === 'function' && typeof getDirectiveMetadata === 'function';
  }

  build(element: Element): ComponentTreeNode[] {
    const result = extractViewTree((window as any).ng.asDebugNode(element));
    return result;
  }
}
