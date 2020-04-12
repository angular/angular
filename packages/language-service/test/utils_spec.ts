/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ng from '@angular/compiler';
import * as ts from 'typescript';

import {getDirectiveClassLike, getPathToNodeAtPosition} from '../src/utils';

describe('getDirectiveClassLike', () => {
  it('should return a directive class', () => {
    const sourceFile = ts.createSourceFile(
        'foo.ts', `
      @NgModule({
        declarations: [],
      })
      class AppModule {}
    `,
        ts.ScriptTarget.ES2015);
    const result = sourceFile.forEachChild(c => {
      const directive = getDirectiveClassLike(c);
      if (directive) {
        return directive;
      }
    });
    expect(result).toBeTruthy();
    const {decoratorId, classId} = result !;
    expect(decoratorId.kind).toBe(ts.SyntaxKind.Identifier);
    expect(decoratorId.text).toBe('NgModule');
    expect(classId.text).toBe('AppModule');
  });
});

describe('getPathToNodeAtPosition', () => {
  const html = '<div c></div>';
  const nodes: ng.Node[] = [];

  beforeAll(() => {
    const parser = new ng.HtmlParser();
    const {rootNodes, errors} = parser.parse(html, 'url');
    expect(errors.length).toBe(0);
    nodes.push(...rootNodes);
  });

  it('should capture element', () => {
    // Try to get a path to an element
    // <|div c></div>
    //  ^ cursor is here
    const position = html.indexOf('div');
    const path = getPathToNodeAtPosition(nodes, position);
    // There should be just 1 node in the path, the Element node
    expect(path.empty).toBe(false);
    expect(path.head instanceof ng.Element).toBe(true);
    expect(path.head).toBe(path.tail);
  });

  it('should capture attribute', () => {
    // Try to get a path to an attribute
    // <div |c></div>
    //      ^ cusor is here, before the attribute
    const position = html.indexOf('c');
    const path = getPathToNodeAtPosition(nodes, position);
    expect(path.empty).toBe(false);
    expect(path.head instanceof ng.Element).toBe(true);
    expect(path.tail instanceof ng.Attribute).toBe(true);
  });

  it('should capture attribute before cursor', () => {
    // Try to get a path to an attribute
    // <div c|></div>
    //       ^ cursor is here, after the attribute
    const position = html.indexOf('c') + 1;
    const path = getPathToNodeAtPosition(nodes, position);
    expect(path.empty).toBe(false);
    expect(path.head instanceof ng.Element).toBe(true);
    expect(path.tail instanceof ng.Attribute).toBe(true);
  });
});
