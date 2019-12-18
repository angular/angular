/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AttributeMarker} from '../../../src/core';
import {ProjectionAttributesBuilder} from '../../../src/render3/view/projection_attributes_builder';
import {expectAttributeValues} from './util';

describe('ProjectionAttributesBuilder', () => {
  it('should generate a projectAs selector value', () => {
    const b = new ProjectionAttributesBuilder(1, 2);

    b.setProjectAsSelector('.my-app');
    expectAttributeValues(b).toEqual([
      1,
      2,
      [AttributeMarker.ProjectAs, ['.my-app']],
    ]);

    b.setProjectAsSelector('.their-app');
    expectAttributeValues(b).toEqual([
      1,
      2,
      [AttributeMarker.ProjectAs, ['.their-app']],
    ]);
  });

  it('should generate a key/value attribute entries as its own sub array', () => {
    const b = new ProjectionAttributesBuilder(1, 2);
    b.registerAttribute('key1', 'value1');

    expectAttributeValues(b).toEqual([1, 2, ['key1', 'value1']]);

    b.registerAttribute('key2', 'value2');
    expectAttributeValues(b).toEqual([
      1,
      2,
      ['key1', 'value1', 'key2', 'value2'],
    ]);
  });

  it('should generate key/value and projectAs attribute values', () => {
    const b = new ProjectionAttributesBuilder(1, 2);
    b.registerAttribute('key1', 'value1');
    b.registerAttribute('key2', 'value2');
    b.setProjectAsSelector('.my-selector');

    expectAttributeValues(b).toEqual([
      1,
      2,
      ['key1', 'value1', 'key2', 'value2', AttributeMarker.ProjectAs, ['.my-selector']],
    ]);
  });
});
