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
          directives: [],
          hydration: null,
          component: {
            isElement: false,
            name: 'Cmp1',
            id: 1,
          },
          children: [
            {
              hydration: null,
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
              directives: [],
              hydration: null,
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
          directives: [],
          component: null,
          hydration: null,
          children: [
            {
              directives: [
                {
                  name: 'Dir3',
                  id: 1,
                },
              ],
              hydration: null,
              component: null,
              children: [],
              changeDetection: 'ng-eager',
              controlFlowBlock: null,
              hasNativeElement: true,
            } as DevToolsNode & {hasNativeElement?: boolean},
            {
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
              hydration: null,
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
        directives: [],
        position: [0],
        hydration: null,
        component: {
          isElement: false,
          name: 'Cmp1',
          id: 1,
        },
        children: [
          {
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
            hydration: null,
            children: [],
            changeDetection: 'ng-on-push',
            controlFlowBlock: null,
            hasNativeElement: true,
          },
          {
            directives: [],
            position: [0, 1],
            component: {
              isElement: false,
              name: 'Cmp2',
              id: 1,
            },
            hydration: null,
            children: [],
            controlFlowBlock: null,
            changeDetection: 'ng-on-push',

            hasNativeElement: true,
          },
        ],
        controlFlowBlock: null,
        changeDetection: 'ng-on-push',
        hasNativeElement: true,
      },
      {
        directives: [],
        component: null,
        position: [1],
        hydration: null,
        children: [
          {
            position: [1, 0],
            directives: [
              {
                name: 'Dir3',
                id: 1,
              },
            ],
            component: null,
            hydration: null,
            children: [],
            changeDetection: 'ng-eager',
            controlFlowBlock: null,
            hasNativeElement: true,
          },
          {
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
            hydration: null,
            changeDetection: 'ng-eager',
            controlFlowBlock: null,
            hasNativeElement: true,
          },
        ],
        changeDetection: 'ng-eager',
        controlFlowBlock: null,
        hasNativeElement: true,
      },
    ]);
  });
});
