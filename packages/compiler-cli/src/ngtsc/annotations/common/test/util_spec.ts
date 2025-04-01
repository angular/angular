/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {unwrapExpression} from '../src/util';

describe('ngtsc annotation utilities', () => {
  describe('unwrapExpression', () => {
    const obj = ts.factory.createObjectLiteralExpression();
    it('should pass through an ObjectLiteralExpression', () => {
      expect(unwrapExpression(obj)).toBe(obj);
    });

    it('should unwrap an ObjectLiteralExpression in parentheses', () => {
      const wrapped = ts.factory.createParenthesizedExpression(obj);
      expect(unwrapExpression(wrapped)).toBe(obj);
    });

    it('should unwrap an ObjectLiteralExpression with a type cast', () => {
      const cast = ts.factory.createAsExpression(
        obj,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      );
      expect(unwrapExpression(cast)).toBe(obj);
    });

    it('should unwrap an ObjectLiteralExpression with a type cast in parentheses', () => {
      const cast = ts.factory.createAsExpression(
        obj,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      );
      const wrapped = ts.factory.createParenthesizedExpression(cast);
      expect(unwrapExpression(wrapped)).toBe(obj);
    });
  });
});
