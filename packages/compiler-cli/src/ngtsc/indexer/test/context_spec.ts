/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InterpolationConfig, R3TargetBinder, SelectorMatcher} from '@angular/compiler/src/compiler';
import {DirectiveMeta} from '../../metadata';
import {IndexingContext} from '../src/context';
import * as util from './util';

describe('ComponentAnalysisContext', () => {
  const DEFAULT_INTERPOLATION = new InterpolationConfig('{{', '}}');

  it('should store and return information about components', () => {
    const context = new IndexingContext();
    const declaration = util.getComponentDeclaration('class C {};', 'C');
    const selector = 'c-selector';
    const template = util.getParsedTemplate('<div></div>');
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta>());
    const scope = binder.bind({template});

    context.addComponent({
      declaration,
      selector: 'c-selector', template, scope,
      interpolationConfig: DEFAULT_INTERPOLATION,
    });
    context.addComponent({
      declaration,
      selector: null,
      template: [],
      scope: null,
      interpolationConfig: DEFAULT_INTERPOLATION,
    });

    expect(context.components).toEqual(new Set([
      {
        declaration,
        selector: 'c-selector', template, scope,
        interpolationConfig: DEFAULT_INTERPOLATION,
      },
      {
        declaration,
        selector: null,
        template: [],
        scope: null,
        interpolationConfig: DEFAULT_INTERPOLATION,
      },
    ]));
  });

  it('should return declarations of components used in templates', () => {
    const context = new IndexingContext();
    const declaration = util.getComponentDeclaration('class C {}', 'C');
    const templateStr = '<test></test>';
    const template = util.getParsedTemplate(templateStr);

    const usedDecl = util.getComponentDeclaration('class Test {}', 'Test');
    const scope = util.bindTemplate(templateStr, [{selector: 'test', declaration: usedDecl}]);

    context.addComponent({
      declaration,
      selector: 'c-selector', template, scope,
      interpolationConfig: DEFAULT_INTERPOLATION,
    });

    const usedComps = context.getUsedComponents(declaration);
    expect(usedComps).toEqual(new Set([
      usedDecl,
    ]));
  });
});
