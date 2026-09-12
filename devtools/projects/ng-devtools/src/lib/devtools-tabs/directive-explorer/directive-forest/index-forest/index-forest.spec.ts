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
    const child1_1: DevToolsNode & {hasNativeElement?: boolean} = {
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
      static: false,
    };
    const child1_2: DevToolsNode & {hasNativeElement?: boolean} = {
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
      static: false,
    };
    const parent1: DevToolsNode & {hasNativeElement?: boolean} = {
      tagName: 'Parent1',
      directives: [],
      component: {
        isElement: false,
        name: 'Cmp1',
        id: 1,
      },
      children: [child1_1, child1_2],
      changeDetection: 'ng-on-push',
      controlFlowBlock: null,
      hasNativeElement: true,
      static: false,
    };

    const child2_1: DevToolsNode & {hasNativeElement?: boolean} = {
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
      static: false,
    };
    const child2_2: DevToolsNode & {hasNativeElement?: boolean} = {
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
      static: false,
    };
    const parent2: DevToolsNode & {hasNativeElement?: boolean} = {
      tagName: 'Parent2',
      directives: [],
      component: null,
      children: [child2_1, child2_2],
      changeDetection: 'ng-eager',
      controlFlowBlock: null,
      hasNativeElement: true,
      static: false,
    };

    expect(indexForest([parent1, parent2])).toEqual([
      {
        tagName: 'Parent1',
        directives: [],
        position: [0],
        hydration: undefined,
        original: parent1,
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
            original: child1_1,
            children: [],
            changeDetection: 'ng-on-push',
            controlFlowBlock: null,
            hasNativeElement: true,
            injector: undefined,
            static: false,
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
            original: child1_2,
            children: [],
            controlFlowBlock: null,
            changeDetection: 'ng-on-push',
            hasNativeElement: true,
            injector: undefined,
            static: false,
          },
        ],
        controlFlowBlock: null,
        changeDetection: 'ng-on-push',
        hasNativeElement: true,
        injector: undefined,
        static: false,
      },
      {
        tagName: 'Parent2',
        directives: [],
        component: null,
        position: [1],
        hydration: undefined,
        original: parent2,
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
            original: child2_1,
            children: [],
            changeDetection: 'ng-eager',
            controlFlowBlock: null,
            hasNativeElement: true,
            injector: undefined,
            static: false,
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
            original: child2_2,
            changeDetection: 'ng-eager',
            controlFlowBlock: null,
            hasNativeElement: true,
            injector: undefined,
            static: false,
          },
        ],
        changeDetection: 'ng-eager',
        controlFlowBlock: null,
        hasNativeElement: true,
        injector: undefined,
        static: false,
      },
    ]);
  });
});
