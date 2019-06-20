/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceFile, R3TargetBinder, SelectorMatcher} from '@angular/compiler/src/compiler';
import {DirectiveMeta} from '../../metadata';
import {IndexingContext} from '../src/context';
import * as util from './util';

describe('ComponentAnalysisContext', () => {
  it('should store and return information about components', () => {
    const context = new IndexingContext();
    const declaration = util.getComponentDeclaration('class C {};', 'C');
    const templateNodes = util.getParsedTemplate('<div></div>');
    const binder = new R3TargetBinder(new SelectorMatcher<DirectiveMeta>());
    const scope = binder.bind({template: templateNodes});

    context.addComponent({
      declaration,
      selector: 'c-selector',
      template: {
        nodes: templateNodes,
        isInline: false,
        file: new ParseSourceFile('<div></div>', util.TESTFILE),
      },
      scope,
    });
    context.addComponent({
      declaration,
      selector: null,
      template: {
        nodes: [],
        isInline: false,
        file: new ParseSourceFile('', util.TESTFILE),
      },
      scope: null,
    });

    expect(context.components).toEqual(new Set([
      {
        declaration,
        selector: 'c-selector',
        template: {
          nodes: templateNodes,
          isInline: false,
          file: new ParseSourceFile('<div></div>', util.TESTFILE),
        },
        scope,
      },
      {
        declaration,
        selector: null,
        template: {
          nodes: [],
          isInline: false,
          file: new ParseSourceFile('', util.TESTFILE),
        },
        scope: null,
      },
    ]));
  });
});
