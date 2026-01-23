/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FlatTreeControl} from '@angular/cdk/tree';
import {DevToolsNode} from '../../../../../../../protocol';

import {ComponentDataSource, FlatNode} from '.';

const tree1: DevToolsNode = {
  element: 'app',
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  hydration: null,
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
      hydration: null,
      nativeElement: document.createElement('bar'),
      defer: null,
    },
  ],
  nativeElement: document.createElement('foo'),
  defer: null,
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
  hydration: null,
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
      hydration: null,
      nativeElement: document.createElement('bar'),
      defer: null,
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
      hydration: null,
      nativeElement: document.createElement('qux'),
      defer: null,
    },
  ],
  nativeElement: document.createElement('foo'),
  defer: null,
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
  hydration: null,
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
      hydration: null,
      defer: null,
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
      hydration: null,
      defer: null,
      nativeElement: document.createComment('bar'),
    },
  ],
  nativeElement: document.createElement('foo'),
  defer: null,
};

const tree4: DevToolsNode = {
  element: 'app',
  hydration: null,
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  children: [
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [],
                      component: {
                        id: 6,
                        isElement: false,
                        name: 'qux',
                      },
                      directives: [],
                      element: 'bar',
                      hydration: null,
                      defer: null,
                      nativeElement: document.createComment('bar'),
                    },
                  ],
                  component: {
                    id: 5,
                    isElement: false,
                    name: 'qux',
                  },
                  directives: [],
                  element: '#comment',
                  hydration: null,
                  defer: null,
                  nativeElement: document.createComment('bar'),
                },
              ],
              component: {
                id: 4,
                isElement: false,
                name: 'qux',
              },
              directives: [],
              element: '#comment',
              hydration: null,
              defer: null,
              nativeElement: document.createComment('bar'),
            },
          ],
          component: {
            id: 3,
            isElement: false,
            name: 'qux',
          },
          directives: [],
          element: '#comment',
          hydration: null,
          defer: null,
          nativeElement: document.createComment('bar'),
        },
      ],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      element: '#comment',
      hydration: null,
      nativeElement: document.createComment('bar'),
      defer: null,
    },
  ],
  defer: null,
  nativeElement: document.createElement('foo'),
};

describe('ComponentDataSource', () => {
  let dataSource: ComponentDataSource;
  const treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable,
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

  it('should not break nesting with nested comment nodes', () => {
    const result = dataSource.update([tree4], false);
    expect(result.newItems.length).toBe(2);
    expect(result.newItems[0].name).toBe('app');
    expect(result.newItems[1].name).toBe('qux');

    expect(result.newItems[0].level).toBe(0);
    expect(result.newItems[1].level).toBe(1);

    expect(result.newItems[1].position).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
