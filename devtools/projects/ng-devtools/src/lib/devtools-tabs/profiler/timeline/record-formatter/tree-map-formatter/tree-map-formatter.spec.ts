/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppEntry} from '../record-formatter';
import {SIMPLE_FORMATTED_TREE_MAP_RECORD, SIMPLE_RECORD} from '../record-formatter-spec-constants';

import {TreeMapFormatter, TreeMapNode} from './tree-map-formatter';

const formatter = new TreeMapFormatter();

describe('addFrame cases', () => {
  let entry: AppEntry<TreeMapNode>;

  beforeEach(() => {
    entry = {
      app: [],
      timeSpent: 0,
      source: '',
    };
  });

  it('add frame for simple case', () => {
    formatter.addFrame(entry.app, SIMPLE_RECORD);
    expect(entry.app).toEqual(SIMPLE_FORMATTED_TREE_MAP_RECORD);
  });
});
