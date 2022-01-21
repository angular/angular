/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan} from '@angular/compiler';

import {humanizeExpressionSource} from './util/expression';
import {parseR3 as parse} from './view/util';

describe('expression AST absolute source spans', () => {
  it('should handle comment in interpolation', () => {
    expect(humanizeExpressionSource(parse('{{foo // comment}}', {preserveWhitespaces: true}).nodes))
        .toContain(['foo', new AbsoluteSourceSpan(2, 5)]);
  });

  it('should handle whitespace in interpolation', () => {
    expect(humanizeExpressionSource(parse('{{  foo  }}', {preserveWhitespaces: true}).nodes))
        .toContain(['foo', new AbsoluteSourceSpan(4, 7)]);
  });

  it('should handle whitespace and comment in interpolation', () => {
    expect(humanizeExpressionSource(
               parse('{{  foo // comment  }}', {preserveWhitespaces: true}).nodes))
        .toContain(['foo', new AbsoluteSourceSpan(4, 7)]);
  });

  it('should handle comment in an action binding', () => {
    expect(humanizeExpressionSource(parse('<button (click)="foo = true // comment">Save</button>', {
                                      preserveWhitespaces: true
                                    }).nodes))
        .toContain(['foo = true', new AbsoluteSourceSpan(17, 27)]);
  });

  // TODO(ayazhafiz): duplicate this test without `preserveWhitespaces` once whitespace rewriting is
  // moved to post-R3AST generation.
  it('should provide absolute offsets with arbitrary whitespace', () => {
    expect(humanizeExpressionSource(
               parse('<div>\n  \n{{foo}}</div>', {preserveWhitespaces: true}).nodes))
        .toContain(['\n  \n{{ foo }}', new AbsoluteSourceSpan(5, 16)]);
  });

  it('should provide absolute offsets of an expression in a bound text', () => {
    expect(humanizeExpressionSource(parse('<div>{{foo}}</div>').nodes)).toContain([
      '{{ foo }}', new AbsoluteSourceSpan(5, 12)
    ]);
  });

  it('should provide absolute offsets of an expression in a bound event', () => {
    expect(humanizeExpressionSource(parse('<div (click)="foo();bar();"></div>').nodes)).toContain([
      'foo(); bar();', new AbsoluteSourceSpan(14, 26)
    ]);

    expect(humanizeExpressionSource(parse('<div on-click="foo();bar();"></div>').nodes)).toContain([
      'foo(); bar();', new AbsoluteSourceSpan(15, 27)
    ]);
  });

  it('should provide absolute offsets of an expression in a bound attribute', () => {
    expect(humanizeExpressionSource(parse('<input [disabled]="condition ? true : false" />').nodes))
        .toContain(['condition ? true : false', new AbsoluteSourceSpan(19, 43)]);

    expect(
        humanizeExpressionSource(parse('<input bind-disabled="condition ? true : false" />').nodes))
        .toContain(['condition ? true : false', new AbsoluteSourceSpan(22, 46)]);
  });

  it('should provide absolute offsets of an expression in a template attribute', () => {
    expect(humanizeExpressionSource(parse('<div *ngIf="value | async"></div>').nodes)).toContain([
      '(value | async)', new AbsoluteSourceSpan(12, 25)
    ]);
  });

  describe('binary expression', () => {
    it('should provide absolute offsets of a binary expression', () => {
      expect(humanizeExpressionSource(parse('<div>{{1 + 2}}<div>').nodes)).toContain([
        '1 + 2', new AbsoluteSourceSpan(7, 12)
      ]);
    });

    it('should provide absolute offsets of expressions in a binary expression', () => {
      expect(humanizeExpressionSource(parse('<div>{{1 + 2}}<div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['1', new AbsoluteSourceSpan(7, 8)],
            ['2', new AbsoluteSourceSpan(11, 12)],
          ]));
    });
  });

  describe('conditional', () => {
    it('should provide absolute offsets of a conditional', () => {
      expect(humanizeExpressionSource(parse('<div>{{bool ? 1 : 0}}<div>').nodes)).toContain([
        'bool ? 1 : 0', new AbsoluteSourceSpan(7, 19)
      ]);
    });

    it('should provide absolute offsets of expressions in a conditional', () => {
      expect(humanizeExpressionSource(parse('<div>{{bool ? 1 : 0}}<div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['bool', new AbsoluteSourceSpan(7, 11)],
            ['1', new AbsoluteSourceSpan(14, 15)],
            ['0', new AbsoluteSourceSpan(18, 19)],
          ]));
    });
  });

  describe('chain', () => {
    it('should provide absolute offsets of a chain', () => {
      expect(humanizeExpressionSource(parse('<div (click)="a(); b();"><div>').nodes)).toContain([
        'a(); b();', new AbsoluteSourceSpan(14, 23)
      ]);
    });

    it('should provide absolute offsets of expressions in a chain', () => {
      expect(humanizeExpressionSource(parse('<div (click)="a(); b();"><div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['a()', new AbsoluteSourceSpan(14, 17)],
            ['b()', new AbsoluteSourceSpan(19, 22)],
          ]));
    });
  });

  describe('function call', () => {
    it('should provide absolute offsets of a function call', () => {
      expect(humanizeExpressionSource(parse('<div>{{fn()()}}<div>').nodes)).toContain([
        'fn()()', new AbsoluteSourceSpan(7, 13)
      ]);
    });

    it('should provide absolute offsets of expressions in a function call', () => {
      expect(humanizeExpressionSource(parse('<div>{{fn()(param)}}<div>').nodes)).toContain([
        'param', new AbsoluteSourceSpan(12, 17)
      ]);
    });
  });

  it('should provide absolute offsets of an implicit receiver', () => {
    expect(humanizeExpressionSource(parse('<div>{{a.b}}<div>').nodes)).toContain([
      '', new AbsoluteSourceSpan(7, 7)
    ]);
  });

  describe('interpolation', () => {
    it('should provide absolute offsets of an interpolation', () => {
      expect(humanizeExpressionSource(parse('<div>{{1 + foo.length}}<div>').nodes)).toContain([
        '{{ 1 + foo.length }}', new AbsoluteSourceSpan(5, 23)
      ]);
    });

    it('should provide absolute offsets of expressions in an interpolation', () => {
      expect(humanizeExpressionSource(parse('<div>{{1 + 2}}<div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['1', new AbsoluteSourceSpan(7, 8)],
            ['2', new AbsoluteSourceSpan(11, 12)],
          ]));
    });

    it('should handle HTML entity before interpolation', () => {
      expect(humanizeExpressionSource(parse('&nbsp;{{abc}}').nodes))
          .toEqual(jasmine.arrayContaining([
            ['abc', new AbsoluteSourceSpan(8, 11)],
          ]));
    });

    it('should handle many HTML entities and many interpolations', () => {
      expect(humanizeExpressionSource(parse('&quot;{{abc}}&quot;{{def}}&nbsp;{{ghi}}').nodes))
          .toEqual(jasmine.arrayContaining([
            ['abc', new AbsoluteSourceSpan(8, 11)],
            ['def', new AbsoluteSourceSpan(21, 24)],
            ['ghi', new AbsoluteSourceSpan(34, 37)],
          ]));
    });

    it('should handle interpolation in attribute', () => {
      expect(humanizeExpressionSource(parse('<div class="{{abc}}"><div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['abc', new AbsoluteSourceSpan(14, 17)],
          ]));
    });

    it('should handle interpolation preceded by HTML entity in attribute', () => {
      expect(humanizeExpressionSource(parse('<div class="&nbsp;{{abc}}"><div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['abc', new AbsoluteSourceSpan(20, 23)],
          ]));
    });

    it('should handle many interpolation with HTML entities in attribute', () => {
      expect(humanizeExpressionSource(
                 parse('<div class="&quot;{{abc}}&quot;&nbsp;{{def}}"><div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['abc', new AbsoluteSourceSpan(20, 23)],
            ['def', new AbsoluteSourceSpan(39, 42)],
          ]));
    });
  });

  describe('keyed read', () => {
    it('should provide absolute offsets of a keyed read', () => {
      expect(humanizeExpressionSource(parse('<div>{{obj[key]}}<div>').nodes)).toContain([
        'obj[key]', new AbsoluteSourceSpan(7, 15)
      ]);
    });

    it('should provide absolute offsets of expressions in a keyed read', () => {
      expect(humanizeExpressionSource(parse('<div>{{obj[key]}}<div>').nodes)).toContain([
        'key', new AbsoluteSourceSpan(11, 14)
      ]);
    });
  });

  describe('keyed write', () => {
    it('should provide absolute offsets of a keyed write', () => {
      expect(humanizeExpressionSource(parse('<div>{{obj[key] = 0}}<div>').nodes)).toContain([
        'obj[key] = 0', new AbsoluteSourceSpan(7, 19)
      ]);
    });

    it('should provide absolute offsets of expressions in a keyed write', () => {
      expect(humanizeExpressionSource(parse('<div>{{obj[key] = 0}}<div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['key', new AbsoluteSourceSpan(11, 14)],
            ['0', new AbsoluteSourceSpan(18, 19)],
          ]));
    });
  });

  it('should provide absolute offsets of a literal primitive', () => {
    expect(humanizeExpressionSource(parse('<div>{{100}}<div>').nodes)).toContain([
      '100', new AbsoluteSourceSpan(7, 10)
    ]);
  });

  describe('literal array', () => {
    it('should provide absolute offsets of a literal array', () => {
      expect(humanizeExpressionSource(parse('<div>{{[0, 1, 2]}}<div>').nodes)).toContain([
        '[0, 1, 2]', new AbsoluteSourceSpan(7, 16)
      ]);
    });

    it('should provide absolute offsets of expressions in a literal array', () => {
      expect(humanizeExpressionSource(parse('<div>{{[0, 1, 2]}}<div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['0', new AbsoluteSourceSpan(8, 9)],
            ['1', new AbsoluteSourceSpan(11, 12)],
            ['2', new AbsoluteSourceSpan(14, 15)],
          ]));
    });
  });

  describe('literal map', () => {
    it('should provide absolute offsets of a literal map', () => {
      expect(humanizeExpressionSource(parse('<div>{{ {a: 0} }}<div>').nodes)).toContain([
        '{a: 0}', new AbsoluteSourceSpan(8, 14)
      ]);
    });

    it('should provide absolute offsets of expressions in a literal map', () => {
      expect(humanizeExpressionSource(parse('<div>{{ {a: 0} }}<div>').nodes))
          .toEqual(jasmine.arrayContaining([
            ['0', new AbsoluteSourceSpan(12, 13)],
          ]));
    });
  });

  describe('method call', () => {
    it('should provide absolute offsets of a method call', () => {
      expect(humanizeExpressionSource(parse('<div>{{method()}}</div>').nodes)).toContain([
        'method()', new AbsoluteSourceSpan(7, 15)
      ]);
    });

    it('should provide absolute offsets of expressions in a method call', () => {
      expect(humanizeExpressionSource(parse('<div>{{method(param)}}<div>').nodes)).toContain([
        'param', new AbsoluteSourceSpan(14, 19)
      ]);
    });
  });

  describe('non-null assert', () => {
    it('should provide absolute offsets of a non-null assert', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop!}}</div>').nodes)).toContain([
        'prop!', new AbsoluteSourceSpan(7, 12)
      ]);
    });

    it('should provide absolute offsets of expressions in a non-null assert', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop!}}<div>').nodes)).toContain([
        'prop', new AbsoluteSourceSpan(7, 11)
      ]);
    });
  });

  describe('pipe', () => {
    it('should provide absolute offsets of a pipe', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop | pipe}}<div>').nodes)).toContain([
        '(prop | pipe)', new AbsoluteSourceSpan(7, 18)
      ]);
    });

    it('should provide absolute offsets expressions in a pipe', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop | pipe}}<div>').nodes)).toContain([
        'prop', new AbsoluteSourceSpan(7, 11)
      ]);
    });
  });

  describe('property read', () => {
    it('should provide absolute offsets of a property read', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop.obj}}<div>').nodes)).toContain([
        'prop.obj', new AbsoluteSourceSpan(7, 15)
      ]);
    });

    it('should provide absolute offsets of expressions in a property read', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop.obj}}<div>').nodes)).toContain([
        'prop', new AbsoluteSourceSpan(7, 11)
      ]);
    });
  });

  describe('property write', () => {
    it('should provide absolute offsets of a property write', () => {
      expect(humanizeExpressionSource(parse('<div (click)="prop = 0"></div>').nodes)).toContain([
        'prop = 0', new AbsoluteSourceSpan(14, 22)
      ]);
    });

    it('should provide absolute offsets of an accessed property write', () => {
      expect(humanizeExpressionSource(parse('<div (click)="prop.inner = 0"></div>').nodes))
          .toContain(['prop.inner = 0', new AbsoluteSourceSpan(14, 28)]);
    });

    it('should provide absolute offsets of expressions in a property write', () => {
      expect(humanizeExpressionSource(parse('<div (click)="prop = 0"></div>').nodes)).toContain([
        '0', new AbsoluteSourceSpan(21, 22)
      ]);
    });
  });

  describe('"not" prefix', () => {
    it('should provide absolute offsets of a "not" prefix', () => {
      expect(humanizeExpressionSource(parse('<div>{{!prop}}</div>').nodes)).toContain([
        '!prop', new AbsoluteSourceSpan(7, 12)
      ]);
    });

    it('should provide absolute offsets of expressions in a "not" prefix', () => {
      expect(humanizeExpressionSource(parse('<div>{{!prop}}<div>').nodes)).toContain([
        'prop', new AbsoluteSourceSpan(8, 12)
      ]);
    });
  });

  describe('safe method call', () => {
    it('should provide absolute offsets of a safe method call', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop?.safe()}}<div>').nodes)).toContain([
        'prop?.safe()', new AbsoluteSourceSpan(7, 19)
      ]);
    });

    it('should provide absolute offsets of expressions in safe method call', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop?.safe()}}<div>').nodes)).toContain([
        'prop', new AbsoluteSourceSpan(7, 11)
      ]);
    });
  });

  describe('safe property read', () => {
    it('should provide absolute offsets of a safe property read', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop?.safe}}<div>').nodes)).toContain([
        'prop?.safe', new AbsoluteSourceSpan(7, 17)
      ]);
    });

    it('should provide absolute offsets of expressions in safe property read', () => {
      expect(humanizeExpressionSource(parse('<div>{{prop?.safe}}<div>').nodes)).toContain([
        'prop', new AbsoluteSourceSpan(7, 11)
      ]);
    });
  });

  describe('absolute offsets for template expressions', () => {
    it('should work for simple cases', () => {
      expect(
          humanizeExpressionSource(parse('<div *ngFor="let item of items">{{item}}</div>').nodes))
          .toContain(['items', new AbsoluteSourceSpan(25, 30)]);
    });

    it('should work with multiple bindings', () => {
      expect(humanizeExpressionSource(parse('<div *ngFor="let a of As; let b of Bs"></div>').nodes))
          .toEqual(jasmine.arrayContaining(
              [['As', new AbsoluteSourceSpan(22, 24)], ['Bs', new AbsoluteSourceSpan(35, 37)]]));
    });
  });

  describe('ICU expressions', () => {
    it('is correct for variables and placeholders', () => {
      const spans = humanizeExpressionSource(
          parse('<span i18n>{item.var, plural, other { {{item.placeholder}} items } }</span>')
              .nodes);
      expect(spans).toContain(['item.var', new AbsoluteSourceSpan(12, 20)]);
      expect(spans).toContain(['item.placeholder', new AbsoluteSourceSpan(40, 56)]);
    });

    it('is correct for variables and placeholders', () => {
      const spans = humanizeExpressionSource(
          parse(
              '<span i18n>{item.var, plural, other { {{item.placeholder}} {nestedVar, plural, other { {{nestedPlaceholder}} }}} }</span>')
              .nodes);
      expect(spans).toContain(['item.var', new AbsoluteSourceSpan(12, 20)]);
      expect(spans).toContain(['item.placeholder', new AbsoluteSourceSpan(40, 56)]);
      expect(spans).toContain(['nestedVar', new AbsoluteSourceSpan(60, 69)]);
      expect(spans).toContain(['nestedPlaceholder', new AbsoluteSourceSpan(89, 106)]);
    });
  });

  describe('object literal', () => {
    it('is correct for object literals with shorthand property declarations', () => {
      const spans =
          humanizeExpressionSource(parse('<div (click)="test({a: 1, b, c: 3, foo})"></div>').nodes);

      expect(spans).toContain(['{a: 1, b: b, c: 3, foo: foo}', new AbsoluteSourceSpan(19, 39)]);
      expect(spans).toContain(['b', new AbsoluteSourceSpan(26, 27)]);
      expect(spans).toContain(['foo', new AbsoluteSourceSpan(35, 38)]);
    });
  });
});
