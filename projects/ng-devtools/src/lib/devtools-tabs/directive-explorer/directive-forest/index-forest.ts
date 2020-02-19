import { Node, ElementPosition } from 'protocol';

export interface IndexedNode extends Node {
  position: ElementPosition;
  children: IndexedNode[];
}

const indexTree = (node: Node, idx: number, parentPosition = []): IndexedNode => {
  const position = parentPosition.concat([idx]);
  return {
    position,
    element: node.element,
    component: node.component,
    directives: node.directives.map((d, i) => ({ name: d.name })),
    children: node.children.map((n, i) => indexTree(n, i, position)),
  } as IndexedNode;
};

export const indexForest = (forest: Node[]) => forest.map((n, i) => indexTree(n, i));
