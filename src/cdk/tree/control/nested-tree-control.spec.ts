import {fakeAsync, flush} from '@angular/core/testing';
import {of as observableOf} from 'rxjs';
import {NestedTreeControl} from './nested-tree-control';

describe('CdkNestedTreeControl', () => {
  let getChildren = (node: TestData) => observableOf(node.children);

  describe('base tree control actions', () => {
    let treeControl: NestedTreeControl<TestData>;

    beforeEach(() => {
      treeControl = new NestedTreeControl<TestData>(getChildren);
    });

    it('should be able to expand and collapse dataNodes', () => {
      const nodes = generateData(10, 4);
      const node = nodes[1];
      const sixthNode = nodes[5];
      treeControl.dataNodes = nodes;

      treeControl.expand(node);

      expect(treeControl.isExpanded(node))
        .withContext('Expect second node to be expanded')
        .toBeTruthy();
      expect(treeControl.expansionModel.selected)
        .withContext('Expect second node in expansionModel')
        .toContain(node);
      expect(treeControl.expansionModel.selected.length)
        .withContext('Expect only second node in expansionModel')
        .toBe(1);

      treeControl.toggle(sixthNode);

      expect(treeControl.isExpanded(node))
        .withContext('Expect second node to stay expanded')
        .toBeTruthy();
      expect(treeControl.expansionModel.selected)
        .withContext('Expect sixth node in expansionModel')
        .toContain(sixthNode);
      expect(treeControl.expansionModel.selected)
        .withContext('Expect second node in expansionModel')
        .toContain(node);
      expect(treeControl.expansionModel.selected.length)
        .withContext('Expect two dataNodes in expansionModel')
        .toBe(2);

      treeControl.collapse(node);

      expect(treeControl.isExpanded(node))
        .withContext('Expect second node to be collapsed')
        .toBeFalsy();
      expect(treeControl.expansionModel.selected.length)
        .withContext('Expect one node in expansionModel')
        .toBe(1);
      expect(treeControl.isExpanded(sixthNode))
        .withContext('Expect sixth node to stay expanded')
        .toBeTruthy();
      expect(treeControl.expansionModel.selected)
        .withContext('Expect sixth node in expansionModel')
        .toContain(sixthNode);
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
        .withContext(`Expect expanded ${expandedNodesNum} nodes`)
        .toBe(expandedNodesNum);

      expect(treeControl.isExpanded(nodes[1]))
        .withContext('Expect second node to be expanded')
        .toBeTruthy();
      for (let i = 0; i < numChildren; i++) {
        expect(treeControl.isExpanded(nodes[1].children[i]))
          .withContext(`Expect second node's children to be expanded`)
          .toBeTruthy();
        for (let j = 0; j < numGrandChildren; j++) {
          expect(treeControl.isExpanded(nodes[1].children[i].children[j]))
            .withContext(`Expect second node grand children to be expanded`)
            .toBeTruthy();
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

      expect(treeControl.expansionModel.selected.length)
        .withContext(`Expect no expanded nodes`)
        .toBe(0);

      treeControl.expandAll();

      const totalNumber =
        numNodes + numNodes * numChildren + numNodes * numChildren * numGrandChildren;
      expect(treeControl.expansionModel.selected.length)
        .withContext(`Expect ${totalNumber} expanded nodes`)
        .toBe(totalNumber);
    });

    // Note that this needs to be `fakeAsync` in order to
    // catch the error inside an observable correctly.
    it('should handle null children', fakeAsync(() => {
      const nodes = generateData(3, 2);

      nodes[1].children = null!;
      treeControl.dataNodes = nodes;

      expect(() => {
        treeControl.expandAll();
        flush();
      }).not.toThrow();
    }));

    describe('with children array', () => {
      let getStaticChildren = (node: TestData) => node.children;

      beforeEach(() => {
        treeControl = new NestedTreeControl<TestData>(getStaticChildren);
      });

      it('should be able to expand and collapse dataNodes', () => {
        const nodes = generateData(10, 4);
        const node = nodes[1];
        const sixthNode = nodes[5];
        treeControl.dataNodes = nodes;

        treeControl.expand(node);

        expect(treeControl.isExpanded(node))
          .withContext('Expect second node to be expanded')
          .toBeTruthy();
        expect(treeControl.expansionModel.selected)
          .withContext('Expect second node in expansionModel')
          .toContain(node);
        expect(treeControl.expansionModel.selected.length)
          .withContext('Expect only second node in expansionModel')
          .toBe(1);

        treeControl.toggle(sixthNode);

        expect(treeControl.isExpanded(node))
          .withContext('Expect second node to stay expanded')
          .toBeTruthy();
        expect(treeControl.expansionModel.selected)
          .withContext('Expect sixth node in expansionModel')
          .toContain(sixthNode);
        expect(treeControl.expansionModel.selected)
          .withContext('Expect second node in expansionModel')
          .toContain(node);
        expect(treeControl.expansionModel.selected.length)
          .withContext('Expect two dataNodes in expansionModel')
          .toBe(2);

        treeControl.collapse(node);

        expect(treeControl.isExpanded(node))
          .withContext('Expect second node to be collapsed')
          .toBeFalsy();
        expect(treeControl.expansionModel.selected.length)
          .withContext('Expect one node in expansionModel')
          .toBe(1);
        expect(treeControl.isExpanded(sixthNode))
          .withContext('Expect sixth node to stay expanded')
          .toBeTruthy();
        expect(treeControl.expansionModel.selected)
          .withContext('Expect sixth node in expansionModel')
          .toContain(sixthNode);
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
          .withContext(`Expect expanded ${expandedNodesNum} nodes`)
          .toBe(expandedNodesNum);

        expect(treeControl.isExpanded(nodes[1]))
          .withContext('Expect second node to be expanded')
          .toBeTruthy();
        for (let i = 0; i < numChildren; i++) {
          expect(treeControl.isExpanded(nodes[1].children[i]))
            .withContext(`Expect second node's children to be expanded`)
            .toBeTruthy();
          for (let j = 0; j < numGrandChildren; j++) {
            expect(treeControl.isExpanded(nodes[1].children[i].children[j]))
              .withContext(`Expect second node grand children to be expanded`)
              .toBeTruthy();
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

        expect(treeControl.expansionModel.selected.length)
          .withContext(`Expect no expanded nodes`)
          .toBe(0);

        treeControl.expandAll();

        const totalNumber =
          numNodes + numNodes * numChildren + numNodes * numChildren * numGrandChildren;
        expect(treeControl.expansionModel.selected.length)
          .withContext(`Expect ${totalNumber} expanded nodes`)
          .toBe(totalNumber);
      });
    });
  });

  it('maintains node expansion state based on trackBy function, if provided', () => {
    const treeControl = new NestedTreeControl<TestData, string>(getChildren, {
      trackBy: (node: TestData) => `${node.a} ${node.b} ${node.c}`,
    });

    const nodes = generateData(2, 2);
    const secondNode = nodes[1];
    treeControl.dataNodes = nodes;

    treeControl.expand(secondNode);
    expect(treeControl.isExpanded(secondNode))
      .withContext('Expect second node to be expanded')
      .toBeTruthy();

    // Replace the second node with a brand new instance with same hash
    nodes[1] = new TestData(
      secondNode.a,
      secondNode.b,
      secondNode.c,
      secondNode.level,
      secondNode.children,
    );
    expect(treeControl.isExpanded(nodes[1]))
      .withContext('Expect second node to still be expanded')
      .toBeTruthy();
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

function generateData(
  dataLength: number,
  childLength: number,
  grandChildLength: number = 0,
): TestData[] {
  let data: TestData[] = [];
  let nextIndex = 0;
  for (let i = 0; i < dataLength; i++) {
    let children: TestData[] = [];
    for (let j = 0; j < childLength; j++) {
      let grandChildren: TestData[] = [];
      for (let k = 0; k < grandChildLength; k++) {
        grandChildren.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 3));
      }
      children.push(
        new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 2, grandChildren),
      );
    }
    data.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 1, children));
  }
  return data;
}
