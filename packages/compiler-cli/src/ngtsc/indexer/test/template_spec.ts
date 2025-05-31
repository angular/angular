/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BoundTarget} from '@angular/compiler';

import {
  AbsoluteSourceSpan,
  AttributeIdentifier,
  DirectiveHostIdentifier,
  ElementIdentifier,
  IdentifierKind,
  LetDeclarationIdentifier,
  ReferenceIdentifier,
  TemplateNodeIdentifier,
  TopLevelIdentifier,
  VariableIdentifier,
} from '..';
import {runInEachFileSystem} from '../../file_system/testing';
import {ComponentMeta} from '../src/context';
import {getTemplateIdentifiers as getTemplateIdentifiersAndErrors} from '../src/template';

import * as util from './util';

function bind(template: string, enableSelectorless = false) {
  return util.getBoundTemplate(template, {
    preserveWhitespaces: true,
    leadingTriviaChars: [],
    enableSelectorless,
  });
}

function getTemplateIdentifiers(boundTemplate: BoundTarget<ComponentMeta>) {
  return getTemplateIdentifiersAndErrors(boundTemplate).identifiers;
}

runInEachFileSystem(() => {
  describe('getTemplateIdentifiers', () => {
    it('should handle svg elements', () => {
      const template = '<svg></svg>';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      expect(ref).toEqual({
        kind: IdentifierKind.Element,
        name: 'svg',
        span: new AbsoluteSourceSpan(1, 4),
        usedDirectives: new Set(),
        attributes: new Set(),
      });
    });

    it('should handle svg elements on templates', () => {
      const template = '<svg *ngIf="true"></svg>';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      expect(ref).toEqual({
        kind: IdentifierKind.Template,
        name: 'svg',
        span: new AbsoluteSourceSpan(1, 4),
        usedDirectives: new Set(),
        attributes: new Set(),
      });
    });

    it('should handle comments in interpolations', () => {
      const template = '{{foo // comment}}';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      expect(ref).toEqual({
        name: 'foo',
        kind: IdentifierKind.Property,
        span: new AbsoluteSourceSpan(2, 5),
        target: null,
      });
    });

    it('should handle whitespace and comments in interpolations', () => {
      const template = '{{   foo // comment   }}';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      expect(ref).toEqual({
        name: 'foo',
        kind: IdentifierKind.Property,
        span: new AbsoluteSourceSpan(5, 8),
        target: null,
      });
    });

    it('works when structural directives are on templates', () => {
      const template = '<ng-template *ngIf="true">';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      expect(ref).toEqual({
        kind: IdentifierKind.Template,
        name: 'ng-template',
        span: new AbsoluteSourceSpan(1, 12),
        usedDirectives: new Set(),
        attributes: new Set(),
      });
    });

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
        target: null,
      });
    });

    it('should resist collisions', () => {
      const template = '<div [bar]="bar ? bar : bar"></div>';
      const refs = getTemplateIdentifiers(bind(template));

      const refArr = Array.from(refs);
      expect(refArr).toEqual(
        jasmine.arrayContaining([
          {
            name: 'bar',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(12, 15),
            target: null,
          },
          {
            name: 'bar',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(18, 21),
            target: null,
          },
          {
            name: 'bar',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(24, 27),
            target: null,
          },
        ] as TopLevelIdentifier[]),
      );
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
          target: null,
        });
      });

      it('should discover component properties read using "this" as a receiver', () => {
        const template = '{{this.foo}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref).toEqual({
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(7, 10),
          target: null,
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
          target: null,
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
          target: null,
        });
      });

      it('should handle bound attributes with no value', () => {
        const template = '<div [bar]></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toEqual([
          {
            name: 'div',
            kind: IdentifierKind.Element,
            span: new AbsoluteSourceSpan(1, 4),
            attributes: new Set(),
            usedDirectives: new Set(),
          },
        ]);
      });

      it('should discover variables in bound attributes', () => {
        const template = '<div #div [value]="div.innerText"></div>';
        const refs = getTemplateIdentifiers(bind(template));
        const elementReference: ElementIdentifier = {
          name: 'div',
          kind: IdentifierKind.Element,
          span: new AbsoluteSourceSpan(1, 4),
          attributes: new Set(),
          usedDirectives: new Set(),
        };
        const reference: ReferenceIdentifier = {
          name: 'div',
          kind: IdentifierKind.Reference,
          span: new AbsoluteSourceSpan(6, 9),
          target: {node: elementReference, directive: null},
        };

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'div',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(19, 22),
          target: reference,
        });
      });

      it('should discover properties in template expressions', () => {
        const template = '<div [bar]="bar ? bar1 : bar2"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toEqual(
          jasmine.arrayContaining([
            {
              name: 'bar',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(12, 15),
              target: null,
            },
            {
              name: 'bar1',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(18, 22),
              target: null,
            },
            {
              name: 'bar2',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(25, 29),
              target: null,
            },
          ] as TopLevelIdentifier[]),
        );
      });

      it('should discover properties in template expressions', () => {
        const template = '<div *ngFor="let foo of foos"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'foos',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(24, 28),
          target: null,
        });
      });

      it('should discover properties in template expressions and resist collisions', () => {
        const template = '<div *ngFor="let foo of (foos ? foos : foos)"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toEqual(
          jasmine.arrayContaining([
            {
              name: 'foos',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(25, 29),
              target: null,
            },
            {
              name: 'foos',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(32, 36),
              target: null,
            },
            {
              name: 'foos',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(39, 43),
              target: null,
            },
          ]),
        );
      });
    });

    describe('generates identifiers for property writes', () => {
      it('should discover property writes in bound events', () => {
        const template = '<div (click)="foo=bar"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toEqual(
          jasmine.arrayContaining([
            {
              name: 'foo',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(14, 17),
              target: null,
            },
            {
              name: 'bar',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(18, 21),
              target: null,
            },
          ] as TopLevelIdentifier[]),
        );
      });

      it('should discover nested property writes', () => {
        const template = '<div><span (click)="foo=bar"></span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toEqual(
          jasmine.arrayContaining([
            {
              name: 'foo',
              kind: IdentifierKind.Property,
              span: new AbsoluteSourceSpan(20, 23),
              target: null,
            },
          ] as TopLevelIdentifier[]),
        );
      });

      it('should ignore property writes that are not implicitly received by the template', () => {
        const template = '<div><span (click)="foo.bar=baz"></span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        const bar = refArr.find((ref) => ref.name.includes('bar'));
        expect(bar).toBeUndefined();
      });
    });

    describe('generates identifiers for method calls', () => {
      it('should discover component method calls', () => {
        const template = '{{foo()}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref).toEqual({
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(2, 5),
          target: null,
        });
      });

      it('should discover nested properties', () => {
        const template = '<div><span>{{foo()}}</span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(13, 16),
          target: null,
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
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(12, 15),
          target: null,
        });
      });

      it('should discover method calls in template expressions', () => {
        const template = '<div *ngFor="let foo of foos()"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'foos',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(24, 28),
          target: null,
        });
      });
    });
  });

  describe('generates identifiers for template reference variables', () => {
    it('should discover references', () => {
      const template = '<div #foo>';
      const refs = getTemplateIdentifiers(bind(template));
      const elementReference: ElementIdentifier = {
        name: 'div',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(1, 4),
        attributes: new Set(),
        usedDirectives: new Set(),
      };

      const refArray = Array.from(refs);
      expect(refArray).toEqual(
        jasmine.arrayContaining([
          {
            name: 'foo',
            kind: IdentifierKind.Reference,
            span: new AbsoluteSourceSpan(6, 9),
            target: {node: elementReference, directive: null},
          },
        ] as TopLevelIdentifier[]),
      );
    });

    it('should discover nested references', () => {
      const template = '<div><span #foo></span></div>';
      const refs = getTemplateIdentifiers(bind(template));
      const elementReference: ElementIdentifier = {
        name: 'span',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(6, 10),
        attributes: new Set(),
        usedDirectives: new Set(),
      };

      const refArray = Array.from(refs);
      expect(refArray).toEqual(
        jasmine.arrayContaining([
          {
            name: 'foo',
            kind: IdentifierKind.Reference,
            span: new AbsoluteSourceSpan(12, 15),
            target: {node: elementReference, directive: null},
          },
        ] as TopLevelIdentifier[]),
      );
    });

    it('should discover references to references', () => {
      const template = `<div #foo>{{foo.className}}</div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const elementIdentifier: ElementIdentifier = {
        name: 'div',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(1, 4),
        attributes: new Set(),
        usedDirectives: new Set(),
      };
      const referenceIdentifier: ReferenceIdentifier = {
        name: 'foo',
        kind: IdentifierKind.Reference,
        span: new AbsoluteSourceSpan(6, 9),
        target: {node: elementIdentifier, directive: null},
      };

      const refArr = Array.from(refs);
      expect(refArr).toEqual(
        jasmine.arrayContaining([
          elementIdentifier,
          referenceIdentifier,
          {
            name: 'foo',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(12, 15),
            target: referenceIdentifier,
          },
        ] as TopLevelIdentifier[]),
      );
    });

    it('should discover forward references', () => {
      const template = `{{foo}}<div #foo></div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const elementIdentifier: ElementIdentifier = {
        name: 'div',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(8, 11),
        attributes: new Set(),
        usedDirectives: new Set(),
      };
      const referenceIdentifier: ReferenceIdentifier = {
        name: 'foo',
        kind: IdentifierKind.Reference,
        span: new AbsoluteSourceSpan(13, 16),
        target: {node: elementIdentifier, directive: null},
      };

      const refArr = Array.from(refs);
      expect(refArr).toEqual(
        jasmine.arrayContaining([
          elementIdentifier,
          referenceIdentifier,
          {
            name: 'foo',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(2, 5),
            target: referenceIdentifier,
          },
        ] as TopLevelIdentifier[]),
      );
    });

    it('should generate information directive targets', () => {
      const declB = util.getComponentDeclaration('class B {}', 'B');
      const template = '<div #foo b-selector>';
      const boundTemplate = util.getBoundTemplate(template, {}, [
        {selector: '[b-selector]', declaration: declB},
      ]);

      const refs = getTemplateIdentifiers(boundTemplate);
      const refArr = Array.from(refs);
      let fooRef = refArr.find((id) => id.name === 'foo');
      expect(fooRef).toBeDefined();
      expect(fooRef!.kind).toBe(IdentifierKind.Reference);

      fooRef = fooRef as ReferenceIdentifier;
      expect(fooRef.target).toBeDefined();
      expect(fooRef.target!.node.kind).toBe(IdentifierKind.Element);
      expect(fooRef.target!.node.name).toBe('div');
      expect(fooRef.target!.node.span).toEqual(new AbsoluteSourceSpan(1, 4));
      expect(fooRef.target!.directive).toEqual(declB);
    });

    it('should discover references to references', () => {
      const template = `<div #foo (ngSubmit)="do(foo)"></div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const elementIdentifier: ElementIdentifier = {
        name: 'div',
        kind: IdentifierKind.Element,
        span: new AbsoluteSourceSpan(1, 4),
        attributes: new Set(),
        usedDirectives: new Set(),
      };
      const referenceIdentifier: ReferenceIdentifier = {
        name: 'foo',
        kind: IdentifierKind.Reference,
        span: new AbsoluteSourceSpan(6, 9),
        target: {node: elementIdentifier, directive: null},
      };

      const refArr = Array.from(refs);
      expect(refArr).toEqual(
        jasmine.arrayContaining([
          elementIdentifier,
          referenceIdentifier,
          {
            name: 'foo',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(25, 28),
            target: referenceIdentifier,
          },
        ] as TopLevelIdentifier[]),
      );
    });
  });

  describe('generates identifiers for template variables', () => {
    it('should discover variables', () => {
      const template = '<div *ngFor="let foo of foos">';
      const refs = getTemplateIdentifiers(bind(template));

      const refArray = Array.from(refs);
      expect(refArray).toEqual(
        jasmine.arrayContaining([
          {
            name: 'foo',
            kind: IdentifierKind.Variable,
            span: new AbsoluteSourceSpan(17, 20),
          },
        ] as TopLevelIdentifier[]),
      );
    });

    it('should discover variables with let- syntax', () => {
      const template = '<ng-template let-var="classVar">';
      const refs = getTemplateIdentifiers(bind(template));

      const refArray = Array.from(refs);
      expect(refArray).toEqual(
        jasmine.arrayContaining([
          {
            name: 'var',
            kind: IdentifierKind.Variable,
            span: new AbsoluteSourceSpan(17, 20),
          },
        ] as TopLevelIdentifier[]),
      );
    });

    it('should discover nested variables', () => {
      const template = '<div><span *ngFor="let foo of foos"></span></div>';
      const refs = getTemplateIdentifiers(bind(template));

      const refArray = Array.from(refs);
      expect(refArray).toEqual(
        jasmine.arrayContaining([
          {
            name: 'foo',
            kind: IdentifierKind.Variable,
            span: new AbsoluteSourceSpan(23, 26),
          },
        ] as TopLevelIdentifier[]),
      );
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
      expect(refArr).toEqual(
        jasmine.arrayContaining([
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
        ] as TopLevelIdentifier[]),
      );
    });

    it('should discover references to variables', () => {
      const template = `<div *ngFor="let foo of foos" (click)="do(foo)"></div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const variableIdentifier: VariableIdentifier = {
        name: 'foo',
        kind: IdentifierKind.Variable,
        span: new AbsoluteSourceSpan(17, 20),
      };

      const refArr = Array.from(refs);
      expect(refArr).toEqual(
        jasmine.arrayContaining([
          variableIdentifier,
          {
            name: 'foo',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(42, 45),
            target: variableIdentifier,
          },
        ] as TopLevelIdentifier[]),
      );
    });
  });

  describe('let declarations', () => {
    it('should discover references to let declaration', () => {
      const template = `@let foo = 123; <div [someInput]="foo"></div>`;
      const refs = getTemplateIdentifiers(bind(template));
      const letIdentifier: LetDeclarationIdentifier = {
        name: 'foo',
        kind: IdentifierKind.LetDeclaration,
        span: new AbsoluteSourceSpan(5, 8),
      };

      expect(Array.from(refs)).toEqual(
        jasmine.arrayContaining([
          letIdentifier,
          {
            name: 'foo',
            kind: IdentifierKind.Property,
            span: new AbsoluteSourceSpan(34, 37),
            target: letIdentifier,
          },
        ]),
      );
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
      expect(attrs).toEqual(
        new Set<AttributeIdentifier>([
          {
            name: 'attrA',
            kind: IdentifierKind.Attribute,
            span: new AbsoluteSourceSpan(5, 10),
          },
          {
            name: 'attrB',
            kind: IdentifierKind.Attribute,
            span: new AbsoluteSourceSpan(11, 22),
          },
        ]),
      );
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
      expect(usedDirectives).toEqual(
        new Set([
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
          },
        ]),
      );
    });
  });

  describe('generates identifiers for templates', () => {
    it('should record templates as TemplateNodeIdentifiers', () => {
      const template = '<ng-template>';
      const refs = getTemplateIdentifiers(bind(template));
      expect(refs.size).toBe(1);

      const [ref] = Array.from(refs);
      expect(ref.kind).toBe(IdentifierKind.Template);
    });

    it('should record template names as their tag name', () => {
      const template = '<ng-template>';
      const refs = getTemplateIdentifiers(bind(template));
      expect(refs.size).toBe(1);

      const [ref] = Array.from(refs);
      expect(ref as TemplateNodeIdentifier).toEqual({
        name: 'ng-template',
        kind: IdentifierKind.Template,
        span: new AbsoluteSourceSpan(1, 12),
        attributes: new Set(),
        usedDirectives: new Set(),
      });
    });

    it('should discover nested templates', () => {
      const template = '<div><ng-template></ng-template></div>';
      const refs = getTemplateIdentifiers(bind(template));

      const refArr = Array.from(refs);
      expect(refArr).toContain({
        name: 'ng-template',
        kind: IdentifierKind.Template,
        span: new AbsoluteSourceSpan(6, 17),
        attributes: new Set(),
        usedDirectives: new Set(),
      });
    });

    it('should generate information about attributes', () => {
      const template = '<ng-template attrA attrB="val">';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      const attrs = (ref as TemplateNodeIdentifier).attributes;
      expect(attrs).toEqual(
        new Set<AttributeIdentifier>([
          {
            name: 'attrA',
            kind: IdentifierKind.Attribute,
            span: new AbsoluteSourceSpan(13, 18),
          },
          {
            name: 'attrB',
            kind: IdentifierKind.Attribute,
            span: new AbsoluteSourceSpan(19, 30),
          },
        ]),
      );
    });

    it('should generate information about used directives', () => {
      const declB = util.getComponentDeclaration('class B {}', 'B');
      const declC = util.getComponentDeclaration('class C {}', 'C');
      const template = '<ng-template b-selector>';
      const boundTemplate = util.getBoundTemplate(template, {}, [
        {selector: '[b-selector]', declaration: declB},
        {selector: ':not(never-selector)', declaration: declC},
      ]);

      const refs = getTemplateIdentifiers(boundTemplate);
      const [ref] = Array.from(refs);
      const usedDirectives = (ref as ElementIdentifier).usedDirectives;
      expect(usedDirectives).toEqual(
        new Set([
          {
            node: declB,
            selector: '[b-selector]',
          },
          {
            node: declC,
            selector: ':not(never-selector)',
          },
        ]),
      );
    });

    it('should handle interpolations in attributes, preceded by HTML entity', () => {
      const template = `<img src="&nbsp;{{foo}}" />`;
      const refs = getTemplateIdentifiers(bind(template));

      expect(Array.from(refs)).toEqual([
        {
          kind: IdentifierKind.Element,
          name: 'img',
          span: new AbsoluteSourceSpan(1, 4),
          usedDirectives: new Set(),
          attributes: new Set(),
        },
        {
          kind: IdentifierKind.Property,
          name: 'foo',
          span: new AbsoluteSourceSpan(18, 21),
          target: null,
        },
      ]);
    });
  });

  describe('selectorless', () => {
    it('should generate information about selectorless component nodes', () => {
      const compDecl = util.getComponentDeclaration('class Comp {}', 'Comp');
      const fooDecl = util.getComponentDeclaration('class Foo {}', 'Foo');
      const barDecl = util.getComponentDeclaration('class Bar {}', 'Bar');
      const template = '<Comp @Foo @Bar([input]="value")/>';
      const boundTemplate = util.getBoundTemplate(
        template,
        {
          enableSelectorless: true,
        },
        [
          {selector: null, declaration: compDecl},
          {selector: null, declaration: fooDecl},
          {selector: null, declaration: barDecl},
        ],
      );

      const refs = getTemplateIdentifiers(boundTemplate);
      expect(Array.from(refs)).toEqual([
        {
          name: 'Comp',
          span: new AbsoluteSourceSpan(1, 5),
          kind: IdentifierKind.Component,
          attributes: new Set(),
          usedDirectives: new Set([
            {
              node: compDecl,
              selector: null,
            },
          ]),
        },
        {
          name: 'Foo',
          span: new AbsoluteSourceSpan(7, 10),
          kind: IdentifierKind.Directive,
          attributes: new Set(),
          usedDirectives: new Set([
            {
              node: fooDecl,
              selector: null,
            },
          ]),
        },
        {
          name: 'Bar',
          span: new AbsoluteSourceSpan(12, 15),
          kind: IdentifierKind.Directive,
          attributes: new Set(),
          usedDirectives: new Set([
            {
              node: barDecl,
              selector: null,
            },
          ]),
        },
        {
          name: 'value',
          span: new AbsoluteSourceSpan(25, 30),
          kind: IdentifierKind.Property,
          target: null,
        },
      ]);
    });

    it('should generate information about selectorless directives used on a plain element', () => {
      const fooDecl = util.getComponentDeclaration('class Foo {}', 'Foo');
      const barDecl = util.getComponentDeclaration('class Bar {}', 'Bar');
      const template = '<div @Foo @Bar([input]="value")></div>';
      const boundTemplate = util.getBoundTemplate(
        template,
        {
          enableSelectorless: true,
        },
        [
          {selector: null, declaration: fooDecl},
          {selector: null, declaration: barDecl},
        ],
      );

      const refs = getTemplateIdentifiers(boundTemplate);
      expect(Array.from(refs)).toEqual([
        {
          name: 'div',
          span: new AbsoluteSourceSpan(1, 4),
          kind: IdentifierKind.Element,
          attributes: new Set(),
          usedDirectives: new Set(),
        },
        {
          name: 'Foo',
          span: new AbsoluteSourceSpan(6, 9),
          kind: IdentifierKind.Directive,
          attributes: new Set(),
          usedDirectives: new Set([
            {
              node: fooDecl,
              selector: null,
            },
          ]),
        },
        {
          name: 'Bar',
          span: new AbsoluteSourceSpan(11, 14),
          kind: IdentifierKind.Directive,
          attributes: new Set(),
          usedDirectives: new Set([
            {
              node: barDecl,
              selector: null,
            },
          ]),
        },
        {
          name: 'value',
          span: new AbsoluteSourceSpan(24, 29),
          kind: IdentifierKind.Property,
          target: null,
        },
      ]);
    });

    it('should discover references to selectorless components and directives', () => {
      const compDecl = util.getComponentDeclaration('class Comp {}', 'Comp');
      const fooDecl = util.getComponentDeclaration('class Foo {}', 'Foo');
      const template = '<Comp #comp @Foo(#foo)/>';
      const boundTemplate = util.getBoundTemplate(
        template,
        {
          enableSelectorless: true,
        },
        [
          {selector: null, declaration: compDecl},
          {selector: null, declaration: fooDecl},
        ],
      );

      const refs = Array.from(getTemplateIdentifiers(boundTemplate));
      const [compRef, fooRef] = refs as [
        DirectiveHostIdentifier,
        DirectiveHostIdentifier,
        ...unknown[],
      ];

      expect(refs).toEqual([
        {
          name: 'Comp',
          span: new AbsoluteSourceSpan(1, 5),
          kind: IdentifierKind.Component,
          attributes: new Set(),
          usedDirectives: new Set([
            {
              node: compDecl,
              selector: null,
            },
          ]),
        },
        {
          name: 'Foo',
          span: new AbsoluteSourceSpan(13, 16),
          kind: IdentifierKind.Directive,
          attributes: new Set(),
          usedDirectives: new Set([
            {
              node: fooDecl,
              selector: null,
            },
          ]),
        },
        {
          name: 'foo',
          span: new AbsoluteSourceSpan(18, 21),
          kind: IdentifierKind.Reference,
          target: {
            node: fooRef,
            directive: fooDecl,
          },
        },
        {
          name: 'comp',
          span: new AbsoluteSourceSpan(7, 11),
          kind: IdentifierKind.Reference,
          target: {
            node: compRef,
            directive: compDecl,
          },
        },
      ]);
    });
  });
});
