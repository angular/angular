/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {of} from 'rxjs';

import {DevToolsNode} from '../../../../../../../protocol';

import {ComponentDataSource, FlatNode} from '.';
import {ExpansionModel} from '../expansion-model';

const tree1: DevToolsNode = {
  tagName: 'app',
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  controlFlowBlock: null,
  static: false,

  children: [
    {
      children: [],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      tagName: 'bar',
      nativeElement: document.createElement('bar'),
      controlFlowBlock: null,
      static: false,
    },
  ],
  nativeElement: document.createElement('foo'),
};

const tree2: DevToolsNode = {
  tagName: 'app',
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  controlFlowBlock: null,
  static: false,

  children: [
    {
      children: [],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      tagName: 'bar',
      nativeElement: document.createElement('bar'),
      controlFlowBlock: null,
      static: false,
    },
    {
      children: [],
      component: {
        id: 3,
        isElement: false,
        name: 'qux',
      },
      directives: [],
      tagName: 'qux',
      controlFlowBlock: null,
      static: false,
    },
  ],
  nativeElement: document.createElement('foo'),
};

const tree3: DevToolsNode = {
  tagName: 'app',
  directives: [
    {
      id: 1,
      name: 'foo',
    },
  ],
  component: null,
  controlFlowBlock: null,
  static: false,

  children: [
    {
      children: [],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      tagName: '#comment',
      controlFlowBlock: null,
      static: false,
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
      tagName: '#comment',
      controlFlowBlock: null,
      static: false,
      nativeElement: document.createComment('bar'),
    },
  ],
  nativeElement: document.createElement('foo'),
};

const tree4: DevToolsNode = {
  tagName: 'app',
  controlFlowBlock: null,
  static: false,
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
                      tagName: 'bar',
                      controlFlowBlock: null,
                      static: false,
                      nativeElement: document.createComment('bar'),
                    },
                  ],
                  component: {
                    id: 5,
                    isElement: false,
                    name: 'qux',
                  },
                  directives: [],
                  tagName: '#comment',
                  controlFlowBlock: null,
                  static: false,
                  nativeElement: document.createComment('bar'),
                },
              ],
              component: {
                id: 4,
                isElement: false,
                name: 'qux',
              },
              directives: [],
              tagName: '#comment',
              controlFlowBlock: null,
              static: false,
              nativeElement: document.createComment('bar'),
            },
          ],
          component: {
            id: 3,
            isElement: false,
            name: 'qux',
          },
          directives: [],
          tagName: '#comment',
          controlFlowBlock: null,
          static: false,
          nativeElement: document.createComment('bar'),
        },
      ],
      component: {
        id: 2,
        isElement: false,
        name: 'bar',
      },
      directives: [],
      tagName: '#comment',
      nativeElement: document.createComment('bar'),
      controlFlowBlock: null,
      static: false,
    },
  ],
  nativeElement: document.createElement('foo'),
};

describe('ComponentDataSource', () => {
  let dataSource: ComponentDataSource;
  const expansionModel = new ExpansionModel<FlatNode>();

  beforeEach(() => (dataSource = new ComponentDataSource(expansionModel)));

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

  it('should only show the children of expanded nodes', () => {
    const expansionModel = new ExpansionModel<FlatNode>();
    const source = new ComponentDataSource(expansionModel);
    source.update([tree1], true);
    const [app, bar] = source.data;
    expect([app.level, bar.level]).toEqual([0, 1]);

    let visibleNodes: string[] = [];
    const subscription = source
      .connect({viewChange: of({start: 0, end: Number.MAX_VALUE})})
      .subscribe((nodes) => (visibleNodes = nodes.map((node) => node.name)));

    expect(visibleNodes).toEqual(['app']);

    expansionModel.expand(app);
    expect(visibleNodes).toEqual(['app', 'bar']);

    expansionModel.collapse(app);
    expect(visibleNodes).toEqual(['app']);

    subscription.unsubscribe();
  });
});
