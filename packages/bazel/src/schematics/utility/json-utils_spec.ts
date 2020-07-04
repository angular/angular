/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {JsonAstObject, parseJsonAst} from '@angular-devkit/core';
import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {isJsonAstObject, removeKeyValueInAstObject, replacePropertyInAstObject} from './json-utils';

describe('JsonUtils', () => {
  let tree: UnitTestTree;
  beforeEach(() => {
    tree = new UnitTestTree(new HostTree());
  });

  describe('replacePropertyInAstObject', () => {
    it('should replace property', () => {
      const content = JSON.stringify({foo: {bar: 'baz'}});
      tree.create('tmp', content);
      const ast = parseJsonAst(content) as JsonAstObject;
      const recorder = tree.beginUpdate('tmp');
      replacePropertyInAstObject(recorder, ast, 'foo', [1, 2, 3]);
      tree.commitUpdate(recorder);
      const value = tree.readContent('tmp');
      expect(JSON.parse(value)).toEqual({
        foo: [1, 2, 3],
      });
      expect(value).toBe(`{"foo":[
  1,
  2,
  3
]}`);
    });

    it('should respect the indent parameter', () => {
      const content = JSON.stringify({hello: 'world'}, null, 2);
      tree.create('tmp', content);
      const ast = parseJsonAst(content) as JsonAstObject;
      const recorder = tree.beginUpdate('tmp');
      replacePropertyInAstObject(recorder, ast, 'hello', 'world!', 2);
      tree.commitUpdate(recorder);
      const value = tree.readContent('tmp');
      expect(JSON.parse(value)).toEqual({
        hello: 'world!',
      });
      expect(value).toBe(`{
  "hello": "world!"
}`);
    });

    it('should throw error if property is not found', () => {
      const content = JSON.stringify({});
      tree.create('tmp', content);
      const ast = parseJsonAst(content) as JsonAstObject;
      const recorder = tree.beginUpdate('tmp');
      expect(() => replacePropertyInAstObject(recorder, ast, 'foo', 'bar'))
          .toThrowError(`Property 'foo' does not exist in JSON object`);
    });
  });

  describe('removeKeyValueInAstObject', () => {
    it('should remove key-value pair', () => {
      const content = JSON.stringify({hello: 'world', foo: 'bar'});
      tree.create('tmp', content);
      const ast = parseJsonAst(content) as JsonAstObject;
      let recorder = tree.beginUpdate('tmp');
      removeKeyValueInAstObject(recorder, content, ast, 'foo');
      tree.commitUpdate(recorder);
      const tmp = tree.readContent('tmp');
      expect(JSON.parse(tmp)).toEqual({
        hello: 'world',
      });
      expect(tmp).toBe('{"hello":"world"}');
      recorder = tree.beginUpdate('tmp');
      const newContent = tree.readContent('tmp');
      removeKeyValueInAstObject(recorder, newContent, ast, 'hello');
      tree.commitUpdate(recorder);
      const value = tree.readContent('tmp');
      expect(JSON.parse(value)).toEqual({});
      expect(value).toBe('{}');
    });

    it('should be a noop if key is not found', () => {
      const content = JSON.stringify({foo: 'bar'});
      tree.create('tmp', content);
      const ast = parseJsonAst(content) as JsonAstObject;
      let recorder = tree.beginUpdate('tmp');
      expect(() => removeKeyValueInAstObject(recorder, content, ast, 'hello')).not.toThrow();
      tree.commitUpdate(recorder);
      const value = tree.readContent('tmp');
      expect(JSON.parse(value)).toEqual({foo: 'bar'});
      expect(value).toBe('{"foo":"bar"}');
    });
  });

  describe('isJsonAstObject', () => {
    it('should return true for an object', () => {
      const ast = parseJsonAst(JSON.stringify({}));
      expect(isJsonAstObject(ast)).toBe(true);
    });
    it('should return false for a non-object', () => {
      const ast = parseJsonAst(JSON.stringify([]));
      expect(isJsonAstObject(ast)).toBe(false);
    });
  });
});
