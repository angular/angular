/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppEntry} from '../record-formatter';
import {NESTED_FORMATTED_FLAMEGRAPH_RECORD, NESTED_RECORD, SIMPLE_FORMATTED_FLAMEGRAPH_RECORD, SIMPLE_RECORD,} from '../record-formatter-spec-constants';

import {FlamegraphFormatter, FlamegraphNode} from './flamegraph-formatter';

const formatter = new FlamegraphFormatter();

describe('addFrame cases', () => {
  let entry: AppEntry<FlamegraphNode>;
  let timeSpent;

  beforeEach(() => {
    entry = {
      app: [],
      timeSpent: 0,
      source: '',
    };
  });

  it('add frame for simple case', () => {
    timeSpent = formatter.addFrame(entry.app, SIMPLE_RECORD);
    expect(timeSpent).toBe(17);
    expect(entry.app).toEqual(SIMPLE_FORMATTED_FLAMEGRAPH_RECORD);
  });

  it('add frame for deeply nested records', () => {
    timeSpent = formatter.addFrame(entry.app, NESTED_RECORD);
    expect(timeSpent).toBe(21);
    expect(entry.app).toEqual(NESTED_FORMATTED_FLAMEGRAPH_RECORD);
  });
});
