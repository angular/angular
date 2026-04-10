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
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  hydration: null,
  controlFlowBlock: null,

  children: [
    {
      children: [],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      hydration: null,
      nativeElement: document.createElement('bar'),
      controlFlowBlock: null,
    },
  ],
  nativeElement: document.createElement('foo'),
};

const tree2: DevToolsNode = {
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  hydration: null,
  controlFlowBlock: null,

  children: [
    {
      children: [],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      hydration: null,
      nativeElement: document.createElement('bar'),
      controlFlowBlock: null,
    },
    {
      children: [],
      component: {
        id: 3,
        isElement: false,
        name: 'qux',
      },
      directives: [],
      hydration: null,
      controlFlowBlock: null,
    },
  ],
  nativeElement: document.createElement('foo'),
};

const tree3: DevToolsNode = {
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  hydration: null,
  controlFlowBlock: null,
  children: [],
  nativeElement: document.createElement('foo'),
};

const tree4: DevToolsNode = {
  hydration: null,
  controlFlowBlock: null,
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  children: [],
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
    const result = dataSource.update([tree1]);
    expect(result.movedItems.length).toBe(0);
    expect(result.newItems.length).toBe(2);

    const updatedResult = dataSource.update([tree2]);
    expect(updatedResult.movedItems.length).toBe(0);
    expect(updatedResult.removedItems.length).toBe(0);
    expect(updatedResult.newItems.length).toBe(1);
    expect(updatedResult.newItems[0].name).toBe('qux');
  });
});
