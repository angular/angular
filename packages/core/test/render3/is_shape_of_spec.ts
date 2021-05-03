/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isShapeOf, ShapeOf} from './is_shape_of';

describe('isShapeOf', () => {
  const ShapeOfEmptyObject: ShapeOf<{}> = {};
  it('should not match for non objects', () => {
    expect(isShapeOf(null, ShapeOfEmptyObject)).toBeFalse();
    expect(isShapeOf(0, ShapeOfEmptyObject)).toBeFalse();
    expect(isShapeOf(1, ShapeOfEmptyObject)).toBeFalse();
    expect(isShapeOf(true, ShapeOfEmptyObject)).toBeFalse();
    expect(isShapeOf(false, ShapeOfEmptyObject)).toBeFalse();
    expect(isShapeOf(undefined, ShapeOfEmptyObject)).toBeFalse();
  });

  it('should match on empty object', () => {
    expect(isShapeOf({}, ShapeOfEmptyObject)).toBeTrue();
    expect(isShapeOf({extra: 'is ok'}, ShapeOfEmptyObject)).toBeTrue();
  });

  it('should match on shape', () => {
    expect(isShapeOf({required: 1}, {required: true})).toBeTrue();
    expect(isShapeOf({required: true, extra: 'is ok'}, {required: true})).toBeTrue();
  });

  it('should not match if missing property', () => {
    expect(isShapeOf({required: 1}, {required: true, missing: true})).toBeFalse();
    expect(isShapeOf({required: true, extra: 'is ok'}, {required: true, missing: true}))
        .toBeFalse();
  });
});