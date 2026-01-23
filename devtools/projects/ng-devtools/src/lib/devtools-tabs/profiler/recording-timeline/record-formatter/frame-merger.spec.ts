/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementProfile, ProfilerFrame} from '../../../../../../../protocol';

import {mergeFrames} from './frame-merger';

describe('mergeFrames', () => {
  it('should work with empty frames', () => {
    expect(mergeFrames([])).toBeNull();
  });

  it('should work with a single frame', () => {
    const frame: ProfilerFrame = {
      directives: [
        {
          children: [],
          directives: [
            {
              isComponent: false,
              isElement: false,
              lifecycle: {},
              outputs: {},
              name: 'Foo',
            },
          ],
          type: 'element',
        },
      ],
      duration: 5,
      source: 'foo',
    };
    const result = mergeFrames([frame]);

    expect(result).toEqual(frame);

    // Should be different reference
    expect(result).not.toBe(frame);
  });

  it('should merge frames when nesting matches', () => {
    const frame: ProfilerFrame = {
      directives: [
        {
          children: [],
          directives: [
            {
              isComponent: false,
              isElement: false,
              lifecycle: {},
              outputs: {},
              changeDetection: 10,
              name: 'Foo',
            },
          ],
          type: 'element',
        },
      ],
      duration: 5,
      source: 'foo',
    };
    const result = mergeFrames([frame, frame]);

    expect(result).toEqual({
      directives: [
        {
          children: [],
          directives: [
            {
              isComponent: false,
              isElement: false,
              lifecycle: {},
              outputs: {},
              changeDetection: 20,
              name: 'Foo',
            },
          ],
          type: 'element',
        },
      ],
      duration: 10,
      source: '',
    });
  });

  it('should merge frames when nesting does not match', () => {
    const frame: ProfilerFrame = {
      directives: [
        {
          children: [],
          directives: [
            {
              isComponent: false,
              isElement: false,
              lifecycle: {},
              outputs: {},
              changeDetection: 10,
              name: 'Foo',
            },
          ],
          type: 'element',
        },
      ],
      duration: 5,
      source: 'foo',
    };

    const frame2: ProfilerFrame = {
      directives: [
        {
          children: [
            {
              children: [],
              directives: [
                {
                  isComponent: false,
                  isElement: false,
                  lifecycle: {},
                  outputs: {},
                  changeDetection: 10,
                  name: 'Foo',
                },
              ],
              type: 'element',
            },
          ],
          directives: [
            {
              isComponent: false,
              isElement: false,
              lifecycle: {},
              outputs: {},
              changeDetection: 10,
              name: 'Foo',
            },
          ],
          type: 'element',
        },
      ],
      duration: 5,
      source: 'foo',
    };
    const result = mergeFrames([frame, frame2]);

    expect(result).toEqual({
      directives: [
        {
          children: [
            {
              children: [],
              directives: [
                {
                  isComponent: false,
                  isElement: false,
                  lifecycle: {},
                  outputs: {},
                  changeDetection: 10,
                  name: 'Foo',
                },
              ],
              type: 'element',
            },
          ],
          directives: [
            {
              isComponent: false,
              isElement: false,
              lifecycle: {},
              outputs: {},
              changeDetection: 20,
              name: 'Foo',
            },
          ],
          type: 'element',
        },
      ],
      duration: 10,
      source: '',
    });
  });
});
