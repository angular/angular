/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FlatTreeControl, NestedTreeControl, TreeControl} from '@angular/cdk/tree';
import {Component, ViewChild, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject, Observable} from 'rxjs';
import {
  MatTree,
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
  MatTreeNestedDataSource
} from './index';


describe('MatTree', () => {
  /** Represents an indent for expectNestedTreeToMatch */
  const _ = {};

  let treeElement: HTMLElement;
  let underlyingDataSource: FakeDataSource;

  function configureMatTreeTestingModule(declarations: Type<any>[]) {
    TestBed.configureTestingModule({
      imports: [MatTreeModule],
      declarations: declarations,
    }).compileComponents();
  }

  describe('flat tree', () => {
    describe('should initialize', () => {
      let fixture: ComponentFixture<SimpleMatTreeApp>;
      let component: SimpleMatTreeApp;


      beforeEach(() => {
        configureMatTreeTestingModule([SimpleMatTreeApp]);
        fixture = TestBed.createComponent(SimpleMatTreeApp);

        component = fixture.componentInstance;
        underlyingDataSource = component.underlyingDataSource;
        treeElement = fixture.nativeElement.querySelector('mat-tree');

        fixture.detectChanges();
      });

      it('with rendered dataNodes', () => {
        const nodes = getNodes(treeElement);

        expect(nodes).toBeDefined('Expect nodes to be defined');
        expect(nodes[0].classList).toContain('customNodeClass');
      });

      it('with the right accessibility roles', () => {
        expect(treeElement.getAttribute('role')).toBe('tree');

        getNodes(treeElement).forEach(node => {
          expect(node.getAttribute('role')).toBe('treeitem');
        });
      });

      it('with the right data', () => {
        expect(underlyingDataSource.data.length).toBe(3);

        let data = underlyingDataSource.data;
        expectFlatTreeToMatch(treeElement, 28,
            [`topping_1 - cheese_1 + base_1`],
            [`topping_2 - cheese_2 + base_2`],
            [`topping_3 - cheese_3 + base_3`]);

        underlyingDataSource.addChild(data[2]);
        fixture.detectChanges();

        expectFlatTreeToMatch(treeElement, 28,
            [`topping_1 - cheese_1 + base_1`],
            [`topping_2 - cheese_2 + base_2`],
            [`topping_3 - cheese_3 + base_3`],
            [`_, topping_4 - cheese_4 + base_4`]);
      });
    });

    describe('with toggle', () => {
      let fixture: ComponentFixture<MatTreeAppWithToggle>;
      let component: MatTreeAppWithToggle;

      beforeEach(() => {
        configureMatTreeTestingModule([MatTreeAppWithToggle]);
        fixture = TestBed.createComponent(MatTreeAppWithToggle);

        component = fixture.componentInstance;
        underlyingDataSource = component.underlyingDataSource;
        treeElement = fixture.nativeElement.querySelector('mat-tree');

        fixture.detectChanges();
      });

      it('should expand/collapse the node', () => {
        expect(underlyingDataSource.data.length).toBe(3);

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(0, `Expect no expanded node`);

        component.toggleRecursively = false;
        const data = underlyingDataSource.data;
        const child = underlyingDataSource.addChild(data[2]);
        underlyingDataSource.addChild(child);
        fixture.detectChanges();

        expectFlatTreeToMatch(treeElement, 40,
            [`topping_1 - cheese_1 + base_1`],
            [`topping_2 - cheese_2 + base_2`],
            [`topping_3 - cheese_3 + base_3`]);


        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(1, `Expect node expanded one level`);
        expectFlatTreeToMatch(treeElement, 40,
            [`topping_1 - cheese_1 + base_1`],
            [`topping_2 - cheese_2 + base_2`],
            [`topping_3 - cheese_3 + base_3`],
            [_, `topping_4 - cheese_4 + base_4`]);

        (getNodes(treeElement)[3] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(2, `Expect node expanded`);
        expectFlatTreeToMatch(treeElement, 40,
            [`topping_1 - cheese_1 + base_1`],
            [`topping_2 - cheese_2 + base_2`],
            [`topping_3 - cheese_3 + base_3`],
            [_, `topping_4 - cheese_4 + base_4`],
            [_, _, `topping_5 - cheese_5 + base_5`]);

        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expectFlatTreeToMatch(treeElement, 40,
            [`topping_1 - cheese_1 + base_1`],
            [`topping_2 - cheese_2 + base_2`],
            [`topping_3 - cheese_3 + base_3`]);
      });

      it('should expand/collapse the node recursively', () => {
        expect(underlyingDataSource.data.length).toBe(3);

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(0, `Expect no expanded node`);

        const data = underlyingDataSource.data;
        const child = underlyingDataSource.addChild(data[2]);
        underlyingDataSource.addChild(child);
        fixture.detectChanges();

        expectFlatTreeToMatch(treeElement, 40,
            [`topping_1 - cheese_1 + base_1`],
            [`topping_2 - cheese_2 + base_2`],
            [`topping_3 - cheese_3 + base_3`]);

        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(3, `Expect nodes expanded`);
        expectFlatTreeToMatch(treeElement, 40,
            [`topping_1 - cheese_1 + base_1`],
            [`topping_2 - cheese_2 + base_2`],
            [`topping_3 - cheese_3 + base_3`],
            [_, `topping_4 - cheese_4 + base_4`],
            [_, _, `topping_5 - cheese_5 + base_5`]);


        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(0, `Expect node collapsed`);

        expectFlatTreeToMatch(treeElement, 40,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`]);
      });
    });

    describe('with when node template', () => {
      let fixture: ComponentFixture<WhenNodeMatTreeApp>;
      let component: WhenNodeMatTreeApp;

      beforeEach(() => {
        configureMatTreeTestingModule([WhenNodeMatTreeApp]);
        fixture = TestBed.createComponent(WhenNodeMatTreeApp);

        component = fixture.componentInstance;
        underlyingDataSource = component.underlyingDataSource;
        treeElement = fixture.nativeElement.querySelector('mat-tree');

        fixture.detectChanges();
      });

      it('with the right data', () => {
        expectFlatTreeToMatch(treeElement, 28,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`],
          [`>>> topping_4 - cheese_4 + base_4`]);
      });
    });
  });

  describe('flat tree with undefined or null children', () => {
    describe('should initialize', () => {
      let fixture: ComponentFixture<MatTreeWithNullOrUndefinedChild >;

      beforeEach(() => {
        configureMatTreeTestingModule([MatTreeWithNullOrUndefinedChild ]);
        fixture = TestBed.createComponent(MatTreeWithNullOrUndefinedChild );
        treeElement = fixture.nativeElement.querySelector('mat-tree');

        fixture.detectChanges();
      });

      it('with rendered dataNodes', () => {
        const nodes = getNodes(treeElement);

        expect(nodes).toBeDefined('Expect nodes to be defined');
        expect(nodes[0].classList).toContain('customNodeClass');
      });
    });
  });

  describe('nested tree with undefined or null children', () => {
    describe('should initialize', () => {
      let fixture: ComponentFixture<MatNestedTreeWithNullOrUndefinedChild >;

      beforeEach(() => {
        configureMatTreeTestingModule([MatNestedTreeWithNullOrUndefinedChild]);
        fixture = TestBed.createComponent(MatNestedTreeWithNullOrUndefinedChild);
        treeElement = fixture.nativeElement.querySelector('mat-tree');

        fixture.detectChanges();
      });

      it('with rendered dataNodes', () => {
        const nodes = getNodes(treeElement);

        expect(nodes).toBeDefined('Expect nodes to be defined');
        expect(nodes[0].classList).toContain('customNodeClass');
      });
    });
  });
  describe('nested tree', () => {
    describe('should initialize', () => {
      let fixture: ComponentFixture<NestedMatTreeApp>;
      let component: NestedMatTreeApp;

      beforeEach(() => {
        configureMatTreeTestingModule([NestedMatTreeApp]);
        fixture = TestBed.createComponent(NestedMatTreeApp);

        component = fixture.componentInstance;
        underlyingDataSource = component.underlyingDataSource;
        treeElement = fixture.nativeElement.querySelector('mat-tree');

        fixture.detectChanges();
      });

      it('with rendered dataNodes', () => {
        const nodes = getNodes(treeElement);

        expect(nodes).toBeDefined('Expect nodes to be defined');
        expect(nodes[0].classList).toContain('customNodeClass');
      });

      it('with the right accessibility roles', () => {
        expect(treeElement.getAttribute('role')).toBe('tree');

        getNodes(treeElement).forEach(node => {
          expect(node.getAttribute('role')).toBe('treeitem');
        });
      });

      it('with the right data', () => {
        expect(underlyingDataSource.data.length).toBe(3);

        let data = underlyingDataSource.data;
        expectNestedTreeToMatch(treeElement,
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`]);

        underlyingDataSource.addChild(data[1]);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('mat-tree');
        data = underlyingDataSource.data;
        expect(data.length).toBe(3);
        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`topping_3 - cheese_3 + base_3`]);
      });

      it('with nested child data', () => {
        expect(underlyingDataSource.data.length).toBe(3);

        let data = underlyingDataSource.data;
        const child = underlyingDataSource.addChild(data[1]);
        underlyingDataSource.addChild(child);
        fixture.detectChanges();

        expect(data.length).toBe(3);
        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [_, _, `topping_5 - cheese_5 + base_5`],
          [`topping_3 - cheese_3 + base_3`]);

        underlyingDataSource.addChild(child);
        fixture.detectChanges();

        expect(data.length).toBe(3);
        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [_, _, `topping_5 - cheese_5 + base_5`],
          [_, _, `topping_6 - cheese_6 + base_6`],
          [`topping_3 - cheese_3 + base_3`]);
      });
    });

    describe('with when node', () => {
      let fixture: ComponentFixture<WhenNodeNestedMatTreeApp>;
      let component: WhenNodeNestedMatTreeApp;

      beforeEach(() => {
        configureMatTreeTestingModule([WhenNodeNestedMatTreeApp]);
        fixture = TestBed.createComponent(WhenNodeNestedMatTreeApp);

        component = fixture.componentInstance;
        underlyingDataSource = component.underlyingDataSource;
        treeElement = fixture.nativeElement.querySelector('mat-tree');

        fixture.detectChanges();
      });

      it('with the right data', () => {
        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`],
          [`>>> topping_4 - cheese_4 + base_4`]);
      });
    });

    describe('with toggle', () => {
      let fixture: ComponentFixture<NestedMatTreeAppWithToggle>;
      let component: NestedMatTreeAppWithToggle;

      beforeEach(() => {
        configureMatTreeTestingModule([NestedMatTreeAppWithToggle]);
        fixture = TestBed.createComponent(NestedMatTreeAppWithToggle);

        component = fixture.componentInstance;
        underlyingDataSource = component.underlyingDataSource;
        treeElement = fixture.nativeElement.querySelector('mat-tree');

        fixture.detectChanges();
      });

      it('should expand/collapse the node', () => {
        component.toggleRecursively = false;
        let data = underlyingDataSource.data;
        const child = underlyingDataSource.addChild(data[1]);
        underlyingDataSource.addChild(child);

        fixture.detectChanges();

        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`]);

        fixture.detectChanges();

        (getNodes(treeElement)[1] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(1, `Expect node expanded`);
        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`topping_3 - cheese_3 + base_3`]);

        (getNodes(treeElement)[1] as HTMLElement).click();
        fixture.detectChanges();

        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`]);
        expect(component.treeControl.expansionModel.selected.length)
          .toBe(0, `Expect node collapsed`);
      });

      it('should expand/collapse the node recursively', () => {
        let data = underlyingDataSource.data;
        const child = underlyingDataSource.addChild(data[1]);
        underlyingDataSource.addChild(child);
        fixture.detectChanges();

        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`]);

        (getNodes(treeElement)[1] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(3, `Expect node expanded`);
        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [_, _, `topping_5 - cheese_5 + base_5`],
          [`topping_3 - cheese_3 + base_3`]);

        (getNodes(treeElement)[1] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(0, `Expect node collapsed`);
        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [`topping_3 - cheese_3 + base_3`]);
      });
    });
  });
});

export class TestData {
  pizzaTopping: string;
  pizzaCheese: string;
  pizzaBase: string;
  level: number;
  children: TestData[];
  observableChildren: BehaviorSubject<TestData[]>;
  isSpecial: boolean;

  constructor(pizzaTopping: string, pizzaCheese: string, pizzaBase: string,
              children: TestData[] = [], isSpecial: boolean = false) {
    this.pizzaTopping = pizzaTopping;
    this.pizzaCheese = pizzaCheese;
    this.pizzaBase = pizzaBase;
    this.isSpecial = isSpecial;
    this.children = children;
    this.observableChildren = new BehaviorSubject<TestData[]>(this.children);
  }
}

class FakeDataSource {
  dataIndex = 0;
  _dataChange = new BehaviorSubject<TestData[]>([]);
  get data() { return this._dataChange.getValue(); }
  set data(data: TestData[]) { this._dataChange.next(data); }

  connect(): Observable<TestData[]> {
    return this._dataChange;
  }

  disconnect() {}

  constructor() {
    for (let i = 0; i < 3; i++) {
      this.addData();
    }
  }

  addChild(parent: TestData, isSpecial: boolean = false) {
    const nextIndex = ++this.dataIndex;
    const child = new TestData(`topping_${nextIndex}`, `cheese_${nextIndex}`, `base_${nextIndex}`);

    const index = this.data.indexOf(parent);
    if (index > -1) {
      parent = new TestData(
          parent.pizzaTopping, parent.pizzaCheese, parent.pizzaBase, parent.children, isSpecial);
    }
    parent.children.push(child);
    parent.observableChildren.next(parent.children);

    let copiedData = this.data.slice();
    if (index > -1) {
      copiedData.splice(index, 1, parent);
    }
    this.data = copiedData;
    return child;
  }

  addData(isSpecial: boolean = false) {
    const nextIndex = ++this.dataIndex;
    let copiedData = this.data.slice();
    copiedData.push(new TestData(
      `topping_${nextIndex}`, `cheese_${nextIndex}`, `base_${nextIndex}`, [], isSpecial));

    this.data = copiedData;
  }
}

function getNodes(treeElement: Element): Element[] {
  return [].slice.call(treeElement.querySelectorAll('.mat-tree-node, .mat-nested-tree-node'))!;
}

function expectFlatTreeToMatch(treeElement: Element, expectedPaddingIndent: number = 28,
                               ...expectedTree: any[]) {
  const missedExpectations: string[] = [];

  function checkNode(node: Element, expectedNode: any[]) {
    const actualTextContent = node.textContent!.trim();
    const expectedTextContent = expectedNode[expectedNode.length - 1];
    if (actualTextContent !== expectedTextContent) {
      missedExpectations.push(
        `Expected node contents to be ${expectedTextContent} but was ${actualTextContent}`);
    }
  }

  function checkLevel(node: Element, expectedNode: any[]) {

    const actualLevel = (node as HTMLElement).style.paddingLeft;
    if (expectedNode.length === 1) {
      if (actualLevel !== ``) {
        missedExpectations.push(
          `Expected node level to be 0 but was ${actualLevel}`);
      }
    } else {
      const expectedLevel = `${(expectedNode.length - 1) * expectedPaddingIndent}px`;
      if (actualLevel != expectedLevel) {
        missedExpectations.push(
          `Expected node level to be ${expectedLevel} but was ${actualLevel}`);
      }
    }
  }

  getNodes(treeElement).forEach((node, index) => {
    const expected = expectedTree ?
      expectedTree[index] :
      null;

    checkLevel(node, expected);
    checkNode(node, expected);
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}

function expectNestedTreeToMatch(treeElement: Element, ...expectedTree: any[]) {
  const missedExpectations: string[] = [];
  function checkNodeContent(node: Element, expectedNode: any[]) {
    const expectedTextContent = expectedNode[expectedNode.length - 1];
    const actualTextContent = node.childNodes.item(0).textContent!.trim();
    if (actualTextContent !== expectedTextContent) {
      missedExpectations.push(
        `Expected node contents to be ${expectedTextContent} but was ${actualTextContent}`);
    }
  }

  function checkNodeDescendants(node: Element, expectedNode: any[], currentIndex: number) {
    let expectedDescendant = 0;

    for (let i = currentIndex + 1; i < expectedTree.length; ++i) {
      if (expectedTree[i].length > expectedNode.length) {
        ++expectedDescendant;
      } else if (expectedTree[i].length === expectedNode.length) {
        break;
      }
    }

    const actualDescendant = getNodes(node).length;
    if (actualDescendant !== expectedDescendant) {
      missedExpectations.push(
        `Expected node descendant num to be ${expectedDescendant} but was ${actualDescendant}`);
    }
  }

  getNodes(treeElement).forEach((node, index) => {

    const expected = expectedTree ?
      expectedTree[index] :
      null;

    checkNodeDescendants(node, expected, index);
    checkNodeContent(node, expected);
  });

  if (missedExpectations.length) {
    fail(missedExpectations.join('\n'));
  }
}

@Component({
  template: `
    <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-tree-node *matTreeNodeDef="let node" class="customNodeClass"
                     matTreeNodePadding [matTreeNodePaddingIndent]="28"
                     matTreeNodeToggle>
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </mat-tree-node>
    </mat-tree>
  `
})
class SimpleMatTreeApp {
  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;
  getChildren = (node: TestData) => node.observableChildren;
  transformer = (node: TestData, level: number) => {
    node.level = level;
    return node;
  }

  treeFlattener = new MatTreeFlattener<TestData, TestData>(
    this.transformer, this.getLevel, this.isExpandable, this.getChildren);

  treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  underlyingDataSource = new FakeDataSource();

  @ViewChild(MatTree) tree: MatTree<TestData>;

  constructor() {
    this.underlyingDataSource.connect().subscribe(data => {
      this.dataSource.data = data;
    });
  }
}

interface FoodNode {
  name: string;
  children?: FoodNode[] | null;
}

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

/**
 * Food data with nested structure.
 * Each node has a name and an optiona list of children.
 */
const TREE_DATA: FoodNode[] = [
  {
    name: 'Fruit',
    children: [
      {name: 'Apple'},
      {name: 'Banana'},
      {name: 'Fruit loops',
       children: null},
    ]
  }, {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [
          {name: 'Broccoli'},
          {name: 'Brussel sprouts'},
        ]
      }, {
        name: 'Orange',
        children: [
          {name: 'Pumpkins'},
          {name: 'Carrots'},
        ]
      },
    ]
  },
];

@Component({
  template: `
    <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-tree-node *matTreeNodeDef="let node" class="customNodeClass"
                     matTreeNodePadding matTreeNodeToggle>
        {{node.name}}
      </mat-tree-node>
    </mat-tree>
  `
})
class MatTreeWithNullOrUndefinedChild {
  private transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children,
      name: node.name,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
     this.transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener, TREE_DATA);

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
}

@Component({
  template: `
    <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-nested-tree-node *matTreeNodeDef="let node" class="customNodeClass">
        {{node.name}}
        <ng-template matTreeNodeOutlet></ng-template>
      </mat-nested-tree-node>
    </mat-tree>
  `
})
class MatNestedTreeWithNullOrUndefinedChild {
  treeControl: NestedTreeControl<FoodNode>;
  dataSource: MatTreeNestedDataSource<FoodNode>;

  constructor() {
    this.treeControl = new NestedTreeControl<FoodNode>(this.getChildren);
    this.dataSource = new MatTreeNestedDataSource();
    this.dataSource.data = TREE_DATA;
  }

  private getChildren = (node: FoodNode) => node.children;
}

@Component({
  template: `
    <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-nested-tree-node *matTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template matTreeNodeOutlet></ng-template>
      </mat-nested-tree-node>
    </mat-tree>
  `
})
class NestedMatTreeApp {
  getChildren = (node: TestData) => node.observableChildren;

  treeControl = new NestedTreeControl(this.getChildren);

  dataSource = new MatTreeNestedDataSource();
  underlyingDataSource = new FakeDataSource();

  @ViewChild(MatTree) tree: MatTree<TestData>;

  constructor() {
    this.underlyingDataSource.connect().subscribe(data => {
      this.dataSource.data = data;
    });
  }
}

@Component({
  template: `
    <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-nested-tree-node *matTreeNodeDef="let node">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template matTreeNodeOutlet></ng-template>
      </mat-nested-tree-node>
       <mat-nested-tree-node *matTreeNodeDef="let node; when: isSpecial"
                             matTreeNodeToggle>
                     >>> {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <div *ngIf="treeControl.isExpanded(node)">
            <ng-template matTreeNodeOutlet></ng-template>
         </div>
      </mat-nested-tree-node>
    </mat-tree>
  `
})
class WhenNodeNestedMatTreeApp {
  isSpecial = (_: number, node: TestData) =>  node.isSpecial;

  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource = new MatTreeNestedDataSource();
  underlyingDataSource = new FakeDataSource();

  @ViewChild(MatTree) tree: MatTree<TestData>;

  constructor() {
    this.underlyingDataSource.connect().subscribe(data => {
      this.dataSource.data = data;
    });
  }
}


@Component({
  template: `
    <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-tree-node *matTreeNodeDef="let node" class="customNodeClass"
                     matTreeNodePadding
                     matTreeNodeToggle [matTreeNodeToggleRecursive]="toggleRecursively">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </mat-tree-node>
    </mat-tree>
  `
})
class MatTreeAppWithToggle {
  toggleRecursively: boolean = true;

  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;
  getChildren = (node: TestData) => node.observableChildren;
  transformer = (node: TestData, level: number) => {
    node.level = level;
    return node;
  }

  treeFlattener = new MatTreeFlattener<TestData, TestData>(
    this.transformer, this.getLevel, this.isExpandable, this.getChildren);

  treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  underlyingDataSource = new FakeDataSource();

  @ViewChild(MatTree) tree: MatTree<TestData>;

  constructor() {
    this.underlyingDataSource.connect().subscribe(data => {
      this.dataSource.data = data;
    });
  }
}

@Component({
  template: `
    <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-nested-tree-node *matTreeNodeDef="let node" class="customNodeClass"
                            matTreeNodeToggle [matTreeNodeToggleRecursive]="toggleRecursively">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
        <div *ngIf="treeControl.isExpanded(node)">
          <ng-template matTreeNodeOutlet></ng-template>
        </div>
      </mat-nested-tree-node>
    </mat-tree>
  `
})
class NestedMatTreeAppWithToggle {
  toggleRecursively: boolean = true;

  getChildren = (node: TestData) => node.observableChildren;

  treeControl = new NestedTreeControl(this.getChildren);
  dataSource = new MatTreeNestedDataSource();
  underlyingDataSource = new FakeDataSource();

  @ViewChild(MatTree) tree: MatTree<TestData>;

  constructor() {
    this.underlyingDataSource.connect().subscribe(data => {
      this.dataSource.data = data;
    });
  }
}

@Component({
  template: `
    <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-tree-node *matTreeNodeDef="let node" class="customNodeClass"
                     matTreeNodePadding [matTreeNodePaddingIndent]="28"
                     matTreeNodeToggle>
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </mat-tree-node>
       <mat-tree-node *matTreeNodeDef="let node; when: isSpecial" class="customNodeClass"
                     matTreeNodePadding [matTreeNodePaddingIndent]="28"
                     matTreeNodeToggle>
                     >>> {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </mat-tree-node>
    </mat-tree>
  `
})
class WhenNodeMatTreeApp {
  isSpecial = (_: number, node: TestData) => node.isSpecial;

  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;
  getChildren = (node: TestData) => node.observableChildren;
  transformer = (node: TestData, level: number) => {
    node.level = level;
    return node;
  }

  treeFlattener = new MatTreeFlattener<TestData, TestData>(
    this.transformer, this.getLevel, this.isExpandable, this.getChildren);

  treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  underlyingDataSource = new FakeDataSource();

  @ViewChild(MatTree) tree: MatTree<TestData>;

  constructor() {
    this.underlyingDataSource.connect().subscribe(data => {
      this.dataSource.data = data;
    });
  }
}
