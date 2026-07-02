/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FlatNode} from './component-data-source';
import {getDirectivesArrayString, getFullNodeNameString} from './directive-forest-utils';

describe('directive-forest-utils', () => {
  describe('getDirectivesArrayString', () => {
    it('should return an empty string, if no directives', () => {
      const output = getDirectivesArrayString({} as FlatNode);

      expect(output).toEqual('');
    });

    it('should return a single directive string', () => {
      const output = getDirectivesArrayString({
        directives: ['Foo'],
      } as FlatNode);

      expect(output).toEqual('[Foo]');
    });

    it('should return multiple directives string', () => {
      const output = getDirectivesArrayString({
        directives: ['Foo', 'Bar'],
      } as FlatNode);

      expect(output).toEqual('[Foo][Bar]');
    });
  });

  describe('getFullNodeNameString', () => {
    it('should return a simple component name string', () => {
      const output = getFullNodeNameString({
        name: 'app-test',
        original: {component: {}},
      } as FlatNode);

      expect(output).toEqual('app-test');
    });

    it('should enclose name in a tag, if an element', () => {
      const output = getFullNodeNameString({
        name: 'app-element',
        original: {
          component: {
            isElement: true,
          },
        },
      } as FlatNode);

      expect(output).toEqual('<app-element/>');
    });

    it('should return component name with directives string, if any', () => {
      const output = getFullNodeNameString({
        name: 'app-test',
        directives: ['Foo', 'Bar'],
        original: {component: {}},
      } as FlatNode);

      expect(output).toEqual('app-test[Foo][Bar]');
    });
  });
});
