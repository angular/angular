import {of as observableOf} from 'rxjs/observable/of';
import {NestedTreeControl} from './nested-tree-control';


describe('CdkNestedTreeControl', () => {
  let treeControl: NestedTreeControl<TestData>;
  let getChildren = (node: TestData) => observableOf(node.children);

  beforeEach(() => {
    treeControl = new NestedTreeControl<TestData>(getChildren);
  });

  describe('base tree control actions', () => {
    it('should be able to expand and collapse dataNodes', () => {
      const nodes = generateData(10, 4);
      const node = nodes[1];
      const sixthNode = nodes[5];
      treeControl.dataNodes = nodes;

      treeControl.expand(node);


      expect(treeControl.isExpanded(node)).toBeTruthy('Expect second node to be expanded');
      expect(treeControl.expansionModel.selected)
        .toContain(node, 'Expect second node in expansionModel');
      expect(treeControl.expansionModel.selected.length)
        .toBe(1, 'Expect only second node in expansionModel');

      treeControl.toggle(sixthNode);

      expect(treeControl.isExpanded(node)).toBeTruthy('Expect second node to stay expanded');
      expect(treeControl.expansionModel.selected)
        .toContain(sixthNode, 'Expect sixth node in expansionModel');
      expect(treeControl.expansionModel.selected)
        .toContain(node, 'Expect second node in expansionModel');
      expect(treeControl.expansionModel.selected.length)
        .toBe(2, 'Expect two dataNodes in expansionModel');

      treeControl.collapse(node);

      expect(treeControl.isExpanded(node)).toBeFalsy('Expect second node to be collapsed');
      expect(treeControl.expansionModel.selected.length)
        .toBe(1, 'Expect one node in expansionModel');
      expect(treeControl.isExpanded(sixthNode)).toBeTruthy('Expect sixth node to stay expanded');
      expect(treeControl.expansionModel.selected)
        .toContain(sixthNode, 'Expect sixth node in expansionModel');
    });

    it('should toggle descendants correctly', () => {
      const numNodes = 10;
      const numChildren = 4;
      const numGrandChildren = 2;
      const nodes = generateData(numNodes, numChildren, numGrandChildren);
      treeControl.dataNodes = nodes;

      treeControl.expandDescendants(nodes[1]);

      const expandedNodesNum = 1 + numChildren + numChildren * numGrandChildren;
      expect(treeControl.expansionModel.selected.length)
        .toBe(expandedNodesNum, `Expect expanded ${expandedNodesNum} nodes`);

      expect(treeControl.isExpanded(nodes[1])).toBeTruthy('Expect second node to be expanded');
      for (let i = 0; i < numChildren; i++) {

        expect(treeControl.isExpanded(nodes[1].children[i]))
          .toBeTruthy(`Expect second node's children to be expanded`);
        for (let j = 0; j < numGrandChildren; j++) {
          expect(treeControl.isExpanded(nodes[1].children[i].children[j]))
            .toBeTruthy(`Expect second node grand children to be expanded`);
        }
      }
    });

    it('should be able to expand/collapse all the dataNodes', () => {
      const numNodes = 10;
      const numChildren = 4;
      const numGrandChildren = 2;
      const nodes = generateData(numNodes, numChildren, numGrandChildren);
      treeControl.dataNodes = nodes;

      treeControl.expandDescendants(nodes[1]);

      treeControl.collapseAll();

      expect(treeControl.expansionModel.selected.length).toBe(0, `Expect no expanded nodes`);

      treeControl.expandAll();

      const totalNumber = numNodes + numNodes * numChildren
        + numNodes * numChildren * numGrandChildren;
      expect(treeControl.expansionModel.selected.length)
        .toBe(totalNumber, `Expect ${totalNumber} expanded nodes`);
    });
  });
});

export class TestData {
  a: string;
  b: string;
  c: string;
  level: number;
  children: TestData[];

  constructor(a: string, b: string, c: string, level: number = 1, children: TestData[] = []) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.level = level;
    this.children = children;
  }
}

function generateData(dataLength: number, childLength: number, grandChildLength: number = 0)
    : TestData[] {
  let data = <any>[];
  let nextIndex = 0;
  for (let i = 0; i < dataLength; i++) {
    let children = <any>[];
    for (let j = 0; j < childLength; j++) {
      let grandChildren = <any>[];
      for (let k = 0; k < grandChildLength; k++) {
        grandChildren.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 3));
      }
      children.push(
        new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 2, grandChildren));
    }
    data.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 1, children));
  }
  return data;
}
