import { ComponentTreeNode } from '../component-tree';
import { isCustomElement } from '../utils';

const extractViewTree = (node: Node | Element, result: ComponentTreeNode[] = []): ComponentTreeNode[] => {
  const getComponent = (window as any).ng.getComponent as (element: Element) => {};
  const getDirectives = (window as any).ng.getDirectives as (node: Node) => {}[];

  const directives = getDirectives(node);
  if (!directives.length && !(node instanceof Element)) {
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
    element: node.nodeName.toLowerCase(),
    nativeElement: node,
  };
  if (!(node instanceof Element)) {
    result.push(componentTreeNode);
    return result;
  }
  const component = getComponent(node);
  if (component) {
    componentTreeNode.component = {
      instance: component,
      isElement: isCustomElement(node),
      name: node.nodeName.toLowerCase(),
    };
  }
  if (component || componentTreeNode.directives.length) {
    result.push(componentTreeNode);
  }
  if (componentTreeNode.component || componentTreeNode.directives.length) {
    node.childNodes.forEach((node) => extractViewTree(node, componentTreeNode.children));
  } else {
    node.childNodes.forEach((node) => extractViewTree(node, result));
  }
  return result;
};

export class RTreeStrategy {
  supports(_: any) {
    return ['getDirectiveMetadata', 'getComponent', 'getDirectives'].every(
      (method) => typeof (window as any).ng[method] === 'function'
    );
  }

  build(element: Element): ComponentTreeNode[] {
    const result = extractViewTree(element);
    return result;
  }
}
