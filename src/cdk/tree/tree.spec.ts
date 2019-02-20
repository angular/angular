/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ComponentFixture, TestBed, fakeAsync, flush} from '@angular/core/testing';
import {Component, ViewChild, TrackByFunction, Type, EventEmitter} from '@angular/core';

import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Directionality, Direction} from '@angular/cdk/bidi';
import {combineLatest, BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {BaseTreeControl} from './control/base-tree-control';
import {TreeControl} from './control/tree-control';
import {FlatTreeControl} from './control/flat-tree-control';
import {NestedTreeControl} from './control/nested-tree-control';
import {CdkTreeModule} from './index';
import {CdkTree, CdkTreeNode} from './tree';
import {getTreeControlFunctionsMissingError} from './tree-errors';


describe('CdkTree', () => {
  /** Represents an indent for expectNestedTreeToMatch */
  const _ = {};
  let dataSource: FakeDataSource;
  let treeElement: HTMLElement;
  let tree: CdkTree<TestData>;
  let dir: {value: Direction, change: EventEmitter<Direction>};

  function configureCdkTreeTestingModule(declarations: Type<any>[]) {
    TestBed.configureTestingModule({
      imports: [CdkTreeModule],
      providers: [{
        provide: Directionality,
        useFactory: () => dir = {value: 'ltr', change: new EventEmitter<Direction>()}
      }],
      declarations: declarations,
    }).compileComponents();
  }

  it('should clear out the `mostRecentTreeNode` on destroy', () => {
    configureCdkTreeTestingModule([SimpleCdkTreeApp]);
    const fixture = TestBed.createComponent(SimpleCdkTreeApp);
    fixture.detectChanges();

    // Cast the assertions to a boolean to avoid Jasmine going into an
    // infinite loop when stringifying the object, if the test starts failing.
    expect(!!CdkTreeNode.mostRecentTreeNode).toBe(true);

    fixture.destroy();

    expect(!!CdkTreeNode.mostRecentTreeNode).toBe(false);
  });

  describe('flat tree', () => {
    describe('should initialize', () => {
      let fixture: ComponentFixture<SimpleCdkTreeApp>;
      let component: SimpleCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([SimpleCdkTreeApp]);
        fixture = TestBed.createComponent(SimpleCdkTreeApp);

        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with a connected data source', () => {
        expect(tree.dataSource).toBe(dataSource);
        expect(dataSource.isConnected).toBe(true);
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
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectFlatTreeToMatch(treeElement, 28, 'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`]);

        dataSource.addData(2);
        fixture.detectChanges();

        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(treeElement, 28, 'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
          [_, `${data[3].pizzaTopping} - ${data[3].pizzaCheese} + ${data[3].pizzaBase}`]);
      });

      it('should be able to use units different from px for the indentation', () => {
        component.indent = '15rem';
        fixture.detectChanges();

        const data = dataSource.data;

        expectFlatTreeToMatch(treeElement, 15, 'rem',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`]);
      });

      it('should default to px if no unit is set for string value indentation', () => {
        component.indent = '17';
        fixture.detectChanges();

        const data = dataSource.data;

        expectFlatTreeToMatch(treeElement, 17, 'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`]);
      });

      it('should reset the opposite direction padding if the direction changes', () => {
        const node = getNodes(treeElement)[0];

        component.indent = 10;
        fixture.detectChanges();

        expect(node.style.paddingLeft).toBe('10px');
        expect(node.style.paddingRight).toBeFalsy();

        dir.value = 'rtl';
        dir.change.emit('rtl');
        fixture.detectChanges();

        expect(node.style.paddingRight).toBe('10px');
        expect(node.style.paddingLeft).toBeFalsy();
      });

    });

    describe('with toggle', () => {
      let fixture: ComponentFixture<CdkTreeAppWithToggle>;
      let component: CdkTreeAppWithToggle;

      beforeEach(() => {
        configureCdkTreeTestingModule([CdkTreeAppWithToggle]);
        fixture = TestBed.createComponent(CdkTreeAppWithToggle);

        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('should expand/collapse the node', () => {
        expect(dataSource.data.length).toBe(3);

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(0, `Expect no expanded node`);

        component.toggleRecursively = false;
        let data = dataSource.data;
        dataSource.addChild(data[2]);
        fixture.detectChanges();

        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(treeElement, 40, 'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
          [_, `${data[3].pizzaTopping} - ${data[3].pizzaCheese} + ${data[3].pizzaBase}`]);


        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(1, `Expect node expanded`);
        expect(component.treeControl.expansionModel.selected[0]).toBe(data[2]);

        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(0, `Expect node collapsed`);
      });

      it('should expand/collapse the node recursively', () => {
        expect(dataSource.data.length).toBe(3);

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(0, `Expect no expanded node`);

        let data = dataSource.data;
        dataSource.addChild(data[2]);
        fixture.detectChanges();

        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(treeElement, 40, 'px',
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`],
          [_, `${data[3].pizzaTopping} - ${data[3].pizzaCheese} + ${data[3].pizzaBase}`]);

        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(2, `Expect nodes expanded`);
        expect(component.treeControl.expansionModel.selected[0])
          .toBe(data[2], `Expect parent node expanded`);
        expect(component.treeControl.expansionModel.selected[1])
          .toBe(data[3], `Expected child node expanded`);

        (getNodes(treeElement)[2] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(0, `Expect node collapsed`);
      });
    });

    describe('with when node template', () => {
      let fixture: ComponentFixture<WhenNodeCdkTreeApp>;
      let component: WhenNodeCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([WhenNodeCdkTreeApp]);
        fixture = TestBed.createComponent(WhenNodeCdkTreeApp);

        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectFlatTreeToMatch(treeElement, 28, 'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`]);

        dataSource.addChild(data[1]);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(treeElement, 28, 'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`[topping_3] - [cheese_3] + [base_3]`]);
      });
    });

    describe('with array data source', () => {
      let fixture: ComponentFixture<ArrayDataSourceCdkTreeApp>;
      let component: ArrayDataSourceCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([ArrayDataSourceCdkTreeApp]);
        fixture = TestBed.createComponent(ArrayDataSourceCdkTreeApp);
        fixture.detectChanges();


        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectFlatTreeToMatch(treeElement, 28, 'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`]);

        dataSource.addChild(data[1]);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(treeElement, 28, 'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `[topping_4] - [cheese_4] + [base_4]`],
          [`[topping_3] - [cheese_3] + [base_3]`]);
      });
    });

    describe('with observable data source', () => {
      let fixture: ComponentFixture<ObservableDataSourceCdkTreeApp>;
      let component: ObservableDataSourceCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([ObservableDataSourceCdkTreeApp]);
        fixture = TestBed.createComponent(ObservableDataSourceCdkTreeApp);

        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectFlatTreeToMatch(treeElement, 28, 'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`]);

        dataSource.addChild(data[1]);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(4);
        expectFlatTreeToMatch(treeElement, 28, 'px',
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `[topping_4] - [cheese_4] + [base_4]`],
          [`[topping_3] - [cheese_3] + [base_3]`]);
      });
    });

    describe('with trackBy', () => {
      let fixture: ComponentFixture<CdkTreeAppWithTrackBy>;
      let component: CdkTreeAppWithTrackBy;

      function createTrackByTestComponent(trackByStrategy: 'reference' | 'property' | 'index') {
        configureCdkTreeTestingModule([CdkTreeAppWithTrackBy]);
        fixture = TestBed.createComponent(CdkTreeAppWithTrackBy);
        component = fixture.componentInstance;
        component.trackByStrategy = trackByStrategy;
        fixture.detectChanges();

        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');

        // Each node receives an attribute 'initialIndex' the element's original place
        getNodes(treeElement).forEach((node: Element, index: number) => {
          node.setAttribute('initialIndex', index.toString());
        });

        // Prove that the attributes match their indices
        const initialNodes = getNodes(treeElement);
        expect(initialNodes[0].getAttribute('initialIndex')).toBe('0');
        expect(initialNodes[1].getAttribute('initialIndex')).toBe('1');
        expect(initialNodes[2].getAttribute('initialIndex')).toBe('2');
      }

      function mutateData() {
        // Swap first and second data in data array
        const copiedData = component.dataSource.data.slice();
        const temp = copiedData[0];
        copiedData[0] = copiedData[1];
        copiedData[1] = temp;

        // Remove the third element
        copiedData.splice(2, 1);

        // Add new data
        component.dataSource.data = copiedData;
        component.dataSource.addData();
      }

      it('should add/remove/move nodes with reference-based trackBy', () => {
        createTrackByTestComponent('reference');
        mutateData();

        // Expect that the first and second nodes were swapped and that the last node is new
        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(3);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('0');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe(null);
      });

      it('should add/remove/move nodes with property-based trackBy', () => {
        createTrackByTestComponent('property');
        mutateData();

        // Change each item reference to show that the trackby is checking the item properties.
        // Otherwise this would cause them all to be removed/added.
        component.dataSource.data = component.dataSource.data
            .map(item => new TestData(item.pizzaTopping, item.pizzaCheese, item.pizzaBase, ));

        // Expect that the first and second nodes were swapped and that the last node is new
        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(3);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('0');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe(null);
      });

      it('should add/remove/move nodes with index-based trackBy', () => {
        createTrackByTestComponent('index');
        mutateData();

        // Change each item reference to show that the trackby is checking the index.
        // Otherwise this would cause them all to be removed/added.
        component.dataSource.data = component.dataSource.data
            .map(item => new TestData(item.pizzaTopping, item.pizzaCheese, item.pizzaBase, ));

        // Expect first two to be the same since they were swapped but indicies are consistent.
        // The third element was removed and caught by the tree so it was removed before another
        // item was added, so it is without an initial index.
        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(3);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('0');
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe(null);
      });
    });
  });

  describe('nested tree', () => {
    describe('should initialize', () => {
      let fixture: ComponentFixture<NestedCdkTreeApp>;
      let component: NestedCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([NestedCdkTreeApp]);
        fixture = TestBed.createComponent(NestedCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with a connected data source', () => {
        expect(tree.dataSource).toBe(dataSource);
        expect(dataSource.isConnected).toBe(true);
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
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectNestedTreeToMatch(treeElement,
          [`${data[0].pizzaTopping} - ${data[0].pizzaCheese} + ${data[0].pizzaBase}`],
          [`${data[1].pizzaTopping} - ${data[1].pizzaCheese} + ${data[1].pizzaBase}`],
          [`${data[2].pizzaTopping} - ${data[2].pizzaCheese} + ${data[2].pizzaBase}`]);

        dataSource.addChild(data[1], false);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(3);
        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`topping_3 - cheese_3 + base_3`]);
      });

      it('with nested child data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        const child = dataSource.addChild(data[1], false);
        dataSource.addChild(child, false);
        fixture.detectChanges();

        expect(data.length).toBe(3);
        expectNestedTreeToMatch(treeElement,
            [`topping_1 - cheese_1 + base_1`],
            [`topping_2 - cheese_2 + base_2`],
            [_, `topping_4 - cheese_4 + base_4`],
            [_, _, `topping_5 - cheese_5 + base_5`],
            [`topping_3 - cheese_3 + base_3`]);

        dataSource.addChild(child, false);
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

    describe('with static children', () => {
      let fixture: ComponentFixture<StaticNestedCdkTreeApp>;
      let component: StaticNestedCdkTreeApp;

      beforeEach(() => {
      configureCdkTreeTestingModule([StaticNestedCdkTreeApp]);
      fixture = TestBed.createComponent(StaticNestedCdkTreeApp);
      fixture.detectChanges();

      component = fixture.componentInstance;
      dataSource = component.dataSource as FakeDataSource;
      tree = component.tree;
      treeElement = fixture.nativeElement.querySelector('cdk-tree');
    });

    it('with the right data', () => {
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
      let fixture: ComponentFixture<WhenNodeNestedCdkTreeApp>;
      let component: WhenNodeNestedCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([WhenNodeNestedCdkTreeApp]);
        fixture = TestBed.createComponent(WhenNodeNestedCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectNestedTreeToMatch(treeElement,
            [`topping_1 - cheese_1 + base_1`],
            [`>> topping_2 - cheese_2 + base_2`],
            [`topping_3 - cheese_3 + base_3`]);

        dataSource.addChild(data[1], false);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        data = dataSource.data;
        expect(data.length).toBe(3);
        expectNestedTreeToMatch(treeElement,
            [`topping_1 - cheese_1 + base_1`],
            [`>> topping_2 - cheese_2 + base_2`],
            [_, `topping_4 - cheese_4 + base_4`],
            [`topping_3 - cheese_3 + base_3`]);
      });
    });

    describe('with toggle', () => {
      let fixture: ComponentFixture<NestedCdkTreeAppWithToggle>;
      let component: NestedCdkTreeAppWithToggle;

      beforeEach(() => {
        configureCdkTreeTestingModule([NestedCdkTreeAppWithToggle]);
        fixture = TestBed.createComponent(NestedCdkTreeAppWithToggle);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('should expand/collapse the node multiple times', () => {
        component.toggleRecursively = false;
        let data = dataSource.data;
        const child = dataSource.addChild(data[1], false);
        dataSource.addChild(child, false);

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

        (getNodes(treeElement)[1] as HTMLElement).click();
        fixture.detectChanges();

        expect(component.treeControl.expansionModel.selected.length)
          .toBe(1, `Expect node expanded`);
        expectNestedTreeToMatch(treeElement,
          [`topping_1 - cheese_1 + base_1`],
          [`topping_2 - cheese_2 + base_2`],
          [_, `topping_4 - cheese_4 + base_4`],
          [`topping_3 - cheese_3 + base_3`]);
      });

      it('should expand/collapse the node recursively', () => {
        let data = dataSource.data;
        const child = dataSource.addChild(data[1], false);
        dataSource.addChild(child, false);
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

    describe('with array data source', () => {
      let fixture: ComponentFixture<ArrayDataSourceNestedCdkTreeApp>;
      let component: ArrayDataSourceNestedCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([ArrayDataSourceNestedCdkTreeApp]);
        fixture = TestBed.createComponent(ArrayDataSourceNestedCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectNestedTreeToMatch(treeElement,
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`]);

        dataSource.addChild(data[1], false);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        expectNestedTreeToMatch(treeElement,
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `[topping_4] - [cheese_4] + [base_4]`],
          [`[topping_3] - [cheese_3] + [base_3]`]);
      });
    });

    describe('with observable data source', () => {
      let fixture: ComponentFixture<ObservableDataSourceNestedCdkTreeApp>;
      let component: ObservableDataSourceNestedCdkTreeApp;

      beforeEach(() => {
        configureCdkTreeTestingModule([ObservableDataSourceNestedCdkTreeApp]);
        fixture = TestBed.createComponent(ObservableDataSourceNestedCdkTreeApp);
        fixture.detectChanges();

        component = fixture.componentInstance;
        dataSource = component.dataSource as FakeDataSource;
        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');
      });

      it('with the right data', () => {
        expect(dataSource.data.length).toBe(3);

        let data = dataSource.data;
        expectNestedTreeToMatch(treeElement,
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [`[topping_3] - [cheese_3] + [base_3]`]);

        dataSource.addChild(data[1], false);
        fixture.detectChanges();

        treeElement = fixture.nativeElement.querySelector('cdk-tree');
        expectNestedTreeToMatch(treeElement,
          [`[topping_1] - [cheese_1] + [base_1]`],
          [`[topping_2] - [cheese_2] + [base_2]`],
          [_, `[topping_4] - [cheese_4] + [base_4]`],
          [`[topping_3] - [cheese_3] + [base_3]`]);
      });
    });

    describe('with trackBy', () => {
      let fixture: ComponentFixture<NestedCdkTreeAppWithTrackBy>;
      let component: NestedCdkTreeAppWithTrackBy;

      function createTrackByTestComponent(trackByStrategy: 'reference' | 'property' | 'index') {
        configureCdkTreeTestingModule([NestedCdkTreeAppWithTrackBy]);
        fixture = TestBed.createComponent(NestedCdkTreeAppWithTrackBy);
        component = fixture.componentInstance;
        component.trackByStrategy = trackByStrategy;
        dataSource = component.dataSource as FakeDataSource;
        fixture.detectChanges();

        tree = component.tree;
        treeElement = fixture.nativeElement.querySelector('cdk-tree');

        // Each node receives an attribute 'initialIndex' the element's original place
        getNodes(treeElement).forEach((node: Element, index: number) => {
          node.setAttribute('initialIndex', index.toString());
        });

        // Prove that the attributes match their indicies
        const initialNodes = getNodes(treeElement);
        expect(initialNodes.length).toBe(3);
        initialNodes.forEach((node, index) => {
          expect(node.getAttribute('initialIndex')).toBe(`${index}`);
        });

        const parent = dataSource.data[0];
        dataSource.addChild(parent, false);
        dataSource.addChild(parent, false);
        dataSource.addChild(parent, false);
        getNodes(initialNodes[0]).forEach((node: Element, index: number) => {
          node.setAttribute('initialIndex', `c${index}`);
        });
        getNodes(initialNodes[0]).forEach((node, index) => {
          expect(node.getAttribute('initialIndex')).toBe(`c${index}`);
        });
      }

      function mutateChildren(parent: TestData) {
        // Swap first and second data in data array
        const copiedData = parent.children.slice();
        const temp = copiedData[0];
        copiedData[0] = copiedData[1];
        copiedData[1] = temp;

        // Remove the third element
        copiedData.splice(2, 1);

        // Add new data
        parent.children = copiedData;
        parent.observableChildren.next(copiedData);
        component.dataSource.addChild(parent, false);
      }

      it('should add/remove/move children nodes with reference-based trackBy', () => {
        createTrackByTestComponent('reference');
        mutateChildren(dataSource.data[0]);

        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(6);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('0');

        // Expect that the first and second child nodes were swapped and that the last node is new
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('c1');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe('c0');
        expect(changedNodes[3].getAttribute('initialIndex')).toBe(null);

        expect(changedNodes[4].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[5].getAttribute('initialIndex')).toBe('2');
      });

      it('should add/remove/move children nodes with property-based trackBy', () => {
        createTrackByTestComponent('property');
        mutateChildren(dataSource.data[0]);

        // Change each item reference to show that the trackby is checking the item properties.
        // Otherwise this would cause them all to be removed/added.
        dataSource.data[0].observableChildren.next(dataSource.data[0].children
          .map(item => new TestData(item.pizzaTopping, item.pizzaCheese, item.pizzaBase)));

        // Expect that the first and second nodes were swapped and that the last node is new
        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(6);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('0');

        // Expect that the first and second child nodes were swapped and that the last node is new
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('c1');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe('c0');
        expect(changedNodes[3].getAttribute('initialIndex')).toBe(null);

        expect(changedNodes[4].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[5].getAttribute('initialIndex')).toBe('2');
      });

      it('should add/remove/move children nodes with index-based trackBy', () => {
        createTrackByTestComponent('index');
        mutateChildren(dataSource.data[0]);

        // Change each item reference to show that the trackby is checking the index.
        // Otherwise this would cause them all to be removed/added.
        dataSource.data[0].observableChildren.next(dataSource.data[0].children
          .map(item => new TestData(item.pizzaTopping, item.pizzaCheese, item.pizzaBase)));

        const changedNodes = getNodes(treeElement);
        expect(changedNodes.length).toBe(6);
        expect(changedNodes[0].getAttribute('initialIndex')).toBe('0');

        // Expect first two children to be the same since they were swapped
        // but indicies are consistent.
        // The third element was removed and caught by the tree so it was removed before another
        // item was added, so it is without an initial index.
        expect(changedNodes[1].getAttribute('initialIndex')).toBe('c0');
        expect(changedNodes[2].getAttribute('initialIndex')).toBe('c1');
        expect(changedNodes[3].getAttribute('initialIndex')).toBe(null);

        expect(changedNodes[4].getAttribute('initialIndex')).toBe('1');
        expect(changedNodes[5].getAttribute('initialIndex')).toBe('2');
      });
    });

    it('should throw an error when missing function in nested tree', fakeAsync(() => {
      configureCdkTreeTestingModule([NestedCdkErrorTreeApp]);
      expect(() => {
        try {
          TestBed.createComponent(NestedCdkErrorTreeApp).detectChanges();
          flush();
        } catch {
          flush();
        } finally {
          flush();
        }
      }).toThrowError(getTreeControlFunctionsMissingError().message);
    }));

    it('should throw an error when missing function in flat tree', fakeAsync(() => {
      configureCdkTreeTestingModule([FlatCdkErrorTreeApp]);
      expect(() => {
        try {
          TestBed.createComponent(FlatCdkErrorTreeApp).detectChanges();
          flush();
        } catch {
          flush();
        }
      }).toThrowError(getTreeControlFunctionsMissingError().message);
    }));
  });

  describe('with depth', () => {
    let fixture: ComponentFixture<DepthNestedCdkTreeApp>;
    let component: DepthNestedCdkTreeApp;

    beforeEach(() => {
      configureCdkTreeTestingModule([DepthNestedCdkTreeApp]);
      fixture = TestBed.createComponent(DepthNestedCdkTreeApp);
      fixture.detectChanges();

      component = fixture.componentInstance;
      dataSource = component.dataSource as FakeDataSource;
      tree = component.tree;
      treeElement = fixture.nativeElement.querySelector('cdk-tree');
    });

    it('should have correct depth for nested tree', () => {
      let data = dataSource.data;
      const child = dataSource.addChild(data[1], false);
      dataSource.addChild(child, false);

      fixture.detectChanges();

      const depthElements = Array.from(treeElement.querySelectorAll('.tree-test-level')!);
      const expectedLevels = ['0', '0', '1', '2', '0'];
      depthElements.forEach((element, index) => {
        const actualLevel = element.textContent!.trim();
        expect(actualLevel).toBe(expectedLevels[index]);
      });
      expect(depthElements.length).toBe(5);
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

  constructor(pizzaTopping: string, pizzaCheese: string, pizzaBase: string, level: number = 1) {
    this.pizzaTopping = pizzaTopping;
    this.pizzaCheese = pizzaCheese;
    this.pizzaBase = pizzaBase;
    this.level = level;
    this.children = [];
    this.observableChildren = new BehaviorSubject<TestData[]>(this.children);
  }
}

class FakeDataSource extends DataSource<TestData> {
  dataIndex = 0;
  isConnected = false;

  _dataChange = new BehaviorSubject<TestData[]>([]);
  get data() { return this._dataChange.getValue(); }
  set data(data: TestData[]) { this._dataChange.next(data); }

  constructor(public treeControl: TreeControl<TestData>) {
    super();
    for (let i = 0; i < 3; i++) {
      this.addData();
    }
  }

  connect(collectionViewer: CollectionViewer): Observable<TestData[]> {
    this.isConnected = true;

    return combineLatest(this._dataChange, collectionViewer.viewChange).pipe(map(([data]) => {
      this.treeControl.dataNodes = data;
      return data;
    }));
  }

  disconnect() {
    this.isConnected = false;
  }

  addChild(parent: TestData, isFlat: boolean = true) {
    const nextIndex = ++this.dataIndex;
    const child = new TestData(`topping_${nextIndex}`, `cheese_${nextIndex}`, `base_${nextIndex}`,
      parent.level + 1);
    parent.children.push(child);
    if (isFlat) {
      let copiedData = this.data.slice();
      copiedData.splice(this.data.indexOf(parent) + 1, 0, child);
      this.data = copiedData;
    } else {
      parent.observableChildren.next(parent.children);
    }
    return child;
  }

  addData(level: number = 1) {
    const nextIndex = ++this.dataIndex;

    let copiedData = this.data.slice();
    copiedData.push(
      new TestData(`topping_${nextIndex}`, `cheese_${nextIndex}`, `base_${nextIndex}`, level));

    this.data = copiedData;
  }
}

function getNodes(treeElement: Element): HTMLElement[] {
  return Array.from(treeElement.querySelectorAll('.cdk-tree-node'));
}

function expectFlatTreeToMatch(treeElement: Element,
                               expectedPaddingIndent = 28,
                               expectedPaddingUnits = 'px',
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
    const expectedLevel = `${(expectedNode.length) * expectedPaddingIndent}${expectedPaddingUnits}`;
    if (actualLevel != expectedLevel) {
      missedExpectations.push(
        `Expected node level to be ${expectedLevel} but was ${actualLevel}`);
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
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="indent"
                     cdkTreeNodeToggle>
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </cdk-tree-node>
    </cdk-tree>
  `
})
class SimpleCdkTreeApp {
  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);
  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);
  indent: number | string = 28;

  @ViewChild(CdkTree) tree: CdkTree<TestData>;

}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `
})
class NestedCdkTreeApp {
  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `
})
class StaticNestedCdkTreeApp {
  getChildren = (node: TestData) => node.children;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource;

  @ViewChild(CdkTree) tree: CdkTree<TestData>;

  constructor() {
    const dataSource = new FakeDataSource(this.treeControl);
    const data = dataSource.data;
    const child = dataSource.addChild(data[1], false);
    dataSource.addChild(child, false);
    dataSource.addChild(child, false);

    this.dataSource = dataSource;
  }
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
       <cdk-nested-tree-node *cdkTreeNodeDef="let node; when: isSecondNode" class="customNodeClass">
                     >> {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `
})
class WhenNodeNestedCdkTreeApp {
  isSecondNode = (_: number, node: TestData) => node.pizzaBase.indexOf('2') > 0;

  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}


@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass"
                     cdkTreeNodePadding
                     cdkTreeNodeToggle [cdkTreeNodeToggleRecursive]="toggleRecursively">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </cdk-tree-node>
    </cdk-tree>
  `
})
class CdkTreeAppWithToggle {
  toggleRecursively: boolean = true;

  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);
  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="customNodeClass"
                            cdkTreeNodeToggle [cdkTreeNodeToggleRecursive]="toggleRecursively">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
        <div *ngIf="treeControl.isExpanded(node)">
          <ng-template cdkTreeNodeOutlet></ng-template>
        </div>
      </cdk-nested-tree-node>
    </cdk-tree>
  `
})
class NestedCdkTreeAppWithToggle {
  toggleRecursively: boolean = true;

  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);
  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="28"
                     cdkTreeNodeToggle>
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </cdk-tree-node>
       <cdk-tree-node *cdkTreeNodeDef="let node; when: isOddNode" class="customNodeClass"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="28"
                     cdkTreeNodeToggle>
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
      </cdk-tree-node>
    </cdk-tree>
  `
})
class WhenNodeCdkTreeApp {
  isOddNode = (_: number, node: TestData) => node.level % 2 === 1;
  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataArray" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="28"
                     cdkTreeNodeToggle>
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
      </cdk-tree-node>
    </cdk-tree>
  `
})
class ArrayDataSourceCdkTreeApp {
  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataArray() {
    return this.dataSource.data;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataObservable" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node"
                     cdkTreeNodePadding [cdkTreeNodePaddingIndent]="28"
                     cdkTreeNodeToggle>
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
      </cdk-tree-node>
    </cdk-tree>
  `
})
class ObservableDataSourceCdkTreeApp {
  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataObservable() {
    return this.dataSource._dataChange;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataArray" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node">
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `
})
class ArrayDataSourceNestedCdkTreeApp {

  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataArray() {
    return this.dataSource.data;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataObservable" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node">
                     [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `
})
class ObservableDataSourceNestedCdkTreeApp {

  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataObservable() {
    return this.dataSource._dataChange;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `
})
class NestedCdkErrorTreeApp {
  getLevel = (node: TestData) => node.level;

  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);

  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

class FakeTreeControl extends BaseTreeControl<TestData> {
  getDescendants(_: TestData): TestData[] {
    return this.dataNodes;
  }

  expandAll(): void {
    // No op
  }
}
@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-tree-node>
    </cdk-tree>
  `
})
class FlatCdkErrorTreeApp {

  getLevel = (node: TestData) => node.level;

  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FakeTreeControl();

  dataSource: FakeDataSource | null = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}


@Component({
  template: `
    <cdk-tree [dataSource]="dataArray" [treeControl]="treeControl">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node; let level = level">
          <span class="tree-test-level">{{level}}</span>
           [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `
})
class DepthNestedCdkTreeApp {

  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataArray() {
    return this.dataSource.data;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataSource" [treeControl]="treeControl" [trackBy]="trackByFn">
      <cdk-tree-node *cdkTreeNodeDef="let node" class="customNodeClass">
                     {{node.pizzaTopping}} - {{node.pizzaCheese}} + {{node.pizzaBase}}
      </cdk-tree-node>
    </cdk-tree>
  `
})
class CdkTreeAppWithTrackBy {
  trackByStrategy: 'reference' | 'property' | 'index' = 'reference';

  trackByFn: TrackByFunction<TestData> = (index, item) => {
    switch (this.trackByStrategy) {
      case 'reference': return item;
      case 'property': return item.pizzaBase;
      case 'index': return index;
    }
  }

  getLevel = (node: TestData) => node.level;
  isExpandable = (node: TestData) => node.children.length > 0;

  treeControl: TreeControl<TestData> = new FlatTreeControl(this.getLevel, this.isExpandable);
  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}

@Component({
  template: `
    <cdk-tree [dataSource]="dataArray" [treeControl]="treeControl" [trackBy]="trackByFn">
      <cdk-nested-tree-node *cdkTreeNodeDef="let node">
           [{{node.pizzaTopping}}] - [{{node.pizzaCheese}}] + [{{node.pizzaBase}}]
         <ng-template cdkTreeNodeOutlet></ng-template>
      </cdk-nested-tree-node>
    </cdk-tree>
  `
})
class NestedCdkTreeAppWithTrackBy {
  trackByStrategy: 'reference' | 'property' | 'index' = 'reference';

  trackByFn: TrackByFunction<TestData> = (index, item) => {
    switch (this.trackByStrategy) {
      case 'reference': return item;
      case 'property': return item.pizzaBase;
      case 'index': return index;
    }
  }

  getChildren = (node: TestData) => node.observableChildren;

  treeControl: TreeControl<TestData> = new NestedTreeControl(this.getChildren);

  dataSource: FakeDataSource = new FakeDataSource(this.treeControl);

  get dataArray() {
    return this.dataSource.data;
  }

  @ViewChild(CdkTree) tree: CdkTree<TestData>;
}
