/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget} from '@angular/compiler';
import {InterpolationConfig} from '@angular/compiler/src/compiler';
import {DirectiveMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';
import {IndexingContext} from '../src/context';
import {getTemplateIdentifiers} from '../src/template';
import {generateAnalysis} from '../src/transform';

import * as util from './util';

/**
 * Adds information about a component to a context.
 */
function populateContext(
    context: IndexingContext, component: ClassDeclaration, selector: string, template: string,
    scope: BoundTarget<DirectiveMeta>| null) {
  const parsedTemplate = util.getParsedTemplate(template);
  context.addComponent({
    declaration: component,
    template: parsedTemplate, selector, scope,
  });
}

describe('generateAnalysis', () => {
  it('should emit analysis information', () => {
    const context = new IndexingContext();
    const decl = util.getComponentDeclaration('class C {}', 'C');
    populateContext(context, decl, 'c-selector', '<div>{{foo}}</div>', null);
    const analysis = generateAnalysis(context);

    expect(analysis.size).toBe(1);

    const info = analysis.get(decl);
    expect(info).toEqual({
      content: 'class C {}',
      name: 'C',
      selector: 'c-selector',
      sourceFile: util.TESTFILE,
      template: {
        identifiers: getTemplateIdentifiers(util.getParsedTemplate('<div>{{foo}}</div>')),
        usedComponents: new Set(),
      }
    });
  });

  it('should emit used components', () => {
    const context = new IndexingContext();

    const templateA = '<b-selector></b-selector>';
    const declA = util.getComponentDeclaration('class A {}', 'A');

    const templateB = '<a-selector></a-selector>';
    const declB = util.getComponentDeclaration('class B {}', 'B');

    const scopeA = util.bindTemplate(templateA, [{selector: 'b-selector', declaration: declB}]);
    const scopeB = util.bindTemplate(templateB, [{selector: 'a-selector', declaration: declA}]);

    populateContext(context, declA, 'a-selector', templateA, scopeA);
    populateContext(context, declB, 'b-selector', templateB, scopeB);

    const analysis = generateAnalysis(context);

    expect(analysis.size).toBe(2);

    const infoA = analysis.get(declA);
    expect(infoA).toBeDefined();
    expect(infoA !.template.usedComponents).toEqual(new Set([declB]));

    const infoB = analysis.get(declB);
    expect(infoB).toBeDefined();
    expect(infoB !.template.usedComponents).toEqual(new Set([declA]));
  });
});
