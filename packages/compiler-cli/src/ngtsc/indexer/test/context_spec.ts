/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {R3TargetBinder, SelectorMatcher} from '@angular/compiler/src/compiler';
import {DirectiveMeta} from '../../metadata';
import {IndexingContext} from '../src/context';
import * as util from './util';

describe('ComponentAnalysisContext', () => {
  it('should store and return information about components', () => {
    const context = new IndexingContext();
    const declaration = util.getComponentDeclaration('class C {};', 'C');
    const template = util.getParsedTemplate('<div></div>');
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta>());
    const scope = binder.bind({template});

    context.addComponent({
      declaration,
      selector: 'c-selector', template, scope,
    });
    context.addComponent({
      declaration,
      selector: null,
      template: [],
      scope: null,
    });

    expect(context.components).toEqual(new Set([
      {
        declaration,
        selector: 'c-selector', template, scope,
      },
      {
        declaration,
        selector: null,
        template: [],
        scope: null,
      },
    ]));
  });
});
