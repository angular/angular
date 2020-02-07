import { Node, ElementID } from 'protocol';

export interface IndexedNode extends Node {
  id: ElementID;
  children: IndexedNode[];
}

const indexTree = (node: Node, idx: number, parentId = []): IndexedNode => {
  const id = parentId.concat([idx]);
  return {
    id,
    element: node.element,
    component: node.component,
    directives: node.directives.map((d, i) => ({ name: d.name })),
    children: node.children.map((n, i) => indexTree(n, i, id)),
  } as IndexedNode;
};

export const indexForest = (forest: Node[]) => forest.map((n, i) => indexTree(n, i));
