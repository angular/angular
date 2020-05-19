/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {unwrapExpression} from '../src/util';

describe('ngtsc annotation utilities', () => {
  describe('unwrapExpression', () => {
    const obj = ts.createObjectLiteral();
    it('should pass through an ObjectLiteralExpression', () => {
      expect(unwrapExpression(obj)).toBe(obj);
    });

    it('should unwrap an ObjectLiteralExpression in parentheses', () => {
      const wrapped = ts.createParen(obj);
      expect(unwrapExpression(wrapped)).toBe(obj);
    });

    it('should unwrap an ObjectLiteralExpression with a type cast', () => {
      const cast = ts.createAsExpression(obj, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
      expect(unwrapExpression(cast)).toBe(obj);
    });

    it('should unwrap an ObjectLiteralExpression with a type cast in parentheses', () => {
      const cast = ts.createAsExpression(obj, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
      const wrapped = ts.createParen(cast);
      expect(unwrapExpression(wrapped)).toBe(obj);
    });
  });
});
