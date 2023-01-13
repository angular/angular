/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {indexForest} from './';

describe('indexForest', () => {
  it('should work with an empty forest', () => {
    expect(indexForest([])).toEqual([]);
  });

  it('should index a forest', () => {
    expect(indexForest([
      {
        element: 'Parent1',
        directives: [],
        component: {
          isElement: false,
          name: 'Cmp1',
          id: 1,
        },
        children: [
          {
            element: 'Child1_1',
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
          },
          {
            element: 'Child1_2',
            directives: [],
            component: {
              isElement: false,
              name: 'Cmp2',
              id: 1,
            },
            children: [],
          },
        ],
      },
      {
        element: 'Parent2',
        directives: [],
        component: null,
        children: [
          {
            element: 'Child2_1',
            directives: [
              {
                name: 'Dir3',
                id: 1,
              },
            ],
            component: null,
            children: [],
          },
          {
            element: 'Child2_2',
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
          },
        ],
      },
    ]))
        .toEqual([
          {
            element: 'Parent1',
            directives: [],
            position: [0],
            component: {
              isElement: false,
              name: 'Cmp1',
              id: 1,
            },
            children: [
              {
                element: 'Child1_1',
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
                children: [],
              },
              {
                element: 'Child1_2',
                directives: [],
                position: [0, 1],
                component: {
                  isElement: false,
                  name: 'Cmp2',
                  id: 1,
                },
                children: [],
              },
            ],
          },
          {
            element: 'Parent2',
            directives: [],
            component: null,
            position: [1],
            children: [
              {
                element: 'Child2_1',
                position: [1, 0],
                directives: [
                  {
                    name: 'Dir3',
                    id: 1,
                  },
                ],
                component: null,
                children: [],
              },
              {
                element: 'Child2_2',
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
              },
            ],
          },
        ]);
  });
});
