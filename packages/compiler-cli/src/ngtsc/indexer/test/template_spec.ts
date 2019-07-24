/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, AttributeIdentifier, ElementIdentifier, IdentifierKind, ReferenceIdentifier, TopLevelIdentifier, VariableIdentifier} from '..';
import {runInEachFileSystem} from '../../file_system/testing';
import {getTemplateIdentifiers} from '../src/template';
import * as util from './util';

function bind(template: string) {
  return util.getBoundTemplate(template, {
    preserveWhitespaces: true,
    leadingTriviaChars: [],
  });
}

runInEachFileSystem(() => {
  describe('getTemplateIdentifiers', () => {
    it('should generate nothing in empty template', () => {
      const template = '';
      const refs = getTemplateIdentifiers(bind(template));

      expect(refs.size).toBe(0);
    });

    it('should ignore comments', () => {
      const template = '<!-- {{comment}} -->';
      const refs = getTemplateIdentifiers(bind(template));

      expect(refs.size).toBe(0);
    });

    it('should handle arbitrary whitespace', () => {
      const template = '\n\n   {{foo}}';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      expect(ref).toEqual({
        name: 'foo',
        kind: IdentifierKind.Property,
        span: new AbsoluteSourceSpan(7, 10),
      });
    });

    it('should resist collisions', () => {
      const template = '<div [bar]="bar ? bar : bar"></div>';
      const refs = getTemplateIdentifiers(bind(template));

      const refArr = Array.from(refs);
      expect(refArr).toEqual(jasmine.arrayContaining([
        {
          name: 'bar',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(12, 15),
        },
        {
          name: 'bar',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(18, 21),
        },
        {
          name: 'bar',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(24, 27),
        },
      ] as TopLevelIdentifier[]));
    });

    describe('generates identifiers for PropertyReads', () => {
      it('should discover component properties', () => {
        const template = '{{foo}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref).toEqual({
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(2, 5),
        });
      });

      it('should discover nested properties', () => {
        const template = '<div><span>{{foo}}</span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(13, 16),
        });
      });

      it('should ignore identifiers that are not implicitly received by the template', () => {
        const template = '{{foo.bar.baz}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref.name).toBe('foo');
      });

      it('should discover properties in bound attributes', () => {
        const template = '<div [bar]="bar"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'bar',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(12, 15),
        });
      });

      it('should discover properties in template expressions', () => {
        const template = '<div [bar]="bar ? bar1 : bar2"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toEqual(jasmine.arrayContaining([
          {
            name: 'bar',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(12, 15),
          },
          {
            name: 'bar1',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(18, 22),
          },
          {
            name: 'bar2',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(25, 29),
          },
        ] as TopLevelIdentifier[]));
      });

      it('should discover properties in template expressions', () => {
        const template = '<div *ngFor="let foo of foos; let i = index"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain(
            {
              name: 'foos',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(24, 28),
            },
            {
              name: 'index',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(38, 43),
            });
      });
    });

    describe('generates identifiers for PropertyWrites', () => {
      it('should discover property writes in bound events', () => {
        const template = '<div (click)="foo=bar"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toEqual(jasmine.arrayContaining([
          {
            name: 'foo',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(14, 17),
          },
          {
            name: 'bar',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(18, 21),
          }
        ] as TopLevelIdentifier[]));
      });

      it('should discover nested property writes', () => {
        const template = '<div><span (click)="foo=bar"></span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toEqual(jasmine.arrayContaining([{
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(20, 23),
        }] as TopLevelIdentifier[]));
      });

      it('should ignore property writes that are not implicitly received by the template', () => {
        const template = '<div><span (click)="foo.bar=baz"></span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        const bar = refArr.find(ref => ref.name.includes('bar'));
        expect(bar).toBeUndefined();
      });
    });

    describe('generates identifiers for MethodCalls', () => {
      it('should discover component method calls', () => {
        const template = '{{foo()}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref).toEqual({
          name: 'foo',
          kind: IdentifierKind.Method,
          span: new AbsoluteSourceSpan(2, 5),
        });
      });

      it('should discover nested properties', () => {
        const template = '<div><span>{{foo()}}</span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'foo',
          kind: IdentifierKind.Method,
          span: new AbsoluteSourceSpan(13, 16),
        });
      });

      it('should ignore identifiers that are not implicitly received by the template', () => {
        const template = '{{foo().bar().baz()}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref.name).toBe('foo');
      });

      it('should discover method calls in bound attributes', () => {
        const template = '<div [bar]="bar()"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'bar',
          kind: IdentifierKind.Method,
          span: new AbsoluteSourceSpan(12, 15),
        });
      });

      it('should discover method calls in template expressions', () => {
        const template = '<div *ngFor="let foo of foos()"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'foos',
          kind: IdentifierKind.Method,
          span: new AbsoluteSourceSpan(24, 28),
        });
      });
    });
  });

  describe('generates identifiers for template reference variables', () => {
    it('should discover references', () => {
      const template = '<div #foo>';
      const refs = getTemplateIdentifiers(bind(template));

      const refArray = Array.from(refs);
      expect(refArray).toEqual(jasmine.arrayContaining([{
        name: 'foo',
        kind: IdentifierKind.Reference,
        span: new AbsoluteSourceSpan(6, 9),
      }] as TopLevelIdentifier[]));
    });

    it('should discover nested references', () => {
      const template = '<div><span #foo></span></div>';
      const refs = getTemplateIdentifiers(bind(template));

      const refArray = Array.from(refs);
      expect(refArray).toEqual(jasmine.arrayContaining([{
        name: 'foo',
        kind: IdentifierKind.Reference,
        span: new AbsoluteSourceSpan(12, 15),
      }] as TopLevelIdentifier[]));
    });

    it('should discover references to references', () => {
      const template = `<div #foo>{{foo.className}}</div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const referenceIdentifier: ReferenceIdentifier = {
        name: 'foo',
        kind: IdentifierKind.Reference,
        span: new AbsoluteSourceSpan(6, 9)
      };

      const refArr = Array.from(refs);
      expect(refArr).toEqual(jasmine.arrayContaining([
        referenceIdentifier, {
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(12, 15),
          target: referenceIdentifier,
        }
      ] as TopLevelIdentifier[]));
    });

    it('should discover forward references', () => {
      const template = `{{foo}}<div #foo></div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const referenceIdentifier: ReferenceIdentifier = {
        name: 'foo',
        kind: IdentifierKind.Reference,
        span: new AbsoluteSourceSpan(13, 16)
      };

      const refArr = Array.from(refs);
      expect(refArr).toEqual(jasmine.arrayContaining([
        referenceIdentifier, {
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(2, 5),
          target: referenceIdentifier,
        }
      ] as TopLevelIdentifier[]));
    });

    it('should discover references to references', () => {
      const template = `<div #foo (ngSubmit)="do(foo)"></div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const referenceIdentifier: ReferenceIdentifier = {
        name: 'foo',
        kind: IdentifierKind.Reference,
        span: new AbsoluteSourceSpan(6, 9)
      };

      const refArr = Array.from(refs);
      expect(refArr).toEqual(jasmine.arrayContaining([
        referenceIdentifier, {
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(25, 28),
          target: referenceIdentifier,
        }
      ] as TopLevelIdentifier[]));
    });
  });

  describe('generates identifiers for template variables', () => {
    it('should discover variables', () => {
      const template = '<div *ngFor="let foo of foos">';
      const refs = getTemplateIdentifiers(bind(template));

      const refArray = Array.from(refs);
      expect(refArray).toEqual(jasmine.arrayContaining([{
        name: 'foo',
        kind: IdentifierKind.Variable,
        span: new AbsoluteSourceSpan(17, 20),
      }] as TopLevelIdentifier[]));
    });

    it('should discover variables with let- syntax', () => {
      const template = '<ng-template let-var="classVar">';
      const refs = getTemplateIdentifiers(bind(template));

      const refArray = Array.from(refs);
      expect(refArray).toEqual(jasmine.arrayContaining([{
        name: 'var',
        kind: IdentifierKind.Variable,
        span: new AbsoluteSourceSpan(17, 20),
      }] as TopLevelIdentifier[]));
    });

    it('should discover nested variables', () => {
      const template = '<div><span *ngFor="let foo of foos"></span></div>';
      const refs = getTemplateIdentifiers(bind(template));

      const refArray = Array.from(refs);
      expect(refArray).toEqual(jasmine.arrayContaining([{
        name: 'foo',
        kind: IdentifierKind.Variable,
        span: new AbsoluteSourceSpan(23, 26),
      }] as TopLevelIdentifier[]));
    });

    it('should discover references to variables', () => {
      const template = `<div *ngFor="let foo of foos; let i = index">{{foo + i}}</div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const fooIdentifier: VariableIdentifier = {
        name: 'foo',
        kind: IdentifierKind.Variable,
        span: new AbsoluteSourceSpan(17, 20),
      };
      const iIdentifier: VariableIdentifier = {
        name: 'i',
        kind: IdentifierKind.Variable,
        span: new AbsoluteSourceSpan(34, 35),
      };

      const refArr = Array.from(refs);
      expect(refArr).toEqual(jasmine.arrayContaining([
        fooIdentifier,
        {
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(47, 50),
          target: fooIdentifier,
        },
        iIdentifier,
        {
          name: 'i',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(53, 54),
          target: iIdentifier,
        },
      ] as TopLevelIdentifier[]));
    });

    it('should discover references to variables', () => {
      const template = `<div *ngFor="let foo of foos" (click)="do(foo)"></div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const variableIdentifier: VariableIdentifier = {
        name: 'foo',
        kind: IdentifierKind.Variable,
        span: new AbsoluteSourceSpan(17, 20)
      };

      const refArr = Array.from(refs);
      expect(refArr).toEqual(jasmine.arrayContaining([
        variableIdentifier, {
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(42, 45),
          target: variableIdentifier,
        }
      ] as TopLevelIdentifier[]));
    });
  });

  describe('generates identifiers for elements', () => {
    it('should record elements as ElementIdentifiers', () => {
      const template = '<test-selector>';
      const refs = getTemplateIdentifiers(bind(template));
      expect(refs.size).toBe(1);

      const [ref] = Array.from(refs);
      expect(ref.kind).toBe(IdentifierKind.Element);
    });

    it('should record element names as their selector', () => {
      const template = '<test-selector>';
      const refs = getTemplateIdentifiers(bind(template));
      expect(refs.size).toBe(1);

      const [ref] = Array.from(refs);
      expect(ref as ElementIdentifier).toEqual({
        name: 'test-selector',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(1, 14),
        attributes: new Set(),
        usedDirectives: new Set(),
      });
    });

    it('should discover selectors in self-closing elements', () => {
      const template = '<img />';
      const refs = getTemplateIdentifiers(bind(template));
      expect(refs.size).toBe(1);

      const [ref] = Array.from(refs);
      expect(ref as ElementIdentifier).toEqual({
        name: 'img',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(1, 4),
        attributes: new Set(),
        usedDirectives: new Set(),
      });
    });

    it('should discover selectors in elements with adjacent open and close tags', () => {
      const template = '<test-selector></test-selector>';
      const refs = getTemplateIdentifiers(bind(template));
      expect(refs.size).toBe(1);

      const [ref] = Array.from(refs);
      expect(ref as ElementIdentifier).toEqual({
        name: 'test-selector',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(1, 14),
        attributes: new Set(),
        usedDirectives: new Set(),
      });
    });

    it('should discover selectors in elements with non-adjacent open and close tags', () => {
      const template = '<test-selector> text </test-selector>';
      const refs = getTemplateIdentifiers(bind(template));
      expect(refs.size).toBe(1);

      const [ref] = Array.from(refs);
      expect(ref as ElementIdentifier).toEqual({
        name: 'test-selector',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(1, 14),
        attributes: new Set(),
        usedDirectives: new Set(),
      });
    });

    it('should discover nested selectors', () => {
      const template = '<div><span></span></div>';
      const refs = getTemplateIdentifiers(bind(template));

      const refArr = Array.from(refs);
      expect(refArr).toContain({
        name: 'span',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(6, 10),
        attributes: new Set(),
        usedDirectives: new Set(),
      });
    });

    it('should generate information about attributes', () => {
      const template = '<div attrA attrB="val"></div>';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      const attrs = (ref as ElementIdentifier).attributes;
      expect(attrs).toEqual(new Set<AttributeIdentifier>([
        {
          name: 'attrA',
          kind: IdentifierKind.Attribute,
          span: new AbsoluteSourceSpan(5, 10),
        },
        {
          name: 'attrB',
          kind: IdentifierKind.Attribute,
          span: new AbsoluteSourceSpan(11, 22),
        }
      ]));
    });

    it('should generate information about used directives', () => {
      const declA = util.getComponentDeclaration('class A {}', 'A');
      const declB = util.getComponentDeclaration('class B {}', 'B');
      const declC = util.getComponentDeclaration('class C {}', 'C');
      const template = '<a-selector b-selector></a-selector>';
      const boundTemplate = util.getBoundTemplate(template, {}, [
        {selector: 'a-selector', declaration: declA},
        {selector: '[b-selector]', declaration: declB},
        {selector: ':not(never-selector)', declaration: declC},
      ]);

      const refs = getTemplateIdentifiers(boundTemplate);
      const [ref] = Array.from(refs);
      const usedDirectives = (ref as ElementIdentifier).usedDirectives;
      expect(usedDirectives).toEqual(new Set([
        {
          node: declA,
          selector: 'a-selector',
        },
        {
          node: declB,
          selector: '[b-selector]',
        },
        {
          node: declC,
          selector: ':not(never-selector)',
        }
      ]));
    });
  });
});
