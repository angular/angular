import { ComponentTreeNode } from '../component-tree';
import { isCustomElement } from '../utils';

const extractViewTree = (
  domNode: Node | Element,
  result: ComponentTreeNode[],
  getComponent: (element: Element) => {},
  getDirectives: (node: Node) => {}[]
): ComponentTreeNode[] => {
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
    element: node.nodeName.toLowerCase(),
    nativeElement: node,
  };
  if (!(domNode instanceof Element)) {
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
    domNode.childNodes.forEach((node) =>
      extractViewTree(node, componentTreeNode.children, getComponent, getDirectives)
    );
  } else {
    domNode.childNodes.forEach((node) => extractViewTree(node, result, getComponent, getDirectives));
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
    const getComponent = (window as any).ng.getComponent as (element: Element) => {};
    const getDirectives = (window as any).ng.getDirectives as (node: Node) => {}[];
    const result = extractViewTree(element, [], getComponent, getDirectives);
    return result;
  }
}
