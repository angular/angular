import {Component} from '@angular/core';
import {FlatTreeControl, NestedTreeControl} from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
  MatTreeNestedDataSource,
} from '@angular/material/tree';
import {MatTreeHarness} from '@angular/material/tree/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

/** Shared tests to run on both the original and MDC-based trees. */
export function runHarnessTests(
  treeModule: typeof MatTreeModule,
  treeHarness: typeof MatTreeHarness,
) {
  let fixture: ComponentFixture<TreeHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [treeModule],
      declarations: [TreeHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(TreeHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness with 2 tress', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);

    expect(trees.length).toBe(2);
  });

  it('should get correct number of children and descendants', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);
    const flatTree = trees[0];
    const nestedTree = trees[1];
    const flatTreeDescendants = await flatTree.getNodes();
    const nestedDescendants = await nestedTree.getNodes();

    // flat nodes are not rendered until expanded
    expect(flatTreeDescendants.length).toBe(2);

    await flatTreeDescendants[0].expand();

    expect((await flatTree.getNodes()).length).toBe(5);

    expect(nestedDescendants.length).toBe(8);
  });

  it('should correctly get correct node with text (flat tree)', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);
    const flatTree = trees[0];
    const flatTreeNodes = await flatTree.getNodes({text: /Flat Group/});
    expect(flatTreeNodes.length).toBe(2);
    const secondGroup = flatTreeNodes[0];

    expect(await secondGroup.getText()).toBe('Flat Group 1');
    expect(await secondGroup.getLevel()).toBe(1);
    expect(await secondGroup.isDisabled()).toBe(false);
    expect(await secondGroup.isExpanded()).toBe(false);
  });

  it('should correctly get correct node with text (nested tree)', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);
    const nestedTree = trees[1];
    const nestedTreeNodes = await nestedTree.getNodes({text: /2./});
    expect(nestedTreeNodes.length).toBe(3);
    const thirdGroup = nestedTreeNodes[1];

    expect(await thirdGroup.getText()).toBe('Nested Leaf 2.1.1');
    expect(await thirdGroup.getLevel()).toBe(3);
    expect(await thirdGroup.isDisabled()).toBe(false);
    expect(await thirdGroup.isExpanded()).toBe(false);
  });

  it('should toggle expansion', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);
    const nestedTree = trees[1];
    const nestedTreeNodes = await nestedTree.getNodes();
    const firstGroup = nestedTreeNodes[0];

    expect(await firstGroup.isExpanded()).toBe(false);
    await firstGroup.expand();
    expect(await firstGroup.isExpanded()).toBe(true);
    await firstGroup.expand();
    // no-op if already expanded
    expect(await firstGroup.isExpanded()).toBe(true);
    await firstGroup.collapse();
    expect(await firstGroup.isExpanded()).toBe(false);
    await firstGroup.collapse();
    // no-op if already collapsed
    expect(await firstGroup.isExpanded()).toBe(false);
  });

  it('should correctly get tree structure', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);
    const flatTree = trees[0];

    expect(await flatTree.getTreeStructure()).toEqual({
      children: [{text: 'Flat Group 1'}, {text: 'Flat Group 2'}],
    });

    const firstGroup = (await flatTree.getNodes({text: /Flat Group 1/}))[0];
    await firstGroup.expand();

    expect(await flatTree.getTreeStructure()).toEqual({
      children: [
        {
          text: 'Flat Group 1',
          children: [{text: 'Flat Leaf 1.1'}, {text: 'Flat Leaf 1.2'}, {text: 'Flat Leaf 1.3'}],
        },
        {text: 'Flat Group 2'},
      ],
    });

    const secondGroup = (await flatTree.getNodes({text: /Flat Group 2/}))[0];
    await secondGroup.expand();

    expect(await flatTree.getTreeStructure()).toEqual({
      children: [
        {
          text: 'Flat Group 1',
          children: [{text: 'Flat Leaf 1.1'}, {text: 'Flat Leaf 1.2'}, {text: 'Flat Leaf 1.3'}],
        },
        {
          text: 'Flat Group 2',
          children: [{text: 'Flat Group 2.1'}],
        },
      ],
    });
  });

  it('should correctly get tree structure', async () => {
    const trees = await loader.getAllHarnesses(treeHarness);
    const nestedTree = trees[1];
    expect(await nestedTree.getTreeStructure()).toEqual({
      children: [{text: 'Nested Group 1'}, {text: 'Nested Group 2'}],
    });

    const firstGroup = (await nestedTree.getNodes({text: /Nested Group 1/}))[0];
    await firstGroup.expand();
    expect(await nestedTree.getTreeStructure()).toEqual({
      children: [
        {
          text: 'Nested Group 1',
          children: [
            {text: 'Nested Leaf 1.1'},
            {text: 'Nested Leaf 1.2'},
            {text: 'Nested Leaf 1.3'},
          ],
        },
        {text: 'Nested Group 2'},
      ],
    });

    const secondGroup = (await nestedTree.getNodes({text: /Nested Group 2/}))[0];
    await secondGroup.expand();
    expect(await nestedTree.getTreeStructure()).toEqual({
      children: [
        {
          text: 'Nested Group 1',
          children: [
            {text: 'Nested Leaf 1.1'},
            {text: 'Nested Leaf 1.2'},
            {text: 'Nested Leaf 1.3'},
          ],
        },
        {
          text: 'Nested Group 2',
          children: [{text: 'Nested Group 2.1'}],
        },
      ],
    });
  });
}

