import { FlatTreeControl } from '@angular/cdk/tree';
import { ComponentDataSource, FlatNode } from './component-data-source';
import { DevToolsNode } from 'protocol';

const tree1: DevToolsNode = {
  element: 'app',
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  children: [
    {
      children: [],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      element: 'bar',
      nativeElement: document.createElement('bar'),
    },
  ],
  nativeElement: document.createElement('foo'),
};

const tree2: DevToolsNode = {
  element: 'app',
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  children: [
    {
      children: [],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      element: 'bar',
      nativeElement: document.createElement('bar'),
    },
    {
      children: [],
      component: {
        id: 3,
        isElement: false,
        name: 'qux',
      },
      directives: [],
      element: 'qux',
      nativeElement: document.createElement('qux'),
    },
  ],
  nativeElement: document.createElement('foo'),
};

const tree3: DevToolsNode = {
  element: 'app',
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  children: [
    {
      children: [],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      element: '#comment',
      nativeElement: document.createComment('bar'),
    },
    {
      children: [],
      component: {
        id: 3,
        isElement: false,
        name: 'qux',
      },
      directives: [],
      element: '#comment',
      nativeElement: document.createComment('bar'),
    },
  ],
  nativeElement: document.createElement('foo'),
};

describe('ComponentDataSource', () => {
  let dataSource: ComponentDataSource;
  const treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  beforeEach(() => (dataSource = new ComponentDataSource(treeControl)));

  it('should return new and old items', () => {
    const result = dataSource.update([tree1], true);
    expect(result.movedItems.length).toBe(0);
    expect(result.newItems.length).toBe(2);

    const updatedResult = dataSource.update([tree2], true);
    expect(updatedResult.movedItems.length).toBe(0);
    expect(updatedResult.removedItems.length).toBe(0);
    expect(updatedResult.newItems.length).toBe(1);
    expect(updatedResult.newItems[0].name).toBe('qux');
  });

  it('should not return comment nodes when not requested', () => {
    const result = dataSource.update([tree3], false);
    expect(result.movedItems.length).toBe(0);
    expect(result.newItems.length).toBe(1);
    expect(result.newItems[0].name).toBe('app');
  });
});
