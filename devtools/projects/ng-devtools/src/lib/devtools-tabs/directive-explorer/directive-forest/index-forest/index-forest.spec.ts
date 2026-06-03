/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {indexForest} from './index';
import {DevToolsNode} from '../../../../../../../protocol';

describe('indexForest', () => {
  it('should work with an empty forest', () => {
    expect(indexForest([])).toEqual([]);
  });

  it('should index a forest', () => {
    expect(
      indexForest([
        {
          tagName: 'Parent1',
          directives: [],
          component: {
            isElement: false,
            name: 'Cmp1',
            id: 1,
          },
          children: [
            {
              tagName: 'Child1_1',
              directives: [
                {
                  name: 'Dir1',
                  id: 1,
                },
                {
                  name: 'Dir2',
                  id: 1,
                },
              ],
              component: null,
              children: [],
              changeDetection: 'ng-on-push',
              controlFlowBlock: null,
              hasNativeElement: true,
            } as DevToolsNode & {hasNativeElement?: boolean},
            {
              tagName: 'Child1_2',
              directives: [],
              component: {
                isElement: false,
                name: 'Cmp2',
                id: 1,
              },
              children: [],
              changeDetection: 'ng-on-push',
              controlFlowBlock: null,
              hasNativeElement: true,
            } as DevToolsNode & {hasNativeElement?: boolean},
          ],
          changeDetection: 'ng-on-push',
          controlFlowBlock: null,
          hasNativeElement: true,
        },
        {
          tagName: 'Parent2',
          directives: [],
          component: null,
          children: [
            {
              tagName: 'Child2_1',
              directives: [
                {
                  name: 'Dir3',
                  id: 1,
                },
              ],
              component: null,
              children: [],
              changeDetection: 'ng-eager',
              controlFlowBlock: null,
              hasNativeElement: true,
            } as DevToolsNode & {hasNativeElement?: boolean},
            {
              tagName: 'Child2_2',
              directives: [
                {
                  name: 'Dir4',
                  id: 1,
                },
                {
                  name: 'Dir5',
                  id: 1,
                },
              ],
              component: null,
              children: [],
              changeDetection: 'ng-eager',
              controlFlowBlock: null,
              hasNativeElement: true,
            } as DevToolsNode & {hasNativeElement?: boolean},
          ],
          changeDetection: 'ng-eager',
          controlFlowBlock: null,
          hasNativeElement: true,
        },
      ]),
    ).toEqual([
      {
        tagName: 'Parent1',
        directives: [],
        position: [0],
        hydration: undefined,
        component: {
          isElement: false,
          name: 'Cmp1',
          id: 1,
        },
        children: [
          {
            tagName: 'Child1_1',
            position: [0, 0],
            directives: [
              {
                name: 'Dir1',
                id: 1,
              },
              {
                name: 'Dir2',
                id: 1,
              },
            ],
            component: null,
            hydration: undefined,
            children: [],
            changeDetection: 'ng-on-push',
            controlFlowBlock: null,
            hasNativeElement: true,
            injector: undefined,
          },
          {
            tagName: 'Child1_2',
            directives: [],
            position: [0, 1],
            component: {
              isElement: false,
              name: 'Cmp2',
              id: 1,
            },
            hydration: undefined,
            children: [],
            controlFlowBlock: null,
            changeDetection: 'ng-on-push',

            hasNativeElement: true,
            injector: undefined,
          },
        ],
        controlFlowBlock: null,
        changeDetection: 'ng-on-push',
        hasNativeElement: true,
        injector: undefined,
      },
      {
        tagName: 'Parent2',
        directives: [],
        component: null,
        position: [1],
        hydration: undefined,
        children: [
          {
            tagName: 'Child2_1',
            position: [1, 0],
            directives: [
              {
                name: 'Dir3',
                id: 1,
              },
            ],
            component: null,
            hydration: undefined,
            children: [],
            changeDetection: 'ng-eager',
            controlFlowBlock: null,
            hasNativeElement: true,
            injector: undefined,
          },
          {
            tagName: 'Child2_2',
            position: [1, 1],
            directives: [
              {
                name: 'Dir4',
                id: 1,
              },
              {
                name: 'Dir5',
                id: 1,
              },
            ],
            component: null,
            children: [],
            hydration: undefined,
            changeDetection: 'ng-eager',
            controlFlowBlock: null,
            hasNativeElement: true,
            injector: undefined,
          },
        ],
        changeDetection: 'ng-eager',
        controlFlowBlock: null,
        hasNativeElement: true,
        injector: undefined,
      },
    ]);
  });
});