interface Node {
  name: string;
  children?: Node[];
}

const FLAT_TREE_DATA: Node[] = [
  {
    name: 'Flat Group 1',
    children: [{name: 'Flat Leaf 1.1'}, {name: 'Flat Leaf 1.2'}, {name: 'Flat Leaf 1.3'}],
  },
  {
    name: 'Flat Group 2',
    children: [
      {
        name: 'Flat Group 2.1',
        children: [{name: 'Flat Leaf 2.1.1'}, {name: 'Flat Leaf 2.1.2'}, {name: 'Flat Leaf 2.1.3'}],
      },
    ],
  },
];

const NESTED_TREE_DATA: Node[] = [
  {
    name: 'Nested Group 1',
    children: [{name: 'Nested Leaf 1.1'}, {name: 'Nested Leaf 1.2'}, {name: 'Nested Leaf 1.3'}],
  },
  {
    name: 'Nested Group 2',
    children: [
      {
        name: 'Nested Group 2.1',
        children: [{name: 'Nested Leaf 2.1.1'}, {name: 'Nested Leaf 2.1.2'}],
      },
    ],
  },
];

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  template: `
    <mat-tree [dataSource]="flatTreeDataSource" [treeControl]="flatTreeControl">
      <!-- This is the tree node template for leaf nodes -->
      <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>
        {{node.name}}
      </mat-tree-node>
      <!-- This is the tree node template for expandable nodes -->
      <mat-tree-node *matTreeNodeDef="let node;when: flatTreeHasChild" matTreeNodePadding>
        <button matTreeNodeToggle>
          Toggle
        </button>
        {{node.name}}
      </mat-tree-node>
    </mat-tree>
    <mat-tree [dataSource]="nestedTreeDataSource" [treeControl]="nestedTreeControl">
      <!-- This is the tree node template for leaf nodes -->
      <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle>
        {{node.name}}
      </mat-tree-node>
      <!-- This is the tree node template for expandable nodes -->
      <mat-nested-tree-node *matTreeNodeDef="let node; when: nestedTreeHasChild">
        <button matTreeNodeToggle>
          Toggle
        </button>
        {{node.name}}
        <ul [class.example-tree-invisible]="!nestedTreeControl.isExpanded(node)">
          <ng-container matTreeNodeOutlet></ng-container>
        </ul>
      </mat-nested-tree-node>
    </mat-tree>
  `,
})
class TreeHarnessTest {
  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );
  flatTreeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );
  flatTreeDataSource = new MatTreeFlatDataSource(this.flatTreeControl, this.treeFlattener);
  nestedTreeControl = new NestedTreeControl<Node>(node => node.children);
  nestedTreeDataSource = new MatTreeNestedDataSource<Node>();

  constructor() {
    this.flatTreeDataSource.data = FLAT_TREE_DATA;
    this.nestedTreeDataSource.data = NESTED_TREE_DATA;
  }

  flatTreeHasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  nestedTreeHasChild = (_: number, node: Node) => !!node.children && node.children.length > 0;
}
