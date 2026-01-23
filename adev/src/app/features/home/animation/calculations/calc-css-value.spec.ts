/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {calculateNextCssValue} from './calc-css-value';
import {ColorValue, NumericValue, StaticValue, TransformValue} from '../parser';

//
// Test values
//

const sourceNumeric: NumericValue = {
  type: 'numeric',
  values: [
    [100, 'px'],
    [250, 'px'],
  ],
};

const targetNumeric: NumericValue = {
  type: 'numeric',
  values: [
    [125, 'px'],
    [100, 'px'],
  ],
};

const sourceTransform: TransformValue = {
  type: 'transform',
  values: new Map([
    [
      'transform',
      [
        [100, 'px'],
        [10, 'px'],
      ],
    ],
    ['scale', [[0.5, '']]],
  ]),
};

const targetTransform: TransformValue = {
  type: 'transform',
  values: new Map([
    [
      'transform',
      [
        [150, 'px'],
        [5, 'px'],
      ],
    ],
    ['scale', [[1, '']]],
  ]),
};

const sourceColor: ColorValue = {
  type: 'color',
  value: ['rgb', 0, 0, 0],
};

const targetColor: ColorValue = {
  type: 'color',
  value: ['rgb', 255, 255, 255],
};

//
// Tests
//

describe('calculateNextCssValue', () => {
  it('should return the target value, if static', () => {
    const source: StaticValue = {
      type: 'static',
      value: '1px solid red',
    };
    const target: StaticValue = {
      type: 'static',
      value: '2px solid blue',
    };
    const next = calculateNextCssValue(source, target, 0.5);

    expect(next).toEqual(target);
  });

  it('should return the source numeric value, if the change rate is 0', () => {
    const next = calculateNextCssValue(sourceNumeric, targetNumeric, 0);

    expect(next).toEqual(sourceNumeric);
  });

  it('should return the target numeric value, if the change rate is 1', () => {
    const next = calculateNextCssValue(sourceNumeric, targetNumeric, 1);

    expect(next).toEqual(targetNumeric);
  });

  it('should calculate a numeric value', () => {
    const next = calculateNextCssValue(sourceNumeric, targetNumeric, 0.75);

    expect(next).toEqual({
      type: 'numeric',
      values: [
        [118.75, 'px'],
        [137.5, 'px'],
      ],
    });
  });

  it('should calculate a numeric value with negative number', () => {
    const next = calculateNextCssValue(
      {
        type: 'numeric',
        values: [
          [-50, 'px'],
          [0, '%'],
        ],
      },
      {
        type: 'numeric',
        values: [
          [50, 'px'],
          [-75, '%'],
        ],
      },
      0.5,
    );

    expect(next).toEqual({
      type: 'numeric',
      values: [
        [0, 'px'],
        [-37.5, '%'],
      ],
    });
  });

  it('should handle numeric zero values without units', () => {
    const source: NumericValue = {
      type: 'numeric',
      values: [[100, '%']],
    };
    const target: NumericValue = {
      type: 'numeric',
      values: [[0, '']],
    };
    const next = calculateNextCssValue(source, target, 0.25);

    expect(next).toEqual({
      type: 'numeric',
      values: [[75, '%']],
    });
  });

  it('should return the source transform value, if the change rate is 0', () => {
    const next = calculateNextCssValue(sourceTransform, targetTransform, 0);

    expect(next).toEqual(sourceTransform);
  });

  it('should return the target transform value, if the change rate is 1', () => {
    const next = calculateNextCssValue(sourceTransform, targetTransform, 1);

    expect(next).toEqual(targetTransform);
  });

  it('should calculate a transform value', () => {
    const next = calculateNextCssValue(sourceTransform, targetTransform, 0.75);

    expect(next).toEqual({
      type: 'transform',
      values: new Map([
        [
          'transform',
          [
            [137.5, 'px'],
            [6.25, 'px'],
          ],
        ],
        ['scale', [[0.875, '']]],
      ]),
    });
  });

  it('should calculate a transform value with negative numbers', () => {
    const source: TransformValue = {
      type: 'transform',
      values: new Map([
        [
          'translateX',
          [
            [-120, 'px'],
            [0, '%'],
          ],
        ],
      ]),
    };
    const target: TransformValue = {
      type: 'transform',
      values: new Map([
        [
          'translateX',
          [
            [0, 'px'],
            [-50, '%'],
          ],
        ],
      ]),
    };
    const next = calculateNextCssValue(source, target, 0.25);

    expect(next).toEqual({
      type: 'transform',
      values: new Map([
        [
          'translateX',
          [
            [-90, 'px'],
            [-12.5, '%'],
          ],
        ],
      ]),
    });
  });

  it('should handle transform zero values without units', () => {
    const source: TransformValue = {
      type: 'transform',
      values: new Map([['translateX', [[120, 'px']]]]),
    };
    const target: TransformValue = {
      type: 'transform',
      values: new Map([['translateX', [[0, '']]]]),
    };
    const next = calculateNextCssValue(source, target, 0.25);

    expect(next).toEqual({
      type: 'transform',
      values: new Map([['translateX', [[90, 'px']]]]),
    });
  });

  it('should return the source color value, if the change rate is 0', () => {
    const next = calculateNextCssValue(sourceColor, targetColor, 0);

    expect(next).toEqual(sourceColor);
  });

  it('should return the target color value, if the change rate is 1', () => {
    const next = calculateNextCssValue(sourceColor, targetColor, 1);

    expect(next).toEqual(targetColor);
  });

  it('should calculate a color value', () => {
    const next = calculateNextCssValue(sourceColor, targetColor, 0.75);

    expect(next).toEqual({
      type: 'color',
      value: ['rgb', 191, 191, 191],
    });
  });
});
